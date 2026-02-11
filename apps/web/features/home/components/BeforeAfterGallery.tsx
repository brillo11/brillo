import React, { useState } from "react";
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
    before: "/images/home/before-after-1-before.png",
    after: "/images/home/before-after-1-after.png",
    label: "Case 3",
  },
  {
    before: "/images/home/before-after-2-before.png",
    after: "/images/home/before-after-2-after.png",
    label: "Case 4",
  },
];

export const BeforeAfterGallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="flex flex-col items-center gap-8 mt-20">
      <div className="relative w-[1024px] h-[680px] flex overflow-hidden">
        {CAROUSEL_ITEMS.map((item, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-500 flex",
              index === currentIndex
                ? "opacity-100 z-10"
                : "opacity-0 z-0 pointer-events-none",
            )}
          >
            <img
              className="w-[510px] h-[680px] aspect-[0.75] object-cover"
              alt="Before"
              src={item.before}
            />
            <img
              className="w-[510px] h-[680px] aspect-[0.75] object-cover"
              alt="After"
              src={item.after}
            />
            <div className="absolute top-[468px] left-0 w-[1020px] h-[212px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_100%)]" />
            <div className="absolute top-[632px] left-[255px] -translate-x-1/2 font-playfair font-normal text-white text-xl text-center tracking-[0] leading-[normal]">
              Before
            </div>
            <div className="absolute top-[632px] left-[765px] -translate-x-1/2 font-playfair font-normal text-white text-xl text-center tracking-[0] leading-[normal]">
              After
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-1.5">
        {CAROUSEL_ITEMS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="group relative flex flex-col items-center justify-center"
          >
            <img
              className={cn(
                "transition-all duration-300 ",
                index === currentIndex
                  ? "w-[11px] h-[11px]"
                  : "w-[5px] h-[5px]",
              )}
              alt={index === currentIndex ? "Active" : "Inactive"}
              src={
                index === currentIndex
                  ? "/icons/home/shining-fill.svg"
                  : "/icons/home/circle-fill.svg"
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
};
