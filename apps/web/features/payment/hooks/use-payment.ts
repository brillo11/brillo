"use client";

import { useState } from "react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useSession } from "@/shared/lib/auth-client";
import { nanoid } from "nanoid";
import { GuestUserInfo } from "../components/GuestPaymentModal";
import { logPaymentEvent } from "@/serverActions/payment/log.actions";
import { useSetAtom } from "jotai";
import { loginModalOpenAtom } from "@/features/auth/login-modal-atom";

interface PaymentData {
  amount: number;
  orderName: string;
  orderId?: string;
  customerName?: string;
  customerEmail?: string;
}

interface PaypalPaymentData {
  amount: number;
  orderName: string;
}

export function usePayment() {
  const { data: session } = useSession();
  const setIsLoginOpen = useSetAtom(loginModalOpenAtom);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PaymentData | null>(
    null,
  );

  const processPayment = async (
    data: PaymentData,
    userInfo?: GuestUserInfo,
  ) => {
    setIsLoading(true);
    const orderId = data.orderId || nanoid();
    const isGuest = !session?.user;
    try {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        throw new Error("Toss Payments Client Key is missing");
      }

      const tossPayments = await loadTossPayments(clientKey);

      // 토스 SDK는 customerMobilePhone을 숫자 8~15자로 요구 (하이픈/공백 거부)
      const sanitizedPhone = (userInfo?.phone || "").replace(/\D/g, "");
      const sanitizedUserInfo = userInfo
        ? { ...userInfo, phone: sanitizedPhone }
        : undefined;

      // Determine customer info
      const customerName = userInfo?.name || session?.user?.name || "GUEST";
      const customerEmail = userInfo?.email || session?.user?.email || "";
      const customerMobilePhone = sanitizedPhone;

      await logPaymentEvent({
        scope: "client-request",
        level: "info",
        event: "requestPayment:start",
        data: {
          orderId,
          amount: data.amount,
          orderName: data.orderName,
          isGuest,
          hasUserInfo: !!userInfo,
          sanitizedPhoneLength: sanitizedPhone.length,
        },
      }).catch(() => {});

      // Create PaymentSession on the server before requesting payment
      // guestInfo를 서버에 저장하여 리다이렉트 후에도 안전하게 사용 가능
      try {
        const { createPaymentSession } = await import(
          "@/serverActions/payment/payment-session.actions"
        );

        await createPaymentSession({
          orderId,
          amount: data.amount,
          orderName: data.orderName,
          guestInfo: sanitizedUserInfo,
          env: "test",
        });
      } catch (sessionError) {
        console.error("Failed to create payment session:", sessionError);
        await logPaymentEvent({
          scope: "client-request",
          level: "error",
          event: "createPaymentSession:failed",
          data: { orderId, amount: data.amount, isGuest },
          error: sessionError,
        }).catch(() => {});
        alert("결제 세션 생성 중 오류가 발생했습니다.");
        setIsLoading(false);
        return;
      }

      // Construct success/fail URLs
      const origin = window.location.origin;

      // SDK v2: Initialize payment object
      const payment = tossPayments.payment({
        customerKey: session?.user?.id || ANONYMOUS, // Use session user ID or a generic anonymous key
      });

      await payment.requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: data.amount,
        },
        orderId: orderId,
        orderName: data.orderName,
        successUrl: origin + "/payment/success",
        failUrl: origin + "/payment/fail",
        customerEmail: customerEmail || undefined,
        customerName: customerName || undefined,
        customerMobilePhone: customerMobilePhone || undefined,
      });
    } catch (error) {
      console.error("Payment error:", error);
      const tossError = error as { code?: string; message?: string };
      await logPaymentEvent({
        scope: "client-request",
        level: "error",
        event: "requestPayment:failed",
        data: {
          orderId,
          amount: data.amount,
          orderName: data.orderName,
          isGuest,
          tossCode: tossError?.code,
          tossMessage: tossError?.message,
        },
        error,
      }).catch(() => {});
      alert("결제 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
      setPendingPayment(null);
      setIsModalOpen(false);
    }
  };

  const processPaypalPayment = async (data: PaypalPaymentData) => {
    setIsLoading(true);
    const orderId = nanoid();
    try {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) throw new Error("TossPayments Client Key가 없습니다");

      await logPaymentEvent({
        scope: "client-request",
        level: "info",
        event: "paypalPayment:start",
        data: { orderId, amount: data.amount, orderName: data.orderName, currency: "USD" },
      }).catch(() => {});

      try {
        const { createPaymentSession } = await import(
          "@/serverActions/payment/payment-session.actions"
        );
        await createPaymentSession({
          orderId,
          amount: data.amount,
          orderName: data.orderName,
          env: "live",
        });
      } catch (sessionError) {
        await logPaymentEvent({
          scope: "client-request",
          level: "error",
          event: "paypalCreateSession:failed",
          data: { orderId, amount: data.amount },
          error: sessionError,
        }).catch(() => {});
        alert("결제 세션 생성 중 오류가 발생했습니다.");
        return;
      }

      const tossPayments = await loadTossPayments(clientKey);
      const widgets = tossPayments.widgets({
        customerKey: session?.user?.id || ANONYMOUS,
      });

      await widgets.setAmount({ currency: "USD", value: data.amount });

      const tempId = `paypal-${orderId}`;
      const tempDiv = document.createElement("div");
      tempDiv.id = tempId;
      tempDiv.style.cssText =
        "position:fixed;top:-9999px;left:-9999px;width:300px;height:200px;overflow:hidden";
      document.body.appendChild(tempDiv);

      try {
        await widgets.renderPaymentMethods({
          variantKey: "PAYPAL",
          selector: `#${tempId}`,
        });

        const origin = window.location.origin;
        await widgets.requestPayment({
          orderId,
          orderName: data.orderName,
          successUrl: `${origin}/payment/success`,
          failUrl: `${origin}/payment/fail`,
          customerEmail: session?.user?.email || undefined,
          customerName: session?.user?.name || undefined,
        });
      } finally {
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv);
        }
      }
    } catch (error: any) {
      if (error?.code === "USER_CANCEL") return;
      console.error("PayPal 결제 오류:", error);
      await logPaymentEvent({
        scope: "client-request",
        level: "error",
        event: "paypalPayment:failed",
        data: { orderId, amount: data.amount, orderName: data.orderName },
        error,
      }).catch(() => {});
      alert("PayPal 결제 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const requestPayment = (data: PaymentData) => {
    if (!session?.user) {
      setPendingPayment(null);
      setIsModalOpen(false);
      setIsLoginOpen(true);
      return;
    }

    // Logged-in users confirm reservation info before payment.
    setPendingPayment(data);
    setIsModalOpen(true);
  };

  const handleGuestSubmit = (userInfo: GuestUserInfo) => {
    if (pendingPayment) {
      processPayment(pendingPayment, userInfo);
    }
  };

  return {
    requestPayment,
    processPaypalPayment,
    isModalOpen,
    closeModal: () => setIsModalOpen(false),
    handleGuestSubmit,
    isLoading,
  };
}
