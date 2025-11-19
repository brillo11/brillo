"use server";

import { prisma } from "@repo/database";
import { requireStudent } from "@/shared/lib/auth-guards";

/**
 * 주문 조회 (merchantUid 또는 id로)
 */
export async function getOrderById(orderId: string) {
  const session = await requireStudent();
  
  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  try {
    // 먼저 merchantUid로 시도
    let order = await prisma.order.findUnique({
      where: { merchantUid: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nickname: true,
            email: true,
          },
        },
      },
    });

    // merchantUid로 찾지 못하면 id로 시도
    if (!order) {
      const numericId = BigInt(orderId);
      order = await prisma.order.findUnique({
        where: { id: numericId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              nickname: true,
              email: true,
            },
          },
        },
      });
    }

    if (!order) {
      throw new Error("주문을 찾을 수 없습니다.");
    }

    // 본인의 주문인지 확인
    if (order.userId !== session.user.id) {
      throw new Error("접근 권한이 없습니다.");
    }

    return order;
  } catch (error) {
    console.error("주문 조회 오류:", error);
    throw error instanceof Error ? error : new Error("주문 조회에 실패했습니다.");
  }
}

