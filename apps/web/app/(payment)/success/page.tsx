"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmPayment } from "@/serverActions/payment/payment.actions";
import { useAuth } from "@/shared/hooks/use-auth";
import { LoadingSpinner } from "@repo/ui/components/loading-spinner";
import { Card, CardContent } from "@repo/ui/components/card";
import {
  Home,
  CheckCircle,
  CreditCard,
  BookOpen,
  User,
  ArrowRight,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";

export default function SuccessPage() {
  const { session, isLoading: isAuthLoading } = useAuth();
  if (!session && !isAuthLoading) {
    return <div>로그인 후 이용해주세요.</div>;
  }
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  // Strict Mode 대응: 한 번만 실행되도록 제어
  const hasExecuted = useRef(false);

  useEffect(() => {
    // Strict Mode에서 2번째 실행은 무시
    if (hasExecuted.current) {
      console.log("이미 실행됨, Strict Mode 2번째 실행 무시");
      return;
    }

    const handleConfirmPayment = async () => {
      if (!searchParams) return;
      hasExecuted.current = true;

      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");
      const paymentType = searchParams.get("paymentType");
      const env = searchParams.get("env") || "test";
      const isEvent = searchParams.get("isEvent") || false;
      const eventText = decodeURIComponent(searchParams.get("eventText") ?? "");

      if (!orderId || !amount || !paymentKey || !paymentType) {
        router.push("/fail?message=필수 결제 정보가 누락되었습니다");
        return;
      }
      try {
        setIsLoading(true);
        if (!session?.user?.id) {
          throw new Error(
            "사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요."
          );
        }
        const userId = BigInt(session.user.id);
        await confirmPayment(
          {
            paymentKey: paymentKey!,
            orderId: orderId!,
            amount: Number(amount),
            userId: userId,
          },
          env as "test" | "live",
          isEvent === "true",
          eventText
        );
        setOrderId(orderId);
        setAmount(amount);
      } catch (error) {
        console.log("=== confirmPayment 실패 ===", {
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : error,
        });

        let failMessage = "결제 승인에 실패했습니다";

        console.log("에러 객체:", error);
        if (error instanceof Error) {
          if (error.message.includes("결제 검증 실패")) {
            failMessage = "결제 정보가 조작되어 결제가 취소되었습니다";
          } else if (error.message.includes("결제 세션이 만료")) {
            failMessage = "결제 시간이 만료되었습니다";
          } else if (error.message.includes("결제 금액이 일치하지 않습니다")) {
            failMessage = "결제 금액이 일치하지 않아 결제가 취소되었습니다";
          } else if (
            error.message.includes("이미 등록된 수강 내역이 있습니다")
          ) {
            failMessage = "이미 등록된 수강 내역이 있습니다";
          }
        }
        router.push(
          `/fail?message=${encodeURIComponent(failMessage)}&orderId=${orderId}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    handleConfirmPayment();
  }, [searchParams, isAuthLoading]);

  if (!session || isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-green-50 p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <LoadingSpinner loadingText="결제 내용을 검증 중..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* 성공 헤더 */}
        <div className="mb-12 text-center">
          <div className="relative mb-8 inline-flex items-center justify-center">
            <div className="absolute inset-0 scale-150 animate-pulse rounded-full bg-gradient-to-r from-green-400 to-green-600 opacity-30 blur-2xl"></div>
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-green-600 shadow-2xl">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>

          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            결제가 완료되었습니다! 🎉
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            서비스 이용에 오신 것을 환영합니다!
            <br />
            이제 모든 기능을 사용하실 수 있습니다.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* 결제 정보 카드 */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    결제 정보
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 py-3">
                    <span className="text-gray-600">주문번호</span>
                    <span className="rounded bg-gray-100 px-3 py-1 font-mono text-sm">
                      {orderId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-100 py-3">
                    <span className="text-gray-600">서비스명</span>
                    <span className="font-semibold text-gray-900">
                      {courseTitle || "서비스 이용"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-100 py-3">
                    <span className="text-gray-600">결제금액</span>
                    <span className="text-2xl font-bold text-green-600">
                      {Number(amount).toLocaleString()}원
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-600">이용기간</span>
                    <Badge className="border-green-200 bg-green-100 text-green-700">
                      {expiresAt
                        ? `${new Date(expiresAt).toLocaleDateString("ko-KR")}까지 이용 가능`
                        : "평생 무제한 이용"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 사용자 정보 */}
            {session?.user && (
              <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">구매자 정보</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-900">
                      {session.user.nickname || session.user.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {session.user.email}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 액션 버튼들 */}
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/")}
                className="w-full transform rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                서비스 이용하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className="w-full rounded-xl py-3 hover:bg-gray-100"
                onClick={() => router.push("/")}
              >
                <Home className="mr-2 h-4 w-4" />
                홈으로 돌아가기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
