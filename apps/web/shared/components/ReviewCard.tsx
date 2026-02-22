import React from "react";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { Review } from "@repo/database";

interface ReviewCardProps {
  review: Review;
  className?: string;
}

export function ReviewCard({ review, className = "" }: ReviewCardProps) {
  // 별점을 1~5점 사이로 한정
  const normalizedRating = Math.max(1, Math.min(5, review.rating || 5));

  return (
    <div
      className={`border-b border-[#d4d4d4] pb-6 mb-6 last:border-b-0 last:mb-0 text-left transition-opacity ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col gap-1">
          <div className="flex text-black">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < normalizedRating ? "fill-current" : "text-[#d4d4d4]"
                }`}
              />
            ))}
          </div>
          <span className="font-suit font-bold text-black mt-1">
            {review.nickname || "익명"}
          </span>
        </div>
        <div className="text-[13px] font-playfair text-[#000000]/60 mt-1">
          {format(new Date(review.createdAt), "yyyy.MM.dd")}
        </div>
      </div>
      <p className="font-suit text-[14px] leading-[21px] text-[#000000]/80 whitespace-pre-line">
        {review.content}
      </p>
    </div>
  );
}
