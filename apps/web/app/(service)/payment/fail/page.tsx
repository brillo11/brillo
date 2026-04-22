"use client";

import React, { Suspense, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { XCircle } from "lucide-react";
import { logPaymentEvent } from "@/serverActions/payment/log.actions";

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const message =
    searchParams.get("message") || "결제가 취소되었거나 실패했습니다.";
  const code = searchParams.get("code");
  const orderId = searchParams.get("orderId");
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    logPaymentEvent({
      scope: "fail-page",
      level: "warn",
      event: "tossFailRedirect",
      data: {
        code,
        message,
        orderId,
        rawSearch:
          typeof window !== "undefined" ? window.location.search : null,
      },
    }).catch(() => {});
  }, [code, message, orderId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <XCircle className="w-16 h-16 text-red-500" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-suit">결제 실패</h1>
            <p className="text-gray-600">{message}</p>
            {code && <p className="text-xs text-gray-400">에러 코드: {code}</p>}
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
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen">Loading...</div>}>
      <PaymentFailContent />
    </Suspense>
  );
}
