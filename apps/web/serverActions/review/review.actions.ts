"use server";

import { prisma } from "@repo/database";

// Some legacy orderNames have the customer's real name appended as a
// trailing "(이름)" group, e.g. "Man > Visual Consulting (80분) (박희우)".
// Strip that trailing group before this ever reaches the client so real
// names are never exposed publicly, while keeping legitimate info like
// "(80분)" intact.
function stripCustomerName(orderName: string): string {
  const groups = orderName.match(/\([^()]*\)/g);
  if (!groups || groups.length < 2) return orderName;
  const last = groups[groups.length - 1] ?? "";
  if (!last) return orderName;
  const lastIndex = orderName.lastIndexOf(last);
  return (
    orderName.slice(0, lastIndex) + orderName.slice(lastIndex + last.length)
  ).trim();
}

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
      orderName: stripCustomerName((r.order as any)?.orderName || ""),
    }));
  } catch (error) {
    console.error("리뷰 조회 오류:", error);
    return [];
  }
}
