"use server";

import { prisma } from "@repo/database";

export async function getPublicReviews(options?: {
  orderNamePrefix?: string;
  limit?: number;
}) {
  try {
    const { orderNamePrefix, limit = 20 } = options || {};

    const reviews = await prisma.review.findMany({
      where: {
        isPublished: true,
        ...(orderNamePrefix
          ? {
              order: {
                orderName: {
                  startsWith: orderNamePrefix,
                },
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        order: {
          select: {
            orderName: true,
            amount: true,
          },
        },
      },
    });

    // Serialize BigInt for client
    return reviews.map((r) => ({
      id: r.id.toString(),
      rating: r.rating,
      nickname: r.nickname,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
      orderName: (r.order as any)?.orderName || "",
    }));
  } catch (error) {
    console.error("리뷰 조회 오류:", error);
    return [];
  }
}
