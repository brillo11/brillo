"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@repo/ui/components/card";
import { Coins } from "lucide-react";
// import PaymentWidget from "@/app/(payment)/components/payment-widget";

interface PointOption {
  id: string;
  amount: number;
  points: number; // 실제 충전되는 냥 (1원 = 1냥 가정, 혹은 보너스 포함)
  bonus?: number;
  label: string;
  description: string;
  popular?: boolean;
}

const CHARGE_OPTIONS: PointOption[] = [
  {
    id: "nyang_30000",
    amount: 30000,
    points: 30000,
    label: "30,000냥",
    description: "가볍게 시작하기 좋은 기본 충전",
  },
  {
    id: "nyang_50000",
    amount: 50000,
    points: 55000, // 10% 보너스 예시
    bonus: 5000,
    label: "50,000냥",
    description: "가장 많이 선택하는 인기 옵션",
    popular: true,
  },
  {
    id: "nyang_100000",
    amount: 100000,
    points: 120000, // 20% 보너스 예시
    bonus: 20000,
    label: "100,000냥",
    description: "넉넉하게 즐기는 대용량 충전",
  },
];

interface PointsChargeViewProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function PointsChargeView({ user }: PointsChargeViewProps) {
  const [selectedOption, setSelectedOption] = useState<PointOption | null>(
    null
  );
  const [showPayment, setShowPayment] = useState(false);

  const handleChargeClick = (option: PointOption) => {
    setSelectedOption(option);
    setShowPayment(true);
  };

  const generateOrderId = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `NYANG-${dateStr}-${randomStr}`;
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3 pt-8">
        {CHARGE_OPTIONS.map((option) => (
          <Card
            key={option.id}
            className={`relative border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
              option.popular
                ? "border-[#F2779C] shadow-lg scale-105 md:scale-110 z-10 bg-white"
                : "border-transparent bg-white/80 backdrop-blur-sm hover:border-[#3BB4C1]/50 hover:bg-white"
            }`}
          >
            {option.popular && (
              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-[#F2779C] to-[#3BB4C1] px-4 py-1 text-xs font-bold text-white shadow-md animate-bounce-slow">
                인기 선택
              </div>
            )}

            <CardHeader className="text-center pb-2 pt-8">
              <div
                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors ${
                  option.popular ? "bg-[#FFF5F5]" : "bg-gray-50"
                }`}
              >
                <Coins
                  className={`h-8 w-8 ${option.popular ? "text-[#F2779C]" : "text-[#3BB4C1]"}`}
                />
              </div>
              <CardTitle className="text-2xl font-bold text-[#2C3E50]">
                {option.label}
              </CardTitle>
              <CardDescription className="text-[#7f8c8d]">
                {option.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center pb-6">
              <div className="text-3xl font-bold text-[#2C3E50]">
                {option.amount.toLocaleString()}원
              </div>
              {option.bonus && (
                <div className="mt-2 inline-block rounded-lg bg-[#F2779C]/10 px-3 py-1 text-sm font-bold text-[#F2779C]">
                  + {option.bonus.toLocaleString()}냥 추가 증정!
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                onClick={() => handleChargeClick(option)}
                className={`w-full py-6 text-lg font-bold shadow-md transition-all duration-300 ${
                  option.popular
                    ? "bg-gradient-to-r from-[#F2779C] to-[#3BB4C1] text-white hover:opacity-90 hover:shadow-lg"
                    : "bg-white text-[#2C3E50] border-2 border-[#3BB4C1] hover:bg-[#3BB4C1] hover:text-white hover:border-[#3BB4C1]"
                }`}
              >
                충전하기
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* {showPayment && selectedOption && (
        <PaymentWidget
          onClose={() => setShowPayment(false)}
          amount={selectedOption.amount}
          orderName={`${selectedOption.label} 충전`}
          orderId={generateOrderId()}
          customerName={user?.name || ""}
          customerEmail={user?.email || ""}
          isEvent={true} // 포인트 충전임을 표시
          eventText={`POINT_CHARGE:${selectedOption.points}`} // 충전될 포인트 양 전달
        />
      )} */}
    </>
  );
}
