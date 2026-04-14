import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { createPaymentRecord } from "@/serverActions/payment/payment.actions";

/**
 * 토스페이먼츠 웹훅 엔드포인트
 *
 * 토스에서 결제 상태 변경 시 서버로 직접 알려주는 안전망.
 * 클라이언트 측 confirmPayment가 실패하더라도 웹훅으로 결제를 추적/복구할 수 있음.
 *
 * 토스 개발자 센터에서 웹훅 URL을 등록해야 합니다:
 * https://your-domain.com/api/payment/webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, data } = body;

    console.log("토스 웹훅 수신:", { eventType, orderId: data?.orderId });

    // 웹훅 시크릿 키 검증 (선택사항이지만 권장)
    const webhookSecret = process.env.TOSS_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get("TossPayments-Signature");
      // 토스 웹훅 시크릿 키와 헤더 서명 비교 (간이 검증)
      if (!signature) {
        console.warn("웹훅 서명 누락");
        return NextResponse.json(
          { error: "Missing signature" },
          { status: 401 },
        );
      }
    }

    switch (eventType) {
      case "PAYMENT_STATUS_CHANGED": {
        await handlePaymentStatusChanged(data);
        break;
      }
      default: {
        console.log("처리하지 않는 웹훅 이벤트:", eventType);
      }
    }

    // 토스는 200 응답을 기대함
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("웹훅 처리 오류:", error);
    // 에러가 발생해도 200을 반환해야 토스에서 재시도하지 않음
    // 단, 일시적 오류인 경우 500을 반환하여 재시도를 유도할 수 있음
    return NextResponse.json({ success: true });
  }
}

/**
 * 결제 상태 변경 이벤트 처리
 */
async function handlePaymentStatusChanged(data: any) {
  const { paymentKey, orderId, status } = data;

  if (!paymentKey || !orderId) {
    console.warn("웹훅 데이터 불완전:", data);
    return;
  }

  console.log("결제 상태 변경 웹훅:", { paymentKey, orderId, status });

  if (status === "DONE") {
    // 결제 완료 — DB에 해당 paymentKey의 Order가 있는지 확인
    const existingOrder = await prisma.order.findUnique({
      where: { paymentKey },
    });

    if (existingOrder) {
      console.log("이미 DB에 기록된 결제:", { paymentKey, orderId });
      return;
    }

    // DB에 기록이 없는 결제 발견 → 토스 API로 결제 정보 조회 후 복구 시도
    console.warn("DB에 기록되지 않은 결제 발견, 복구 시도:", {
      paymentKey,
      orderId,
    });

    try {
      // PaymentSession이 있으면 그 정보로 복구
      const paymentSession = await prisma.paymentSession.findUnique({
        where: { orderId },
      });

      // 토스 API로 결제 정보 조회
      const env = paymentSession?.env || "live";
      const secretKey =
        env === "live"
          ? process.env.TOSS_LIVE_SECRET_KEY
          : process.env.TOSS_SECRET_KEY;

      if (!secretKey) {
        console.error("웹훅 복구 실패: 시크릿 키 없음");
        return;
      }

      const encoded =
        "Basic " + Buffer.from(secretKey + ":").toString("base64");

      const tossResponse = await fetch(
        `https://api.tosspayments.com/v1/payments/${paymentKey}`,
        {
          headers: { Authorization: encoded },
        },
      );

      if (!tossResponse.ok) {
        console.error("토스 결제 정보 조회 실패:", await tossResponse.text());
        return;
      }

      const paymentData = await tossResponse.json();

      // DB에 결제 기록 생성
      const guestInfo =
        paymentSession?.guestInfo &&
        typeof paymentSession.guestInfo === "object"
          ? paymentSession.guestInfo
          : undefined;

      await createPaymentRecord(
        {
          paymentKey: paymentData.paymentKey,
          orderId: paymentData.orderId,
          totalAmount: paymentData.totalAmount,
          method: paymentData.method,
          status: paymentData.status,
          requestedAt: paymentData.requestedAt,
          approvedAt: paymentData.approvedAt,
          receipt: paymentData.receipt,
        },
        undefined, // userId는 웹훅에서 알 수 없으므로 PaymentSession에서 가져오거나 undefined
        env === "test",
        paymentSession?.orderName,
        guestInfo as any,
      );

      console.log("웹훅으로 결제 기록 복구 완료:", { paymentKey, orderId });

      // 결제 세션 정리
      if (paymentSession) {
        await prisma.paymentSession.delete({
          where: { orderId },
        });
      }
    } catch (error) {
      console.error("웹훅 결제 복구 실패:", error);
    }
  } else if (status === "CANCELED" || status === "PARTIAL_CANCELED") {
    // 결제 취소 — DB 상태 업데이트
    const existingOrder = await prisma.order.findUnique({
      where: { paymentKey },
    });

    if (existingOrder && !existingOrder.isRefunded) {
      await prisma.order.update({
        where: { paymentKey },
        data: {
          status: (status === "PARTIAL_CANCELED"
            ? "PARTIAL_REFUNDED"
            : "REFUNDED") as any,
          isRefunded: status !== "PARTIAL_CANCELED",
          refundedAt: new Date(),
        },
      });
      console.log("웹훅으로 결제 취소 상태 업데이트:", {
        paymentKey,
        status,
      });
    }
  }
}
