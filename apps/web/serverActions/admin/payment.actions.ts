"use server";

import { prisma, REFUND_STATUS } from "@repo/database";

/**
 * 결제 환불 정보 조회
 */
export async function getRefundInfo(paymentId: bigint) {
  const order = await prisma.order.findUnique({
    where: { id: paymentId },
    include: { user: true },
  });

  if (!order) throw new Error("결제 정보를 찾을 수 없습니다.");

  // 결제 후 경과 시간에 따른 환불 규정 적용
  const paymentDate = new Date(order.createdAt);
  const now = new Date();
  const daysPassed = Math.floor(
    (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  let refundAmount = 0;
  if (daysPassed <= 7) {
    refundAmount = order.amount; // 7일 이내 전액 환불
  } else if (daysPassed <= 30) {
    refundAmount = Math.floor(order.amount * 0.5); // 30일 이내 50% 환불
  } else {
    refundAmount = 0; // 30일 초과 시 환불 불가
  }

  return {
    paymentAmount: order.amount,
    daysPassed,
    refundAmount,
    userName: order.user?.name || (order.description ? JSON.parse(order.description)?.reservationInfo?.name : null) || "비회원",
    orderName: order.orderName,
  };
}

/**
 * 환불 처리
 */
export async function processRefund(
  paymentId: bigint,
  refundAmount: number,
  reason: string
) {
  const order = await prisma.order.findUnique({ where: { id: paymentId } });
  if (!order) throw new Error("결제 정보를 찾을 수 없습니다.");

  // 환불 기록 생성
  const refund = await prisma.refund.create({
    data: {
      orderId: paymentId,
      amount: refundAmount,
      reason,
      status: REFUND_STATUS.PENDING,
    },
  });

  // 결제 정보 업데이트
  await prisma.order.update({
    where: { id: paymentId },
    data: {
      isRefunded: true,
      refundedAt: new Date(),
      refundAmount,
      refundReason: reason as string,
    },
  });

  return refund;
}
