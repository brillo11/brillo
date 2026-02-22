"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { confirmPayment } from "@/serverActions/payment/payment.actions";
import { Button } from "@repo/ui/components/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setErrorMessage("결제 정보가 부족합니다.");
      return;
    }

    const processPayment = async () => {
      try {
        let guestInfo = undefined;
        const storedInfo = sessionStorage.getItem("GUEST_PAYMENT_INFO");
        if (storedInfo) {
          try {
            guestInfo = JSON.parse(storedInfo);
            // Clear it so it isn't reused accidentally
            sessionStorage.removeItem("GUEST_PAYMENT_INFO");
          } catch (e) {
            console.error("Failed to parse guest info", e);
          }
        }

        await confirmPayment(
          {
            paymentKey,
            orderId,
            amount: Number(amount),
            guestInfo,
          },
          "test", // Always test mode as per requirements
        );
        setStatus("success");
      } catch (error: any) {
        console.error("Payment confirmation error:", error);
        setStatus("error");
        setErrorMessage(error.message || "결제 승인 중 오류가 발생했습니다.");
      }
    };

    processPayment();
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-black" />
            <h1 className="text-xl font-bold font-suit">
              결제를 확인하고 있습니다...
            </h1>
            <p className="text-gray-500">잠시만 기다려주세요.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold font-suit">
                결제가 완료되었습니다
              </h1>
              <p className="text-gray-600">
                예약이 성공적으로 접수되었습니다.
                <br />곧 안내 문자가 발송될 예정입니다.
              </p>
            </div>
            <Button
              className="w-full bg-black text-white hover:bg-gray-800"
              onClick={() => router.push("/")}
            >
              홈으로 돌아가기
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <XCircle className="w-16 h-16 text-red-500" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold font-suit">
                결제에 실패했습니다
              </h1>
              <p className="text-gray-600">{errorMessage}</p>
            </div>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/")}
              >
                홈으로
              </Button>
              <Button
                className="flex-1 bg-black text-white hover:bg-gray-800"
                onClick={() => router.back()}
              >
                다시 시도
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
