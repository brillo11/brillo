"use client";

import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getPublicReviews } from "@/serverActions/review/review.actions";

interface ReviewItem {
  id: string;
  rating: number;
  nickname: string;
  content: string;
  createdAt: string;
  orderName: string;
}

interface PublicReviewListProps {
  orderNamePrefix: string;
}

export function PublicReviewList({ orderNamePrefix }: PublicReviewListProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicReviews({ orderNamePrefix })
      .then((data) => setReviews(data))
      .finally(() => setLoading(false));
  }, [orderNamePrefix]);

  if (loading) {
    return (
      <p className="font-suit text-sm text-[#000000]/50">로딩 중...</p>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="space-y-3">
        <p className="font-suit text-sm text-[#000000]/50">
          등록된 리뷰가 없습니다.
        </p>
        <a
          href="https://kmong.com/gig/534658#gig-rate-evaluation"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-black underline underline-offset-4 hover:text-gray-600"
        >
          더 많은 리뷰보기
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {reviews.map((review) => {
        const normalizedRating = Math.max(1, Math.min(5, review.rating || 5));
        const date = new Date(review.createdAt);
        const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;

        return (
          <div
            key={review.id}
            className="border-b border-[#d4d4d4] pb-5 mb-5 last:border-b-0 last:mb-0"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex flex-col gap-1">
                <div className="flex text-black">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < normalizedRating
                          ? "fill-current"
                          : "text-[#d4d4d4]"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-suit font-bold text-sm text-black">
                  {review.nickname || "익명"}
                </span>
              </div>
              <span className="text-[12px] font-playfair text-[#000000]/50">
                {dateStr}
              </span>
            </div>
            {review.orderName && (
              <div className="text-[12px] font-suit text-[#000000]/50 mb-2">
                {review.orderName}
              </div>
            )}
            <p className="font-suit text-[13px] leading-[20px] text-[#000000]/80 whitespace-pre-line">
              {review.content}
            </p>
          </div>
        );
      })}

      <a
        href="https://kmong.com/gig/534658#gig-rate-evaluation"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm text-black underline underline-offset-4 hover:text-gray-600 mt-2"
      >
        더 많은 리뷰보기
      </a>
    </div>
  );
}
