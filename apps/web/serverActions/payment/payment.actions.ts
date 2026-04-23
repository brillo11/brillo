"use server";

import { prisma, ORDER_STATUS, REFUND_STATUS } from "@repo/database";
import {
  validatePaymentSession,
  completePaymentSession,
} from "./payment-session.actions";
import { logPaymentEvent } from "./log.actions";
import { sendSms } from "@/serverActions/notification/sms.actions";
import { revalidatePath } from "next/cache";
import { Order } from "@repo/database";
import { Refund } from "@repo/database";
import { auth } from "@/shared/lib/auth";
import { headers } from "next/headers";

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
  guestInfo?: any;
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
  status: ORDER_STATUS,
) {
  try {
    const updatedPayment = await prisma.order.update({
      where: {
        id: paymentId,
      },
      data: {
        status: status as any,
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

/**
 * 토스페이먼츠 결제 취소 헬퍼 (보상 트랜잭션용)
 * - confirm 성공 후 DB 저장 실패 시 호출
 */
async function cancelTossPayment(
  paymentKey: string,
  reason: string,
  env: "test" | "live" = "test",
): Promise<boolean> {
  try {
    const secretKey =
      env === "live"
        ? process.env.TOSS_LIVE_SECRET_KEY
        : process.env.TOSS_SECRET_KEY;

    if (!secretKey) {
      console.error("보상 트랜잭션 실패 — 시크릿 키 없음:", {
        paymentKey,
        reason,
      });
      return false;
    }

    const encoded = "Basic " + Buffer.from(secretKey + ":").toString("base64");

    const response = await fetch(
      `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: encoded,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cancelReason: reason }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error("보상 트랜잭션 실패 — 수동 확인 필요:", {
        paymentKey,
        reason,
        error: errorBody,
      });
      return false;
    }

    console.log("보상 트랜잭션 성공 — 결제 자동 취소:", { paymentKey, reason });
    return true;
  } catch (error) {
    console.error("보상 트랜잭션 예외 — 수동 확인 필요:", {
      paymentKey,
      reason,
      error,
    });
    return false;
  }
}

export async function confirmPayment(
  data: PaymentConfirmRequest,
  env: "test" | "live" = "test",
  isEvent: boolean = false,
  eventText: string | null = null,
) {
  await logPaymentEvent({
    scope: "confirm",
    level: "info",
    event: "confirm:start",
    data: {
      orderId: data.orderId,
      amount: data.amount,
      paymentKey: data.paymentKey,
      env,
      isEvent,
    },
  }).catch(() => {});

  try {
    // 0. 서버에서 현재 사용자 세션 가져오기
    let currentUserId: string | undefined = data.userId?.toString();
    if (!currentUserId) {
      try {
        const headersList = await headers();
        const userSession = await auth.api.getSession({ headers: headersList });
        currentUserId = userSession?.user?.id;
      } catch (e) {
        console.log("세션 조회 실패 (비로그인 사용자)", e);
        await logPaymentEvent({
          scope: "confirm",
          level: "info",
          event: "session:lookupFailed",
          data: { orderId: data.orderId },
          error: e,
        }).catch(() => {});
      }
    }

    // 1. 결제 세션 검증
    const sessionValidation = await validatePaymentSession({
      orderId: data.orderId,
      amount: data.amount,
    });

    if (!sessionValidation.valid) {
      await logPaymentEvent({
        scope: "confirm",
        level: "error",
        event: "sessionValidation:failed",
        data: {
          orderId: data.orderId,
          amount: data.amount,
          reason: sessionValidation.reason,
        },
      }).catch(() => {});
      throw new Error(`결제 검증 실패: ${sessionValidation.reason}`);
    }

    // 세션에서 guestInfo와 env 가져오기
    const session = (sessionValidation as any).session;
    const guestInfo = data.guestInfo || session?.guestInfo || undefined;
    const sessionEnv = session?.env || env;

    let widgetSecretKey: string | undefined;
    if (sessionEnv === "live") {
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
      },
    );

    if (!response.ok) {
      // 토스페이먼츠 에러 응답 처리
      console.log("토스페이먼츠 에러 응답:", response);
      const errorResponse: TossErrorResponse = await response.json();
      await logPaymentEvent({
        scope: "confirm",
        level: "error",
        event: "tossConfirm:failed",
        data: {
          orderId: data.orderId,
          amount: data.amount,
          paymentKey: data.paymentKey,
          httpStatus: response.status,
          tossCode: errorResponse.code,
          tossMessage: errorResponse.message,
        },
      }).catch(() => {});
      await handleTossPaymentError(errorResponse, data);
      throw new Error(`결제 승인 실패: ${errorResponse.message}`);
    }

    const result: TossPaymentResponse = await response.json();

    // 3. paymentKey를 결제 세션에 저장 (추적용)
    try {
      await prisma.paymentSession.update({
        where: { orderId: data.orderId },
        data: { paymentKey: result.paymentKey, status: "CONFIRMED" },
      });
    } catch (e) {
      console.error("결제 세션 paymentKey 저장 실패:", e);
    }

    // 4. 로그인 사용자의 예약 정보 저장
    if (guestInfo && currentUserId) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { id: currentUserId },
          select: { misc: true },
        });
        const currentMisc =
          existingUser?.misc && typeof existingUser.misc === "object"
            ? existingUser.misc
            : {};
        const newMisc = {
          ...currentMisc,
          reservationInfo: guestInfo,
        };
        await prisma.user.update({
          where: { id: currentUserId },
          data: { misc: newMisc as any },
        });
      } catch (e) {
        console.log("사용자 misc 업데이트 실패", e);
      }
    }

    // 5. DB 결제 기록 저장 (실패 시 보상 트랜잭션으로 토스 결제 취소)
    let newPayment;
    try {
      newPayment = await createPaymentRecord(
        result,
        currentUserId || undefined,
        sessionEnv === "test",
        session?.orderName,
        guestInfo,
      );
    } catch (dbError) {
      console.error("DB 저장 실패, 토스 결제 자동 취소 시도:", dbError);
      await logPaymentEvent({
        scope: "confirm",
        level: "error",
        event: "createPaymentRecord:failed",
        data: {
          orderId: data.orderId,
          paymentKey: result.paymentKey,
          amount: result.totalAmount,
        },
        error: dbError,
      }).catch(() => {});
      const cancelled = await cancelTossPayment(
        result.paymentKey,
        "DB 저장 실패로 인한 자동 취소",
        sessionEnv,
      );
      if (cancelled) {
        throw new Error(
          "결제 처리 중 오류가 발생하여 자동 취소되었습니다. 다시 시도해주세요.",
        );
      } else {
        // 자동 취소도 실패한 경우 — 관리자 수동 확인 필요
        console.error(
          "치명적 오류: DB 저장 실패 + 자동 취소 실패. 수동 확인 필요:",
          {
            paymentKey: result.paymentKey,
            orderId: result.orderId,
            amount: result.totalAmount,
          },
        );
        throw new Error(
          "결제 처리 중 오류가 발생했습니다. 고객센터로 문의해주세요.",
        );
      }
    }

    // 6. 결제 세션 정리
    try {
      await prisma.paymentSession.delete({
        where: { orderId: data.orderId },
      });
    } catch (e) {
      console.error("결제 세션 삭제 실패 (무시 가능):", e);
    }

    // 포인트 충전 로직
    if (isEvent && eventText && eventText.startsWith("POINT_CHARGE:")) {
      const pointsToAdd = parseInt(eventText.split(":")[1] || "0");
      if (pointsToAdd > 0 && data.userId) {
        await prisma.user.update({
          where: { id: data.userId.toString() },
          data: { points: { increment: pointsToAdd } } as any,
        });
        console.log(
          `포인트 충전 완료: User ${data.userId} +${pointsToAdd} points`,
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
    revalidatePath("/admin/orders");
    revalidatePath("/(service)/mypage/orders");
    await logPaymentEvent({
      scope: "confirm",
      level: "info",
      event: "confirm:success",
      data: {
        orderId: result.orderId,
        paymentKey: result.paymentKey,
        amount: result.totalAmount,
        method: result.method,
        isGuest: !currentUserId,
      },
    }).catch(() => {});

    sendSms({
      body: `[Brillo] 결제 완료\n주문: ${session?.orderName || result.orderId}\n금액: ${result.totalAmount.toLocaleString()}원${guestInfo?.name ? `\n예약자: ${guestInfo.name}` : ""}`,
    })
      .then((r) => {
        if (!r.success) {
          logPaymentEvent({
            scope: "confirm",
            level: "warn",
            event: "sms:failed",
            data: { orderId: result.orderId, error: r.error },
          }).catch(() => {});
        }
      })
      .catch(() => {});

    return {
      success: true,
      payment: result,
      dbPayment: newPayment,
    };
  } catch (error) {
    console.error("결제 승인 오류:", error);
    await logPaymentEvent({
      scope: "confirm",
      level: "error",
      event: "confirm:exception",
      data: { orderId: data.orderId, paymentKey: data.paymentKey },
      error,
    }).catch(() => {});

    // 에러 타입에 따른 다른 처리
    if (error instanceof Error && error.message.includes("결제 승인 실패")) {
      // 토스페이먼츠 에러는 그대로 전파
      throw error;
    }

    if (error instanceof Error && error.message.includes("자동 취소")) {
      throw error;
    }

    if (error instanceof Error && error.message.includes("고객센터")) {
      throw error;
    }

    throw new Error("결제 승인에 실패했습니다");
  }
}

async function handleTossPaymentError(
  errorResponse: TossErrorResponse,
  data: PaymentConfirmRequest,
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
  isTest: boolean = false,
  orderName?: string,
  guestInfo?: any,
) {
  try {
    // Build description as JSON with reservation info
    const descriptionData = guestInfo
      ? JSON.stringify({
          reservationInfo: {
            name: guestInfo.name,
            gender: guestInfo.gender,
            age: guestInfo.age,
            phone: guestInfo.phone,
            email: guestInfo.email,
          },
        })
      : undefined;

    const payment = await prisma.order.create({
      data: {
        amount: paymentData.totalAmount,
        status: "PAID" as any,
        method: paymentData.method,
        merchantUid: paymentData.orderId,
        pgProvider: "tosspayments",
        receiptUrl: paymentData.receipt?.url,
        userId: userId || undefined,
        paymentKey: paymentData.paymentKey,
        isTest: isTest,
        orderName:
          orderName && guestInfo?.name
            ? `${orderName} (${guestInfo.name})`
            : orderName || "서비스 이용료",
        description: descriptionData,
      },
    });

    console.log("결제 레코드 생성 완료:", {
      id: payment.id,
      merchantUid: payment.merchantUid,
      amount: payment.amount,
      userId: userId || "비회원",
    });

    return payment;
  } catch (error: any) {
    // Unique 제약 위반 → 이미 생성된 레코드 재사용 (중복 confirm 방어)
    if (error?.code === "P2002") {
      const existing = await prisma.order.findFirst({
        where: {
          OR: [
            { paymentKey: paymentData.paymentKey },
            { merchantUid: paymentData.orderId },
          ],
        },
      });
      if (existing) {
        console.log("이미 생성된 결제 레코드 재사용:", {
          id: existing.id,
          merchantUid: existing.merchantUid,
        });
        return existing;
      }
    }
    console.error("결제 레코드 생성 오류:", error);
    throw new Error("결제 레코드 생성에 실패했습니다");
  }
}

// 환불 내역 생성 함수
export async function createRefundRecord(
  orderId: bigint,
  amount: number,
  tossRefundKey: string,
  reason: string,
) {
  try {
    const refund = await prisma.refund.create({
      data: {
        orderId: orderId,
        amount: amount as number,
        reason,
        tossRefundKey,
        status: "COMPLETED" as any,
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
  refundMethod?: string,
) {
  try {
    const updatedRefund = await prisma.refund.update({
      where: { id: refundId },
      data: {
        status: status as any,
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
  amount: number | null,
) {
  try {
    const updatedPayment = await prisma.order.update({
      where: {
        merchantUid: orderId,
      },
      data: {
        status: (isPartial
          ? "PARTIAL_REFUNDED"
          : "REFUNDED") as any,
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
      cancelReason,
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
  isPartial: boolean = false,
) {
  try {
    const widgetSecretKey = process.env.TOSS_LIVE_SECRET_KEY;
    if (!widgetSecretKey) {
      throw new Error("토스페이먼츠 시크릿 키가 설정되지 않았습니다");
    }
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
      },
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
        amount,
      );
    }

    revalidatePath("/admin/payment");
    revalidatePath("/admin/orders");
    return {
      success: true,
      cancellation: result,
    };
  } catch (error) {
    console.error("결제 취소 오류:", error);
    throw new Error("결제 취소에 실패했습니다");
  }
}

/**
 * 관리자 전용 결제 취소
 * - order ID로 주문을 찾아서 paymentKey와 isTest 여부를 자동 판별
 * - Toss API에 취소 요청 후 DB 상태도 업데이트
 */
export async function cancelOrderByAdmin(
  orderId: bigint,
  cancelReason: string = "관리자 결제 취소",
) {
  try {
    // 1. 주문 조회
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error("주문을 찾을 수 없습니다");
    }

    if (!order.paymentKey) {
      throw new Error("paymentKey가 없어 취소할 수 없습니다");
    }

    if (order.isRefunded) {
      throw new Error("이미 환불 처리된 주문입니다");
    }

    // 2. isTest 여부에 따라 secret key 선택
    const widgetSecretKey = order.isTest
      ? process.env.TOSS_SECRET_KEY
      : process.env.TOSS_LIVE_SECRET_KEY;

    if (!widgetSecretKey) {
      throw new Error("토스페이먼츠 시크릿 키가 설정되지 않았습니다");
    }

    const encryptedSecretKey =
      "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");

    // 3. 토스 결제 취소 API 호출
    const response = await fetch(
      `https://api.tosspayments.com/v1/payments/${order.paymentKey}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: encryptedSecretKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cancelReason,
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error("토스 결제 취소 실패 응답:", errorBody);
      throw new Error(
        `결제 취소 실패: ${(errorBody as any).message || response.statusText}`,
      );
    }

    const result = await response.json();

    // 4. DB 상태 업데이트
    await cancelPaymentInDB(
      result.orderId,
      cancelReason,
      result.paymentKey,
      false,
      order.amount,
    );

    revalidatePath("/admin/orders");
    return {
      success: true,
      cancellation: result,
    };
  } catch (error) {
    console.error("관리자 결제 취소 오류:", error);
    if (error instanceof Error) {
      throw error;
    }
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
