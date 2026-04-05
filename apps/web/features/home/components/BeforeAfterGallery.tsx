import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/shared/lib/utils";

const CAROUSEL_ITEMS = [
  {
    before: "/images/home/before-after-1-before.png",
    after: "/images/home/before-after-1-after.png",
    label: "Case 1",
  },
  {
    before: "/images/home/before-after-2-before.png",
    after: "/images/home/before-after-2-after.png",
    label: "Case 2",
  },
  {
    before: "/images/home/before-after-3-before.png",
    after: "/images/home/before-after-3-after.png",
    label: "Case 3",
  },
  {
    before: "/images/home/before-after-4-before.png",
    after: "/images/home/before-after-4-after.png",
    label: "Case 4",
  },
  {
    before: "/images/home/before-after-5-before.png",
    after: "/images/home/before-after-5-after.png",
    label: "Case 5",
  },
];

const ITEMS_COUNT = CAROUSEL_ITEMS.length;

// For an infinite loop, we prepend the last item and append the first two items
// (appending 2 items ensures the desktop view showing 2 at a time doesn't run empty)
const DISPLAY_ITEMS = [
  CAROUSEL_ITEMS[ITEMS_COUNT - 1], // index 0 (clone of last)
  ...CAROUSEL_ITEMS, // index 1..4
  CAROUSEL_ITEMS[0], // index 5 (clone of first)
  CAROUSEL_ITEMS[1], // index 6 (clone of second)
];

export const BeforeAfterGallery = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleNext = useCallback(() => {
    if (currentIndex >= ITEMS_COUNT + 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex <= 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, [currentIndex]);

  // Handle infinite loop jumping
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (currentIndex === 0) {
      timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(ITEMS_COUNT);
      }, 500); // Wait for transition duration
    } else if (currentIndex === ITEMS_COUNT + 1) {
      timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(1);
      }, 500);
    } else if (!isTransitioning) {
      // Re-enable transition shortly after a jump
      timeout = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
    }
    return () => clearTimeout(timeout);
  }, [currentIndex, isTransitioning]);

  // Auto slide
  useEffect(() => {
    if (isDragging || isHovered) return;
    const timer = setInterval(() => {
      handleNext();
    }, 3000);
    return () => clearInterval(timer);
  }, [isDragging, isHovered, handleNext]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setIsTransitioning(false);
    setStartX(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const diff = currentX - startX;
    setOffsetX(diff);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    if (offsetX < -50) {
      handleNext();
    } else if (offsetX > 50) {
      handlePrev();
    } else {
      setIsTransitioning(true); // Snap back if dragging wasn't enough
    }
    setIsDragging(false);
    setOffsetX(0);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleDotClick = (index: number) => {
    setIsTransitioning(true);
    setCurrentIndex(index + 1);
  };

  const activeIndex = (currentIndex - 1 + ITEMS_COUNT) % ITEMS_COUNT;

  return (
    <div
      className="flex flex-col items-center gap-6 mt-20 select-none touch-pan-y"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex overflow-hidden w-[var(--slide-width)] lg:w-[calc(var(--slide-width)*2+12px)] aspect-[514/340] lg:aspect-[1040/340] [--slide-width:min(calc(100vw-40px),514px)]">
        <div
          className={cn(
            "flex gap-3",
            isTransitioning && "transition-transform duration-500 ease-in-out",
          )}
          style={{
            transform: `translateX(calc(-${currentIndex} * (var(--slide-width) + 12px) + ${offsetX}px))`,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {DISPLAY_ITEMS.map((item, index) => {
            if (!item) return null;
            return (
              <div
                key={index}
                className="relative shrink-0 pointer-events-none w-[var(--slide-width)] h-full"
              >
                <img
                  className="absolute top-0 left-0 w-1/2 h-full object-cover pointer-events-none"
                  alt="Before"
                  src={item.before}
                  draggable={false}
                />
                <img
                  className="absolute top-0 left-1/2 w-1/2 h-full object-cover pointer-events-none"
                  alt="After"
                  src={item.after}
                  draggable={false}
                />
                <div className="absolute bottom-0 left-0 w-full h-[31%] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
                <div className="absolute bottom-[5.5%] left-[25%] -translate-x-1/2 font-playfair font-normal text-white text-lg sm:text-xl text-center tracking-[0] leading-[normal] pointer-events-none">
                  Before
                </div>
                <div className="absolute bottom-[5.5%] left-[75%] -translate-x-1/2 font-playfair font-normal text-white text-lg sm:text-xl text-center tracking-[0] leading-[normal] pointer-events-none">
                  After
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-1.5">
        {CAROUSEL_ITEMS.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className="group relative flex flex-col items-center justify-center cursor-pointer"
            aria-label={`Go to slide ${index + 1}`}
          >
            <img
              className={cn(
                "transition-all duration-300 pointer-events-none",
                index === activeIndex ? "w-[11px] h-[11px]" : "w-[5px] h-[5px]",
              )}
              alt={index === activeIndex ? "Active" : "Inactive"}
              src={
                index === activeIndex
                  ? "/icons/home/shining-fill.svg"
                  : "/icons/home/circle-fill.svg"
              }
              draggable={false}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
