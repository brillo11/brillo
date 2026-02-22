"use server";

import { prisma } from "@repo/database";
import { auth } from "@/shared/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function submitReviewAction(formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const orderId = formData.get("orderId")?.toString();
    const ratingStr = formData.get("rating")?.toString();
    const nickname = formData.get("nickname")?.toString() || "익명";
    const content = formData.get("content")?.toString() || "";

    if (!orderId || !ratingStr) {
      return { success: false, error: "필수 정보가 누락되었습니다." };
    }

    const rating = parseInt(ratingStr, 10);
    const parsedOrderId = BigInt(orderId);

    // Verify order exists, belongs to user, and is paid
    const order = await prisma.order.findUnique({
      where: { id: parsedOrderId },
      include: { review: true },
    });

    if (!order) {
      return { success: false, error: "주문을 찾을 수 없습니다." };
    }

    if (order.userId !== session.user.id) {
      return { success: false, error: "권한이 없습니다." };
    }

    if (order.status !== "결제완료") {
      return {
        success: false,
        error: "결제가 완료된 주문만 리뷰를 작성할 수 있습니다.",
      };
    }

    if (order.review) {
      return { success: false, error: "이미 리뷰가 작성된 주문입니다." };
    }

    // Create review
    await prisma.review.create({
      data: {
        rating,
        nickname,
        content,
        userId: session.user.id,
        orderId: parsedOrderId,
        isPublished: true,
      },
    });

    revalidatePath("/(service)/mypage/orders");
    revalidatePath("/(service)/mypage/reviews");

    return { success: true };
  } catch (error) {
    console.error("Failed to submit review:", error);
    return { success: false, error: "리뷰 작성에 실패했습니다." };
  }
}
