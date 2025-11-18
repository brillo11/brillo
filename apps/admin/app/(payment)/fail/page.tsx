"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ErrorInfo {
  title: string;
  message: string;
  showRetryButton: boolean;
  showContactInfo: boolean;
  iconColor: string;
  bgColor: string;
}

export default function FailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorInfo, setErrorInfo] = useState<ErrorInfo>({
    title: "결제 실패",
    message: "결제에 실패했습니다",
    showRetryButton: true,
    showContactInfo: false,
    iconColor: "text-red-600",
    bgColor: "bg-red-100",
  });
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams) {
      const code = searchParams.get("code");
      const message = searchParams.get("message");
      const orderIdParam = searchParams.get("orderId");

      setErrorCode(code);
      if (orderIdParam) {
        setOrderId(orderIdParam);
      }

      // 에러 코드별 처리
      const processedErrorInfo = getErrorInfo(code, message);
      setErrorInfo(processedErrorInfo);
    }
  }, [searchParams]);

  const getErrorInfo = (
    code: string | null,
    message: string | null
  ): ErrorInfo => {
    const defaultMessage = message
      ? decodeURIComponent(message)
      : "결제에 실패했습니다";

    switch (code) {
      case "PAY_PROCESS_CANCELED":
        return {
          title: "결제 취소",
          message:
            "결제가 취소되었습니다.\n다시 시도하거나 다른 결제 수단을 이용해 주세요.",
          showRetryButton: true,
          showContactInfo: false,
          iconColor: "text-yellow-600",
          bgColor: "bg-yellow-100",
        };

      case "PAY_PROCESS_ABORTED":
        return {
          title: "결제 실패",
          message: message
            ? `결제가 실패했습니다.\n${decodeURIComponent(message)}\n\n계약 관련 오류인 경우 고객센터로 문의해 주세요.`
            : "결제가 실패했습니다.\n계약 관련 오류인 경우 고객센터로 문의해 주세요.",
          showRetryButton: true,
          showContactInfo: true,
          iconColor: "text-red-600",
          bgColor: "bg-red-100",
        };

      case "REJECT_CARD_COMPANY":
        return {
          title: "카드 정보 오류",
          message: message
            ? `카드 정보에 문제가 있습니다.\n${decodeURIComponent(message)}\n\n카드 정보를 확인하고 다시 시도해 주세요.`
            : "입력하신 카드 정보에 문제가 있습니다.\n카드 정보를 확인하고 다시 시도해 주세요.",
          showRetryButton: true,
          showContactInfo: false,
          iconColor: "text-orange-600",
          bgColor: "bg-orange-100",
        };

      default:
        return {
          title: "결제 실패",
          message: defaultMessage,
          showRetryButton: true,
          showContactInfo: false,
          iconColor: "text-red-600",
          bgColor: "bg-red-100",
        };
    }
  };

  const handleContactSupport = () => {
    // 토스페이먼츠 고객센터 연결
    window.open("tel:1544-7772");
  };

  const handleTechnicalSupport = () => {
    // 토스페이먼츠 실시간 기술지원 채널 (실제 URL로 변경 필요)
    window.open("https://docs.tosspayments.com/support", "_blank");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-md">
        <div className="mb-4">
          <div
            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${errorInfo.bgColor}`}
          >
            {errorCode === "PAY_PROCESS_CANCELED" ? (
              // 취소 아이콘
              <svg
                className={`h-6 w-6 ${errorInfo.iconColor}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : errorCode === "REJECT_CARD_COMPANY" ? (
              // 카드 에러 아이콘
              <svg
                className={`h-6 w-6 ${errorInfo.iconColor}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            ) : (
              // 기본 실패 아이콘
              <svg
                className={`h-6 w-6 ${errorInfo.iconColor}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            )}
          </div>
        </div>

        <h1 className="mb-2 text-xl font-bold text-gray-900">
          {errorInfo.title}
        </h1>
        <p className="mb-6 whitespace-pre-line text-gray-600">
          {errorInfo.message}
        </p>

        {errorCode && (
          <p className="mb-2 text-sm text-gray-500">에러 코드: {errorCode}</p>
        )}

        {orderId && (
          <p className="mb-4 text-sm text-gray-500">주문번호: {orderId}</p>
        )}

        <div className="space-y-3">
          {errorInfo.showContactInfo && (
            <div className="space-y-2">
              <button
                onClick={handleContactSupport}
                className="w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                고객센터 연결 (1544-7772)
              </button>
              <button
                onClick={handleTechnicalSupport}
                className="w-full rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
              >
                기술지원 채널
              </button>
            </div>
          )}

          <button
            onClick={() => router.push("/")}
            className="w-full rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            홈으로 돌아가기
          </button>
        </div>

        {/* 추가 정보 섹션 */}
        {(errorCode === "PAY_PROCESS_ABORTED" ||
          errorCode === "REJECT_CARD_COMPANY") && (
          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-left">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">도움말</h3>
            <ul className="space-y-1 text-xs text-gray-600">
              {errorCode === "PAY_PROCESS_ABORTED" && (
                <>
                  <li>• 계약 관련 오류: 토스페이먼츠 고객센터 문의</li>
                  <li>• 기타 오류: 실시간 기술지원 채널 이용</li>
                </>
              )}
              {errorCode === "REJECT_CARD_COMPANY" && (
                <>
                  <li>• 카드 번호, 유효기간, CVC 번호 확인</li>
                  <li>• 카드 한도 및 결제 가능 상태 확인</li>
                  <li>• 다른 카드로 결제 시도</li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
