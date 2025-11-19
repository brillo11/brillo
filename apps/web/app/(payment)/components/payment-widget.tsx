"use client";

import { useEffect, useState } from "react";
import {
  loadTossPayments,
  TossPaymentsWidgets,
  WidgetPaymentMethodWidget
} from "@tosspayments/tosspayments-sdk";
import { useSession } from "@/shared/hooks/useSession";
import { createPaymentSession } from "@/serverActions/payment/payment-session.actions";

function generateRandomString() {
  if (typeof window !== "undefined") {
    return window.btoa(Math.random().toString()).slice(0, 20);
  }
  return "";
}

function generateCustomerKey(userId?: string): string {
  if (!userId) {
    // 비로그인 사용자의 경우 세션 기반 임시 키 생성
    const sessionKey = `guest_${Date.now()}_${generateRandomString()}`;
    return sessionKey.slice(0, 50); // 토스페이먼츠 customerKey 길이 제한
  }

  // 로그인 사용자의 경우 userId 기반으로 안정적인 키 생성
  const timestamp = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // 일 단위로 변경되는 타임스탬프
  const userHash = btoa(`user_${userId}_${timestamp}`).replace(
    /[^a-zA-Z0-9]/g,
    ""
  );

  return `customer_${userId}_${userHash}`.slice(0, 50);
}

interface PaymentWidgetProps {
  onClose?: () => void;
  amount?: number;
  orderName?: string;
  orderId?: string;
  customerName?: string;
  customerEmail?: string;
  customerMobilePhone?: string;
  originalAmount?: number;
  discountAmount?: number;
  env?: "test" | "live";
  isEvent?: boolean;
  eventText?: string;
}

export default function PaymentWidget({
  onClose,
  amount: propAmount = 50000,
  orderName = "상품 구매",
  orderId = generateRandomString(),
  customerName = "",
  customerEmail = "",
  customerMobilePhone = "",
  env = "test",
  isEvent = false,
  eventText = ""
}: PaymentWidgetProps) {
  const clientKey =
    env === "live"
      ? process.env.NEXT_PUBLIC_TOSS_LIVE_CLIENT_KEY || ""
      : process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "";
  const { data: session } = useSession();
  const [amount] = useState({ currency: "KRW", value: propAmount });
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
  const [paymentMethodWidget, setPaymentMethodWidget] =
    useState<WidgetPaymentMethodWidget | null>(null);
  const [agreementWidget, setAgreementWidget] = useState<any>(null);

  // 사용자 기반 customerKey 생성
  const customerKey = generateCustomerKey(session?.user?.id);
  const finalAmount = propAmount;

  useEffect(() => {
    if (widgets) return;
    async function fetchPaymentWidgets() {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const widgets = tossPayments.widgets({ customerKey });
        setWidgets(widgets);
      } catch (error) {
        console.error("결제위젯을 불러올 수 없습니다:", error);
      }
    }

    fetchPaymentWidgets();
  }, [clientKey, customerKey]);

  useEffect(() => {
    async function renderPaymentWidgets() {
      if (!widgets) return;

      try {
        await widgets.setAmount(amount);
        const paymentMethodWidgetInstance = await widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT"
        });
        setPaymentMethodWidget(paymentMethodWidgetInstance);

        const agreementWidgetInstance = await widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT"
        });
        setAgreementWidget(agreementWidgetInstance);

        setReady(true);
      } catch (error) {
        console.error("결제위젯을 렌더링할 수 없습니다:", error);
      }
    }

    renderPaymentWidgets();

    return () => {
      if (paymentMethodWidget) {
        paymentMethodWidget.destroy();
        setPaymentMethodWidget(null);
      }
      if (agreementWidget) {
        agreementWidget.destroy();
        setAgreementWidget(null);
      }
    };
  }, [widgets]);

  const handlePayment = async () => {
    if (!widgets) return;

    try {
      // 결제 요청 직전에 세션 생성
      await createPaymentSession({
        orderId,
        amount: propAmount,
        orderName,
        userId: session?.user?.id ? BigInt(session.user.id) : undefined
      });

      const paymentData: any = {
        orderId,
        orderName,
        successUrl:
          window.location.origin +
          "/success?env=" +
          env +
          "&isEvent=" +
          isEvent +
          "&eventText=" +
          encodeURIComponent(eventText),
        failUrl: window.location.origin + "/fail?env=" + env
      };

      // 빈 문자열이 아닌 경우에만 고객 정보 추가
      if (customerEmail && customerEmail.trim()) {
        paymentData.customerEmail = customerEmail;
      }
      if (customerName && customerName.trim()) {
        paymentData.customerName = customerName;
      }
      if (customerMobilePhone && customerMobilePhone.trim()) {
        paymentData.customerMobilePhone = customerMobilePhone;
      }

      await widgets.requestPayment(paymentData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
        <div className="flex items-center justify-between">
          <p className="text-lg font-medium text-gray-800">{orderName}</p>
          <button
            onClick={onClose}
            className="text-xl font-bold text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="box_section">
          <div id="payment-method" />
          <div id="agreement" />
          <div className="flex items-center justify-between text-lg font-bold">
            <span>결제 금액</span>
            <span className="text-blue-600">
              {finalAmount.toLocaleString()}원
            </span>
          </div>
          <button
            className="mt-2 w-full rounded bg-blue-600 px-2 py-2 text-white hover:bg-blue-700 disabled:bg-gray-300"
            disabled={!ready}
            onClick={handlePayment}
          >
            {finalAmount.toLocaleString()}원 결제하기
          </button>
        </div>
      </div>
    </div>
  );
}
