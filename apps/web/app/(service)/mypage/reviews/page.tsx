import React from "react";
import { prisma } from "@repo/database";
import { auth } from "@/shared/lib/auth";
import { headers } from "next/headers";
import { ReviewCard } from "@/shared/components/ReviewCard";

export const dynamic = "force-dynamic";

export default async function MyPageReviews() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return <div className="font-suit pl-4">로그인이 필요합니다.</div>;
  }

  const reviews = await prisma.review.findMany({
    where: {
      userId: session.user.id,
      isPublished: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full">
      <div className="max-w-[700px]">
        <h2 className="font-suit text-lg font-bold text-black border-b border-black pb-3 mb-6">
          내 리뷰 보기
        </h2>

        {reviews.length === 0 ? (
          <div className="py-12 flex justify-center text-[#000000]/50 font-suit text-sm border-b border-[#d4d4d4]">
            작성한 리뷰가 없습니다.
          </div>
        ) : (
          <div className="flex flex-col">
            {reviews.map((review) => (
              <ReviewCard key={review.id.toString()} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
