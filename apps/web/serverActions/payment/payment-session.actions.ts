"use server";

import { prisma, Prisma } from "@repo/database";

interface CreatePaymentSessionRequest {
  orderId: string;
  amount: number;
  orderName: string;
  userId?: bigint;
}

interface ValidatePaymentSessionRequest {
  orderId: string;
  amount: number;
}

const PAYMENT_SESSION_EXPIRY_MINUTES = 5;

export async function createPaymentSession(data: CreatePaymentSessionRequest) {
  try {
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + PAYMENT_SESSION_EXPIRY_MINUTES
    );

    // 기존 세션 정리 (동일한 orderId가 있다면)
    await prisma.paymentSession.deleteMany({
      where: {
        orderId: data.orderId,
      },
    });

    const paymentSession = await prisma.paymentSession.create({
      data: {
        orderId: data.orderId,
        amount: data.amount,
        orderName: data.orderName,
        userId: data.userId,
        expiresAt,
        status: "PENDING",
      },
    });

    console.log("결제 세션 생성:", paymentSession);
    return {
      success: true,
      sessionId: paymentSession.id,
      expiresAt: paymentSession.expiresAt,
    };
  } catch (error) {
    console.error("결제 세션 생성 오류:", error);
    throw new Error("결제 세션 생성에 실패했습니다");
  }
}

export async function validatePaymentSession(
  data: ValidatePaymentSessionRequest
) {
  try {
    const paymentSession = await prisma.paymentSession.findUnique({
      where: { orderId: data.orderId },
    });

    if (!paymentSession) {
      return { valid: false, reason: "결제 세션을 찾을 수 없습니다" };
    }

    // 만료 확인
    if (new Date() > paymentSession.expiresAt) {
      await prisma.paymentSession.update({
        where: { id: paymentSession.id },
        data: { status: "EXPIRED" },
      });
      return { valid: false, reason: "결제 세션이 만료되었습니다" };
    }

    // 금액 확인
    if (paymentSession.amount !== data.amount) {
      return { valid: false, reason: "결제 금액이 일치하지 않습니다" };
    }

    // 상태 확인 - CONFIRMED도 유효한 상태로 처리
    if (paymentSession.status === "EXPIRED") {
      return { valid: false, reason: "만료된 결제 세션입니다" };
    }

    // PENDING 또는 CONFIRMED 모두 허용
    if (paymentSession.status === "CONFIRMED") {
      console.log("이미 확인된 결제 세션이지만 유효함:", data.orderId);
    }

    return { valid: true, session: paymentSession };
  } catch (error) {
    console.error("결제 세션 검증 오류:", error);
    return { valid: false, reason: "결제 세션 검증 중 오류가 발생했습니다" };
  }
}

export async function completePaymentSession(orderId: string) {
  try {
    await prisma.paymentSession.update({
      where: {
        orderId: orderId,
      },
      data: {
        status: "CONFIRMED",
      },
    });

    console.log("결제 세션 완료:", orderId);
    return { success: true };
  } catch (error) {
    console.error("결제 세션 완료 오류:", error);
    throw new Error("결제 세션 완료에 실패했습니다");
  }
}

// 만료된 세션 정리 (배치 작업용)
export async function cleanupExpiredSessions(): Promise<Prisma.BatchPayload> {
  try {
    const result = await prisma.paymentSession.deleteMany({
      where: {
        OR: [
          {
            expiresAt: {
              lt: new Date(),
            },
          },
          {
            status: "EXPIRED",
          },
        ],
      },
    });
    console.log(`만료된 결제 세션 ${result.count}개 정리 완료`);
    return result;
  } catch (error) {
    console.error("만료된 세션 정리 오류:", error);
    throw new Error("만료된 세션 정리에 실패했습니다");
  }
}
