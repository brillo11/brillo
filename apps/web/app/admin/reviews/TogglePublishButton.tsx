"use client";

import { useState } from "react";
import { toast } from "sonner";
import { toggleReviewPublishStatus } from "./actions";

interface Props {
  reviewId: bigint;
  isPublished: boolean;
}

export function TogglePublishButton({ reviewId, isPublished }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const result = await toggleReviewPublishStatus(reviewId, !isPublished);
      if (result.success) {
        toast.success(
          !isPublished
            ? "리뷰가 노출되었습니다."
            : "리뷰가 숨김 처리되었습니다.",
        );
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors ${
        isPublished
          ? "bg-green-100 text-green-800 hover:bg-green-200"
          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
      }`}
    >
      {isLoading ? "처리중..." : isPublished ? "노출 중" : "숨김 (비노출)"}
    </button>
  );
}
