import React, { Suspense } from "react";
import { ReviewForm } from "./ReviewForm";

export default function NewReviewPage() {
  return (
    <div className="w-full">
      <div className="max-w-[700px]">
        <h2 className="font-suit text-lg font-bold text-black border-b border-black pb-3 mb-6">
          리뷰 남기기
        </h2>

        <Suspense
          fallback={<div className="font-suit text-sm">로딩 중...</div>}
        >
          <ReviewForm />
        </Suspense>
      </div>
    </div>
  );
}
