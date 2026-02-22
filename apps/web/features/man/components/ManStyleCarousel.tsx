"use client";

import { useState, useCallback } from "react";
import { cn } from "@/shared/lib/utils";

const IMAGES = [
  "/page/man/process1.png",
  "/page/man/process2.png",
  "/page/man/process3.png",
  "/page/man/process4.png",
];

export function ManStyleCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + IMAGES.length) % IMAGES.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="mt-32 w-full flex flex-col items-center">
      {/* Carousel Container */}
      <div className="relative w-[483px] max-w-full aspect-[0.75] overflow-hidden">
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {IMAGES.map((src, index) => (
            <img
              key={index}
              className="w-full h-full object-cover flex-shrink-0"
              alt={`Style ${index + 1}`}
              src={src}
            />
          ))}
        </div>
        {/* Optional: Side Click Areas for Navigation */}
        <div className="absolute inset-0 flex z-20">
          <div className="w-1/2 h-full cursor-pointer" onClick={handlePrev} />
          <div className="w-1/2 h-full cursor-pointer" onClick={handleNext} />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-10 mb-10 flex justify-center gap-1.5 z-20 relative">
        {IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className="group relative flex flex-col items-center justify-center"
          >
            <img
              className={cn(
                "transition-all duration-300 brightness-0",
                currentIndex === i ? "w-[11px] h-[11px]" : "w-[5px] h-[5px]",
              )}
              alt={currentIndex === i ? "Active" : "Inactive"}
              src={
                currentIndex === i
                  ? "/icons/home/shining-fill.svg"
                  : "/icons/home/circle-fill.svg"
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
}
