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

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="flex flex-col items-center gap-8 mt-20">
      <div className="relative w-[514px] lg:w-[1040px] h-[340px] flex overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out gap-3"
          style={{ transform: `translateX(-${currentIndex * (514 + 12)}px)` }}
        >
          {CAROUSEL_ITEMS.map((item, index) => (
            <div key={index} className="relative w-[514px] h-[340px] shrink-0">
              <img
                className="absolute top-0 left-0 w-[255px] h-[340px] aspect-[0.75] object-cover"
                alt="Before"
                src={item.before}
              />
              <img
                className="absolute top-0 left-[255px] w-[255px] h-[340px] aspect-[0.75] object-cover"
                alt="After"
                src={item.after}
              />
              <div className="absolute top-[234px] left-0 w-[510px] h-[106px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_100%)]" />
              <div className="absolute top-[301px] left-[98px] font-playfair font-normal text-white text-xl text-center tracking-[0] leading-[normal]">
                Before
              </div>
              <div className="absolute top-[301px] left-[359px] font-playfair font-normal text-white text-xl text-center tracking-[0] leading-[normal]">
                After
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-1.5">
        {CAROUSEL_ITEMS.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={cn(
              "group relative flex flex-col items-center justify-center",
              index === CAROUSEL_ITEMS.length - 1 && "lg:hidden",
            )}
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
