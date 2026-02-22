"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { submitReviewAction } from "./actions";
import { toast } from "sonner";
import Link from "next/link";

export function ReviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [rating, setRating] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  if (!orderId) {
    return (
      <div className="font-suit text-sm">
        잘못된 접근입니다. 주문 번호가 필요합니다.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append("orderId", orderId);
      formData.append("rating", rating.toString());

      const result = await submitReviewAction(formData);

      if (result.success) {
        toast.success("리뷰가 등록되었습니다.");
        router.push("/mypage/reviews");
        router.refresh(); // Ensure the layout/pages refresh their state
      } else {
        toast.error(result.error || "오류가 발생했습니다.");
      }
    } catch (error) {
      toast.error("리뷰 등록 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="font-suit font-bold text-sm text-[#000000]/80">
          별점
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="text-2xl transition-transform hover:scale-110"
            >
              <span
                className={star <= rating ? "text-yellow-400" : "text-gray-300"}
              >
                ★
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="nickname"
          className="font-suit font-bold text-sm text-[#000000]/80"
        >
          닉네임 (선택)
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          placeholder="익명"
          className="w-full border border-[#d4d4d4] p-3 text-sm font-suit focus:outline-none focus:border-black"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="content"
          className="font-suit font-bold text-sm text-[#000000]/80"
        >
          리뷰 내용
        </label>
        <textarea
          id="content"
          name="content"
          rows={5}
          required
          placeholder="도움이 되는 리뷰를 남겨주세요."
          className="w-full border border-[#d4d4d4] p-3 text-sm font-suit focus:outline-none focus:border-black resize-none"
        />
      </div>

      <div className="flex gap-3 justify-end mt-4">
        <Link
          href="/mypage/orders"
          className="px-6 py-3 font-suit font-medium text-sm border border-[#d4d4d4] text-[#000000]/80 hover:bg-gray-50 transition-colors"
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 font-suit font-medium text-sm bg-black text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "등록 중..." : "리뷰 등록"}
        </button>
      </div>
    </form>
  );
}
