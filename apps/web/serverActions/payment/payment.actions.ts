"use server";

import { prisma, ORDER_STATUS, REFUND_STATUS } from "@repo/database";
import {
  validatePaymentSession,
  completePaymentSession,
} from "./payment-session.actions";
import { revalidatePath } from "next/cache";
import { Order } from "@repo/database";
import { Refund } from "@repo/database";

interface PaymentRequest {
  amount: number;
  orderId: string;
  orderName: string;
  customerName: string;
  customerEmail: string;
  customerMobilePhone: string;
}

interface PaymentConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
  userId?: bigint;
}

interface TossPaymentResponse {
  paymentKey: string;
  orderId: string;
  totalAmount: number;
  method: string;
  status: string;
  requestedAt: string;
  approvedAt: string;
  receipt?: {
    url: string;
  };
  // 기타 토스페이먼츠 응답 필드들
}

interface TossErrorResponse {
  code: string;
  message: string;
}

export async function updatePaymentStatus(
  paymentId: bigint,
  status: ORDER_STATUS
) {
  try {
    const updatedPayment = await prisma.order.update({
      where: {
        id: paymentId,
      },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    console.log("결제 상태 업데이트 완료:", updatedPayment);
    return updatedPayment;
  } catch (error) {
    console.error("결제 상태 업데이트 오류:", error);
    throw new Error("결제 상태 업데이트에 실패했습니다");
  }
}

export async function confirmPayment(
  data: PaymentConfirmRequest,
  env: "test" | "live" = "test",
  isEvent: boolean = false,
  eventText: string | null = null
) {
  try {
    // 1. 결제 세션 검증
    const sessionValidation = await validatePaymentSession({
      orderId: data.orderId,
      amount: data.amount,
    });

    if (!sessionValidation.valid) {
      throw new Error(`결제 검증 실패: ${sessionValidation.reason}`);
    }

    let widgetSecretKey: string | undefined;
    if (env === "live") {
      widgetSecretKey = process.env.TOSS_LIVE_SECRET_KEY;
    } else {
      widgetSecretKey = process.env.TOSS_SECRET_KEY;
    }
    if (!widgetSecretKey) {
      throw new Error("토스페이먼츠 시크릿 키가 설정되지 않았습니다");
    }

    const encryptedSecretKey =
      "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");

    // 2. 토스페이먼츠 결제 확인
    const response = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",
        headers: {
          Authorization: encryptedSecretKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey: data.paymentKey,
          orderId: data.orderId,
          amount: data.amount,
        }),
      }
    );

    if (!response.ok) {
      // 토스페이먼츠 에러 응답 처리
      console.log("토스페이먼츠 에러 응답:", response);
      const errorResponse: TossErrorResponse = await response.json();
      await handleTossPaymentError(errorResponse, data);
      throw new Error(`결제 승인 실패: ${errorResponse.message}`);
    }

    const result: TossPaymentResponse = await response.json();

    // 3. paymentKey와 orderId 필수 저장 (토스페이먼츠 권장사항)
    const newPayment = await createPaymentRecord(
      result,
      data.userId?.toString(),
      env === ("test" as "test" | "live")
    );

    await prisma.paymentSession.delete({
      where: { orderId: data.orderId },
    });

    // 포인트 충전 로직
    if (isEvent && eventText && eventText.startsWith("POINT_CHARGE:")) {
      const pointsToAdd = parseInt(eventText.split(":")[1] || "0");
      if (pointsToAdd > 0 && data.userId) {
        await prisma.user.update({
          where: { id: data.userId.toString() },
          data: { points: { increment: pointsToAdd } },
        });
        console.log(
          `포인트 충전 완료: User ${data.userId} +${pointsToAdd} points`
        );
      }
    }

    console.log("결제 승인 완료:", {
      paymentKey: result.paymentKey,
      orderId: result.orderId,
      amount: result.totalAmount,
      method: result.method,
    });

    revalidatePath("/admin/payment");
    return {
      success: true,
      payment: result,
      dbPayment: newPayment,
    };
  } catch (error) {
    console.error("결제 승인 오류:", error);

    // 에러 타입에 따른 다른 처리
    if (error instanceof Error && error.message.includes("결제 승인 실패")) {
      // 토스페이먼츠 에러는 그대로 전파
      throw error;
    }

    throw new Error("결제 승인에 실패했습니다");
  }
}

async function handleTossPaymentError(
  errorResponse: TossErrorResponse,
  data: PaymentConfirmRequest
) {
  const { code, message } = errorResponse;

  console.error("토스페이먼츠 에러:", { code, message, orderId: data.orderId });

  switch (code) {
    case "NOT_FOUND_PAYMENT_SESSION":
      // 결제 시간 만료 - 결제 세션 만료 처리
      console.log("결제 시간 만료로 인한 실패:", data.orderId);
      // 필요시 결제 세션 상태 업데이트
      break;

    case "REJECT_CARD_COMPANY":
      // 카드사 거절 - 상세 사유 로깅
      console.log("카드사 거절:", { message, orderId: data.orderId });
      break;

    case "FORBIDDEN_REQUEST":
      // API 키나 주문번호 불일치 - 보안 알림
      console.error("API 키 또는 주문번호 불일치 감지:", {
        orderId: data.orderId,
        paymentKey: data.paymentKey,
      });
      // 보안팀에 알림 등의 추가 처리 가능
      break;

    case "UNAUTHORIZED_KEY":
      // API 키 인증 실패 - 시스템 설정 문제
      console.error("토스페이먼츠 API 키 인증 실패");
      // 시스템 관리자에게 알림
      break;

    default:
      console.error("알 수 없는 토스페이먼츠 에러:", { code, message });
      break;
  }
}

export async function createPaymentRecord(
  paymentData: TossPaymentResponse,
  userId: string | undefined,
  isTest: boolean = false
) {
  try {
    if (!userId) {
      throw new Error("userId가 없습니다");
    }
    const payment = await prisma.order.create({
      data: {
        amount: paymentData.totalAmount,
        status: ORDER_STATUS.PAID,
        method: paymentData.method,
        merchantUid: paymentData.orderId, // 필수 저장
        pgProvider: "tosspayments",
        receiptUrl: paymentData.receipt?.url,
        userId: userId || "1",
        paymentKey: paymentData.paymentKey,
        isTest: isTest,
      },
    });

    console.log("결제 레코드 생성 완료:", {
      id: payment.id,
      merchantUid: payment.merchantUid,
      amount: payment.amount,
    });

    return payment;
  } catch (error) {
    console.error("결제 레코드 생성 오류:", error);
    throw new Error("결제 레코드 생성에 실패했습니다");
  }
}

// 환불 내역 생성 함수
export async function createRefundRecord(
  orderId: bigint,
  amount: number,
  tossRefundKey: string,
  reason: string
) {
  try {
    const refund = await prisma.refund.create({
      data: {
        orderId: orderId,
        amount: amount as number,
        reason,
        tossRefundKey,
        status: REFUND_STATUS.COMPLETED,
      },
    });

    console.log("환불 내역 생성 완료:", {
      refundId: refund.id,
      orderId: orderId,
      amount,
      reason,
    });

    return refund;
  } catch (error) {
    console.error("환불 내역 생성 오류:", error);
    throw new Error("환불 내역 생성에 실패했습니다");
  }
}

// 환불 내역 상태 업데이트 함수
export async function updateRefundStatus(
  refundId: bigint,
  status: REFUND_STATUS,
  tossRefundKey?: string,
  refundMethod?: string
) {
  try {
    const updatedRefund = await prisma.refund.update({
      where: { id: refundId },
      data: {
        status,
        tossRefundKey,
        refundMethod,
        processedAt:
          status === REFUND_STATUS.COMPLETED ? new Date() : undefined,
        updatedAt: new Date(),
      },
    });

    console.log("환불 상태 업데이트 완료:", {
      refundId,
      status,
      tossRefundKey,
    });

    return updatedRefund;
  } catch (error) {
    console.error("환불 상태 업데이트 오류:", error);
    throw new Error("환불 상태 업데이트에 실패했습니다");
  }
}

export async function cancelPaymentInDB(
  orderId: string,
  cancelReason: string,
  tossRefundKey: string,
  isPartial: boolean = false,
  amount: number | null
) {
  try {
    const updatedPayment = await prisma.order.update({
      where: {
        merchantUid: orderId,
      },
      data: {
        status: isPartial
          ? ORDER_STATUS.PARTIAL_REFUNDED
          : ORDER_STATUS.PARTIAL_REFUNDED,
        refundReason: cancelReason,
        refundedAt: new Date(),
        isRefunded: true,
        updatedAt: new Date(),
      },
    });

    // 환불 내역 기록
    const refund = await createRefundRecord(
      updatedPayment.id,
      amount || updatedPayment.amount,
      tossRefundKey,
      cancelReason
    );

    console.log("데이터베이스 결제 취소 및 환불 내역 기록 완료:", {
      paymentId: updatedPayment.id,
      refundId: refund.id,
      amount: updatedPayment.amount,
      reason: cancelReason,
    });

    return { payment: updatedPayment, refund };
  } catch (error) {
    console.error("데이터베이스 결제 취소 오류:", error);
    throw new Error("데이터베이스 결제 취소에 실패했습니다");
  }
}

export async function cancelPayment(
  paymentKey: string,
  cancelReason: string,
  amount: number | null,
  isPartial: boolean = false
) {
  try {
    const widgetSecretKey = process.env.TOSS_LIVE_SECRET_KEY;
    const encryptedSecretKey =
      "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");

    const response = await fetch(
      `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: encryptedSecretKey,
          "Content-Type": "application/json",
        },
        body: `{"cancelReason":"${cancelReason}", "cancelAmount": ${amount}}`,
      }
    );
    if (!response.ok) {
      throw new Error("결제 취소 실패");
    }

    const result = await response.json();

    // 토스페이먼츠에서 orderId를 받아와서 DB 업데이트
    if (result.orderId) {
      await cancelPaymentInDB(
        result.orderId,
        cancelReason,
        result.paymentKey, // 토스페이먼츠 환불 키
        isPartial,
        amount
      );
    }

    revalidatePath("/admin/payment");
    return {
      success: true,
      cancellation: result,
    };
  } catch (error) {
    console.error("결제 취소 오류:", error);
    throw new Error("결제 취소에 실패했습니다");
  }
}

export async function getPaymentsWithDetail(): Promise<Order[]> {
  try {
    const payments = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        refunds: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    return payments;
  } catch (error) {
    console.error("결제 내역 조회 오류:", error);
    throw new Error("결제 내역을 불러오지 못했습니다");
  }
}

// 환불 내역 조회 함수
export async function getRefundsWithDetail(): Promise<Refund[]> {
  try {
    const refunds = await prisma.refund.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          include: {
            user: true,
          },
        },
      },
    });
    return refunds;
  } catch (error) {
    console.error("환불 내역 조회 오류:", error);
    throw new Error("환불 내역을 불러오지 못했습니다");
  }
}

// 특정 결제의 환불 내역 조회
export async function getRefundsByOrderId(orderId: bigint): Promise<Refund[]> {
  try {
    const refunds = (await prisma.refund.findMany({
      where: { orderId: orderId },
      orderBy: { createdAt: "desc" },
      include: { order: { include: { user: true } } as any },
    })) as any;
    return refunds;
  } catch (error) {
    console.error("결제별 환불 내역 조회 오류:", error);
    throw new Error("결제별 환불 내역을 불러오지 못했습니다");
  }
}
