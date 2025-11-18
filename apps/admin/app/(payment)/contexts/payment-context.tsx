"use client";

import React, { createContext, useContext, useState } from "react";

interface PaymentContextType {
  openPaymentModal: (options: {
    amount: number;
    orderName: string;
    orderId?: string;
  }) => void;
  closePaymentModal: () => void;
  isModalOpen: boolean;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState<any>(null);

  const openPaymentModal = (options: {
    amount: number;
    orderName: string;
    orderId?: string;
  }) => {
    setPaymentOptions(options);
    setIsModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsModalOpen(false);
    setPaymentOptions(null);
  };

  return (
    <PaymentContext.Provider
      value={{
        openPaymentModal,
        closePaymentModal,
        isModalOpen
      }}
    >
      {children}
      {isModalOpen && (
        <PaymentModal options={paymentOptions} onClose={closePaymentModal} />
      )}
    </PaymentContext.Provider>
  );
}

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within PaymentProvider");
  }
  return context;
};

// 결제 모달 컴포넌트
function PaymentModal({
  options,
  onClose
}: {
  options: any;
  onClose: () => void;
}) {
  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">결제</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        {/* 여기에 CheckoutPage 컴포넌트의 로직을 넣거나 import */}
        <div className="space-y-4">
          <p>상품명: {options?.orderName}</p>
          <p>금액: {options?.amount?.toLocaleString()}원</p>
          {/* Payment Widget 렌더링 영역 */}
          <div id="payment-method" />
          <div id="agreement" />
          <button
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
            onClick={() => {
              // 결제 로직 실행
              console.log("결제 진행:", options);
            }}
          >
            결제하기
          </button>
        </div>
      </div>
    </div>
  );
}
