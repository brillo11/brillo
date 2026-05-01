"use server";

import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/shared/lib/auth-guards";

export async function toggleReviewPublishStatus(
  reviewId: bigint,
  newStatus: boolean,
) {
  try {
    await requireAdmin();

    await prisma.review.update({
      where: { id: reviewId },
      data: { isPublished: newStatus },
    });
    revalidatePath("/admin/reviews");
    revalidatePath("/(service)/mypage/reviews"); // in case it is affected
    return { success: true };
  } catch (error) {
    console.error("Failed to update review status:", error);
    return { success: false, error: "상태 변경에 실패했습니다." };
  }
}
