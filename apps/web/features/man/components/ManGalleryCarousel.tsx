"use client";

import React, { useState, useRef, useEffect } from "react";

const GALLERY_ITEMS = [
  {
    before: "/page/man/before-1.png",
    after: "/page/man/after-1.png",
    label: "Case 1",
  },
  {
    before: "/page/man/before-2.png",
    after: "/page/man/after-2.png",
    label: "Case 2",
  },
  {
    before: "/page/man/before-3.png",
    after: "/page/man/after-3.png",
    label: "Case 3",
  },
  {
    before: "/page/man/before-4.png",
    after: "/page/man/after-4.png",
    label: "Case 4",
  },
  {
    before: "/page/man/before-5.png",
    after: "/page/man/after-5.png",
    label: "Case 5",
  },
  {
    before: "/page/man/before-6.png",
    after: "/page/man/after-6.png",
    label: "Case 6",
  },
  {
    before: "/page/man/before-7.png",
    after: "/page/man/after-7.png",
    label: "Case 7",
  },
];

// Replicate logic from ReviewsCarousel
const EXTENDED_GALLERY = [
  ...GALLERY_ITEMS,
  ...GALLERY_ITEMS,
  ...GALLERY_ITEMS,
  ...GALLERY_ITEMS,
  ...GALLERY_ITEMS,
  ...GALLERY_ITEMS,
];
const REAL_LENGTH = GALLERY_ITEMS.length;

// Item dimensions: w-[514px] + gap-1 (4px) = 518px
const ITEM_WIDTH = 514;
const GAP = 4;
const ITEM_TOTAL_WIDTH = ITEM_WIDTH + GAP;
const TOTAL_SET_WIDTH = REAL_LENGTH * ITEM_TOTAL_WIDTH;

export const ManGalleryCarousel = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);

  const positionRef = useRef(0);
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

  useEffect(() => {
    positionRef.current = TOTAL_SET_WIDTH * 2;
  }, []);

  useEffect(() => {
    const loop = (time: number) => {
      if (lastTimeRef.current) {
        // Dynamic Speed: Faster on mobile (0.7px), normal on desktop (0.5px)
        const speed = viewportWidth < 768 ? 0.7 : 0.5;
        positionRef.current += speed;

        if (positionRef.current >= TOTAL_SET_WIDTH * 3) {
          positionRef.current -= TOTAL_SET_WIDTH;
        }
      }
      lastTimeRef.current = time;

      if (trackRef.current && viewportWidth > 0) {
        const translateX =
          viewportWidth / 2 - positionRef.current - ITEM_WIDTH / 2;
        trackRef.current.style.transform = `translateX(${translateX}px)`;
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [viewportWidth]);

  return (
    <div className="w-full bg-[#f7f3f0] relative flex flex-col items-center justify-start overflow-hidden">
      <div
        className="w-full overflow-hidden relative z-10 h-[340px]"
        ref={viewportRef}
      >
        <div
          ref={trackRef}
          className="flex absolute left-0"
          style={{ willChange: "transform" }}
        >
          {EXTENDED_GALLERY.map((item, i) => (
            <div key={i} className="relative w-[510px] h-[340px] shrink-0">
              <img
                className="absolute top-0 left-0 w-[255px] h-[340px] aspect-[0.75] object-cover"
                alt="Before"
                src={item.before}
              />
              <img
                className="absolute top-0 right-0 w-[255px] h-[340px] aspect-[0.75] object-cover"
                alt="After"
                src={item.after}
              />
              <div className="absolute top-[234px] left-0 w-full h-[106px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_100%)]" />
              <div className="absolute top-[301px] left-[98px] font-playfair font-normal text-white text-xl text-center tracking-[0] leading-[normal]">
                Before
              </div>
              <div className="absolute top-[301px] right-[98px] font-playfair font-normal text-white text-xl text-center tracking-[0] leading-[normal]">
                After
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side Gradients */}
      <div className="absolute top-0 left-0 w-24 h-full bg-[linear-gradient(90deg,rgba(247,243,240,1)_0%,rgba(247,243,240,0)_100%)] pointer-events-none z-20" />
      <div className="absolute top-0 right-0 w-24 h-full bg-[linear-gradient(270deg,rgba(247,243,240,1)_0%,rgba(247,243,240,0)_100%)] pointer-events-none z-20" />
    </div>
  );
};
