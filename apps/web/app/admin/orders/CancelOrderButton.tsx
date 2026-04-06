"use client";

import { useState, useTransition } from "react";
import { cancelOrderByAdmin } from "@/serverActions/payment/payment.actions";

interface CancelOrderButtonProps {
  orderId: string; // BigInt serialized as string
  orderName: string;
  amount: number;
}

export function CancelOrderButton({
  orderId,
  orderName,
  amount,
}: CancelOrderButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCancel = () => {
    startTransition(async () => {
      try {
        await cancelOrderByAdmin(BigInt(orderId), "관리자 결제 취소");
        setShowConfirm(false);
        alert("결제가 취소되었습니다.");
      } catch (error) {
        alert(
          `결제 취소 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
        );
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors"
      >
        결제취소
      </button>

      {/* 확인 모달 */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              결제 취소 확인
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              다음 주문을 정말 취소하시겠습니까?
              <br />
              토스페이먼츠에서도 결제가 취소됩니다.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-5 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">주문명</span>
                <span className="font-medium text-gray-900">{orderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">결제금액</span>
                <span className="font-semibold text-blue-600">
                  {amount.toLocaleString()}원
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                아니오
              </button>
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isPending ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    취소 중...
                  </>
                ) : (
                  "결제 취소"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
