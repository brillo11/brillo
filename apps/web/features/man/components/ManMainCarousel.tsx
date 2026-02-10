"use client";

import { useState } from "react";

const IMAGES = [
  "/page/man/vip-man-1-1.png",
  "/page/man/vip-man-1-2.png",
  "/page/man/vip-man-1-3.png",
  "/page/man/vip-man-1-4.png",
];

export function ManMainCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const clickRatio = x / width;

    // Calculate index based on the number of segments
    const newIndex = Math.min(
      Math.max(Math.floor(clickRatio * IMAGES.length), 0),
      IMAGES.length - 1,
    );

    setCurrentIndex(newIndex);
  };

  // Calculate the left position of the indicator
  // Total width: 158px (parent)
  // Indicator width: 32px (w-8 = 2rem = 32px)
  // Max travel distance: 158 - 32 = 126px
  // Step size: 126 / (should be handled by percentage or precise calculation)
  // Let's use percentage for responsiveness if needed, but the original was fixed width.
  // 158px container.
  // const progressPercentage = (currentIndex / (IMAGES.length - 1)) * 100;
  // But we need to account for the indicator width.
  // Let's uscalc() in style.
  // left = calc( (100% - 32px) * (currentIndex / (total - 1)) )

  return (
    <div className="flex flex-col gap-8 items-center">
      <div className="relative w-[297px] h-[297px] overflow-hidden">
        {IMAGES.map((src, index) => (
          <img
            key={src}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            alt={`Vip woman ${index + 1}`}
            src={src}
          />
        ))}
      </div>

      <button
        onClick={handleClick}
        className="w-[158px] h-1 bg-[#d9d9d9] rounded-[300px] relative cursor-pointer outline-none"
        aria-label="Select image"
      >
        <div
          className="absolute top-0 h-1 bg-[#6f6f6f] rounded-[300px] w-9 transition-all duration-300 ease-in-out"
          style={{
            left: `calc((100% - 36px) * ${currentIndex / (IMAGES.length - 1)})`,
          }}
        />
      </button>
    </div>
  );
}
