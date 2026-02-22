"use client";

import { useState } from "react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useSession } from "@/shared/lib/auth-client";
import { nanoid } from "nanoid";
import { GuestUserInfo } from "../components/GuestPaymentModal";

interface PaymentData {
  amount: number;
  orderName: string;
  orderId?: string;
  customerName?: string;
  customerEmail?: string;
}

export function usePayment() {
  const { data: session } = useSession();
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
    try {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        throw new Error("Toss Payments Client Key is missing");
      }

      const tossPayments = await loadTossPayments(clientKey);

      const orderId = data.orderId || nanoid();

      // Determine customer info
      const customerName = userInfo?.name || session?.user?.name || "GUEST";
      const customerEmail = userInfo?.email || session?.user?.email || "";
      const customerMobilePhone = userInfo?.phone || "";

      // Store guest info in sessionStorage to retrieve after redirect
      if (userInfo) {
        sessionStorage.setItem("GUEST_PAYMENT_INFO", JSON.stringify(userInfo));
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
      alert("결제 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
      setPendingPayment(null);
      setIsModalOpen(false);
    }
  };

  const requestPayment = (data: PaymentData) => {
    // Guest or logged-in user - always open modal to confirm info (name, gender, age, etc)
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
    isModalOpen,
    closeModal: () => setIsModalOpen(false),
    handleGuestSubmit,
    isLoading,
  };
}
