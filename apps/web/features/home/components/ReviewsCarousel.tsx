import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/shared/lib/utils";

const REVIEWS = [
  {
    age: "남 42세, 이○○, 노량진 1타 강사",
    stars: "/images/home/review-stars-1.png",
    starsWidth: "15px",
    text: (
      <>
        “브릴로 서비스를 받고 나서 외모뿐 아니라 <br />
        라이프스타일까지 바뀌었습니다.
        <br />
        수강생들도, 동료 강사들도, 지인들도 <br />
        저를 대하는 태도가 달라졌거든요.
        <br />
        지금은 비주얼은 물론 인테리어, 리빙, 호텔 등 전부 <br />
        대표님의 감각을 믿고 매니지먼트를 맡깁니다.”
      </>
    ),
  },
  {
    age: "여 30세, 정○○, 온라인 강사",
    stars: "/images/home/review-stars-2.png",
    starsWidth: "58px",
    text: (
      <>
        “상담에서 제 니즈를 바로 캐치하는 순간 <br />
        프로임을 느꼈어요. 어느 것 하나 <br />
        대충 하지 않는게 신뢰가 확 생기더라고요.
        <br />그 덕에 제 매력을 극대화하는 비주얼을 <br />
        확실히 알았습니다.”
      </>
    ),
  },
  {
    age: "남 24세, 이○, 인플루언서 지망",
    stars: "/images/home/review-stars-2.png",
    starsWidth: "58px",
    text: (
      <>
        “컨설팅 받고 난 뒤 인생에서 제일 행복한 <br />
        생일을 보냈어요.외모 스트레스가 사라지고, <br />
        매일 변하는 제 모습이 보여요.
        <br />
        자신감도 엄청 올라서 꼭 주변에 추천하고 싶어요.”
      </>
    ),
  },
  {
    age: "여 34세, 강○○, 개인 브랜드 대표",
    stars: "/images/home/review-stars-2.png",
    starsWidth: "58px",
    text: (
      <>
        “이렇게 전체 상태를 정확하게 <br />
        정리해준 곳은처음이에요. 영업이 아닌 <br />
        솔직한 추천이라 신뢰도가 진짜 높아요.
        <br />
        앞으로 외모 고민은 무조건 여기로 올 거예요.”
      </>
    ),
  },
  {
    age: "남 20세, 김○○, 아이돌 지망생",
    stars: "/images/home/review-stars-3.png",
    starsWidth: "15px",
    text: (
      <>
        “연습생이라 외모가 중요한데 해야 할 걸 <br />딱 정리해줘서 큰 도움이
        됐어요.
        <br />
        우선순위가 잡히니까 불안이 사라지고 <br />
        자신감이 생기더라고요. 대형 엔터 출신 답게 ‘화면에 어떻게 보여야
        하는지’까지 정확히 알려줘요.”
      </>
    ),
  },
];

// Create a large enough list for smooth infinite scrolling
// 5 items * 6 = 30 items, should be plenty to cover screen and allow seamless loop
const EXTENDED_REVIEWS = [
  ...REVIEWS,
  ...REVIEWS,
  ...REVIEWS,
  ...REVIEWS,
  ...REVIEWS,
  ...REVIEWS,
];
const REAL_LENGTH = REVIEWS.length;

// Items are 294px wide + 32px gap = 326px per item
const ITEM_WIDTH = 294;
const GAP = 32;
const ITEM_TOTAL_WIDTH = ITEM_WIDTH + GAP;
const TOTAL_SET_WIDTH = REAL_LENGTH * ITEM_TOTAL_WIDTH;

export const ReviewsCarousel = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);

  // Use a ref for position to avoid re-renders on every frame
  const positionRef = useRef(0);
  const [displayPosition, setDisplayPosition] = useState(0); // Only for syncing state if needed, or use forceUpdate
  // Actually we can just update the style directly for performance, but we need React state for "active" highlighting.
  // To avoid 60fps React renders, we can calculate active index in the loop and only update state when it changes.

  const [activeIndex, setActiveIndex] = useState(0);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!viewportRef.current) return;
    setViewportWidth(viewportRef.current.offsetWidth);

    const handleResize = () => {
      if (viewportRef.current) {
        setViewportWidth(viewportRef.current.offsetWidth);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize position to have the first set in the middleish or just reset gracefully
  // Let's start at a position where the first item is centered?
  // Or just 0 and let it scroll.
  // Actually, to make infinite scrolling seamless, we want to start somewhere in the middle of our huge array.
  // Let's start at offset = TOTAL_SET_WIDTH * 2 (so we have buffer on left)
  // And we will modulate the position to keep it within a safe range.

  useEffect(() => {
    // Initial setup
    positionRef.current = TOTAL_SET_WIDTH * 2;
  }, []);

  useEffect(() => {
    const loop = (time: number) => {
      if (lastTimeRef.current) {
        // const deltaTime = time - lastTimeRef.current;
        // Move left automatically
        // Speed: pixels per frame. Let's say 0.5px per frame for "slowly flowing"
        positionRef.current += 0.5; // 1px per frame roughly 60px/sec

        // Reset logic: if we moved past one full set, subtract one full set width
        // We move to right (swiping left visually means content moves left, so x decreases?)
        // Wait, "automatic scroll" usually means content moves to Left.
        // So position (translateX) decreases.
        // Let's increment position and treat it as "distance moved".
        // If we want content to move Left, translateX must be -position.

        // If we have moved more than TOTAL_SET_WIDTH, we can subtract TOTAL_SET_WIDTH from position
        // without visual jump because the sets are identical.
        if (positionRef.current >= TOTAL_SET_WIDTH * 3) {
          positionRef.current -= TOTAL_SET_WIDTH;
        }
      }
      lastTimeRef.current = time;

      // Update DOM directly for performance
      if (trackRef.current && viewportWidth > 0) {
        // We want to center the content around the viewport center.
        // Current 'position' is how much we've scrolled.
        // Center of container = viewportWidth / 2
        // We want the item at 'position' to be roughly at center?
        // Let's say translateX = (viewportWidth / 2) - position
        // And we ensure 'position' points to the center of some item.

        // Refined math:
        // currentScroll = positionRef.current
        // translateX = (viewportWidth / 2) - currentScroll - (ITEM_WIDTH / 2)
        // This makes 'currentScroll' represent the x-coordinate of the center of the item we want at screen center.

        const translateX =
          viewportWidth / 2 - positionRef.current - ITEM_WIDTH / 2; // Adjust for centering logic
        // GAP/2 because the item wrapper includes gap? No, flex gap is outside.
        // Let's stick to standard marquee: transform: translateX(-position) + centeringOffset
        // But simply:
        trackRef.current.style.transform = `translateX(${translateX}px)`;
      }

      // Calculate active index
      // The item closest to the center is the one where its center is closest to positionRef.current
      // positionRef.current is essentially the distance from start of the list to the center of the viewport.
      // Index = Math.round((positionRef.current) / ITEM_TOTAL_WIDTH)
      const exactIndex = positionRef.current / ITEM_TOTAL_WIDTH;
      const roundedIndex = Math.round(exactIndex);
      // Map back to 0-4 range
      const normalizedIndex =
        ((roundedIndex % REAL_LENGTH) + REAL_LENGTH) % REAL_LENGTH;

      setActiveIndex(normalizedIndex);

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [viewportWidth]); // Re-bind if container width changes

  // Click handling: manual navigation
  // If user clicks a dot or item, we should smoothly scroll there.
  // But mixing manual and auto marquee is complex.
  // Simplest: Snap positionRef to the target item immediately (or smooth) and pause/resume.
  // For now, let's just make it snap to that item in the current "set" context.

  const handleInteract = (targetModIndex: number) => {
    // Find closest instance of targetModIndex to current position
    const currentPos = positionRef.current;
    const currentModIndex = Math.round(currentPos / ITEM_TOTAL_WIDTH);

    // We want a target index T such that T % REAL_LENGTH == targetModIndex
    // And T is close to currentModIndex

    // Simple way:
    // delta = targetModIndex - (currentModIndex % REAL_LENGTH)
    // targetIndex = currentModIndex + delta
    // But we need to handle wrapping of delta to be shortest path

    let delta = targetModIndex - (currentModIndex % REAL_LENGTH);
    if (delta > REAL_LENGTH / 2) delta -= REAL_LENGTH;
    if (delta < -REAL_LENGTH / 2) delta += REAL_LENGTH;

    const targetIndex = currentModIndex + delta;
    positionRef.current = targetIndex * ITEM_TOTAL_WIDTH;

    // Force update visual immediately
    if (trackRef.current) {
      const translateX =
        viewportWidth / 2 - positionRef.current - ITEM_WIDTH / 2;
      trackRef.current.style.transform = `translateX(${translateX}px)`;
    }
  };

  return (
    <div className="block relative">
      <div className="left-0 w-full h-[372px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,1)_100%)] flex flex-col justify-center items-center">
        <p className="font-suit font-normal text-white text-[26.2px] text-center tracking-[0] leading-[39.3px]">
          <span className="font-medium">
            실제 고객의 변화, <br />
            그들의 이야기가{" "}
          </span>
          <span className="font-playfair font-medium">BRILLO</span>
          <span className="font-medium">의 증거입니다.</span>
        </p>
      </div>

      <div className="left-0 w-full bg-black relative flex flex-col items-center justify-start py-20 overflow-hidden">
        {/* Side Gradients */}
        <div className="absolute top-1/2 -translate-y-1/2 left-[-106px] w-[408px] h-[196px] rotate-90 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,1)_100%)] z-20 pointer-events-none" />
        <div className="absolute top-1/2 -translate-y-1/2 right-[-106px] w-[408px] h-[196px] rotate-270 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,1)_100%)] z-20 pointer-events-none" />

        <div
          className="w-full overflow-hidden relative z-10 h-[200px]"
          ref={viewportRef}
        >
          {/* Container for absolute positioning of track */}
          <div
            ref={trackRef}
            className="flex gap-8 absolute left-0"
            style={{ willChange: "transform" }}
          >
            {EXTENDED_REVIEWS.map((review, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col w-[294px] items-center gap-2 relative flex-shrink-0 cursor-pointer transition-all duration-300",
                  i % REAL_LENGTH === activeIndex
                    ? "opacity-100 scale-100"
                    : "opacity-50 hover:opacity-100 scale-95",
                )}
                onClick={() => handleInteract(i % REAL_LENGTH)}
              >
                <p className="relative self-stretch mt-[-1.00px] font-suit font-light text-white text-xl text-center tracking-[0] leading-[30px]">
                  {review.age}
                </p>
                <img
                  className="relative h-[11.6px]"
                  style={{ width: review.starsWidth }}
                  alt="Stars"
                  src={review.stars}
                />
                <p className="relative self-stretch bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.5)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] font-suit font-light text-transparent text-sm text-center tracking-[0] leading-[21px]">
                  {review.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-1.5 z-20 relative">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              onClick={() => handleInteract(i)}
              className="group relative flex flex-col items-center justify-center"
            >
              <img
                className={cn(
                  "transition-all duration-300",
                  activeIndex === i ? "w-[11px] h-[11px]" : "w-[5px] h-[5px]",
                )}
                alt={activeIndex === i ? "Active" : "Inactive"}
                src={
                  activeIndex === i
                    ? "/icons/home/shining-fill.svg"
                    : "/icons/home/circle-fill.svg"
                }
              />
            </button>
          ))}
        </div>

        <div className="font-pretendard font-medium text-[#ffffff99] text-sm tracking-[-0.28px] leading-[normal] underline cursor-pointer hover:text-white transition-colors mt-10">
          더 많은 리뷰 보기→
        </div>
      </div>
    </div>
  );
};
