"use client";

import React, { useEffect, useMemo, useState } from "react";
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

const PAGE_SIZE = 6;

export function PublicReviewList({ orderNamePrefix }: PublicReviewListProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    getPublicReviews({ orderNamePrefix, limit: 100 })
      .then((data) => setReviews(data))
      .finally(() => setLoading(false));
  }, [orderNamePrefix]);

  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    return sum / reviews.length;
  }, [reviews]);

  if (loading) {
    return <p className="font-suit text-sm text-[#000000]/50">로딩 중...</p>;
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

  const visibleReviews = reviews.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="flex text-black">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < Math.round(average) ? "fill-current" : "text-[#d4d4d4]"
              }`}
            />
          ))}
        </div>
        <span className="font-suit font-bold text-lg text-black">
          {average.toFixed(1)}
        </span>
        <span className="font-suit text-sm text-black/50">
          ({reviews.length}건)
        </span>
      </div>

      <div className="flex flex-col gap-0">
        {visibleReviews.map((review) => {
          const normalizedRating = Math.max(1, Math.min(5, review.rating || 5));
          const date = new Date(review.createdAt);
          const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;

          return (
            <div
              key={review.id}
              className="border-b border-[#d4d4d4] py-6 first:pt-0 last:border-b-0"
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
      </div>

      {visibleCount < reviews.length && (
        <button
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          className="h-[44px] w-full border border-black text-sm hover:bg-gray-50 transition-colors"
        >
          더보기
        </button>
      )}
    </div>
  );
}
