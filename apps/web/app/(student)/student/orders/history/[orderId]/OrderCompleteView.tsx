"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { CheckCircle, Copy, Banknote, FileText, Clock } from "lucide-react";
import { toast } from "sonner";

interface OrderCompleteViewProps {
  order: {
    id: bigint | string;
    merchantUid: string | null;
    orderName: string;
    amount: number;
    status: string;
    method: string;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      nickname: string | null;
      email: string | null;
    };
  };
}

export function OrderCompleteView({ order }: OrderCompleteViewProps) {
  const [copied, setCopied] = useState(false);

  const orderIdStr = typeof order.id === "bigint" ? order.id.toString() : order.id;
  const orderNumber = order.merchantUid || `YH-${orderIdStr}`;
  const formattedAmount = order.amount.toLocaleString();

  // 주문번호 복사
  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber).then(() => {
      setCopied(true);
      toast.success("주문번호가 복사되었습니다!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // 계좌정보 복사
  const copyAccountInfo = () => {
    const accountInfo = `[연화당 입금 계좌]\nKB국민은행 123456-78-901234\n예금주: 연화당\n입금액: ${formattedAmount}원\n주문번호: ${orderNumber}`;
    
    navigator.clipboard.writeText(accountInfo).then(() => {
      toast.success("계좌 정보가 클립보드에 복사되었습니다.");
    });
  };

  // 주문 상태에 따른 프로세스 단계 결정
  const getProcessSteps = () => {
    const steps = [
      { icon: "🏦", title: "입금 확인", time: "대기중", completed: false, active: false },
      { icon: "⚡", title: "사주 분석", time: "대기중", completed: false, active: false },
      { icon: "📄", title: "리포트 완성", time: "대기중", completed: false, active: false },
      { icon: "📧", title: "알림 발송", time: "대기중", completed: false, active: false },
    ];

    if (order.status === "COMPLETED") {
      steps[0].completed = true;
      steps[1].active = true;
    }

    return steps;
  };

  const processSteps = getProcessSteps();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9EBDD] to-[#FAF0E6]">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* 성공 헤더 */}
        <Card className="mb-6 border-0 bg-white shadow-lg">
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#27ae60] to-[#2ecc71] rounded-t-lg" />
            <CardContent className="p-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#27ae60] to-[#2ecc71] text-3xl text-white shadow-lg">
                  <CheckCircle className="h-8 w-8" />
                </div>
              </div>
              <h1 className="mb-2 text-2xl font-bold text-[#2C3E50]">
                주문이 접수되었습니다!
              </h1>
              <p className="mb-6 text-sm text-[#7f8c8d]">
                연화당과 함께해 주셔서 감사합니다.
                <br />
                입금 확인 후 정확하고 자세한 사주 분석을 받아보실 수 있습니다.
              </p>
              
              <div className="inline-block rounded-xl bg-gradient-to-r from-[#F2779C]/10 to-[#3BB4C1]/10 p-3">
                <div className="mb-1 text-xs text-[#7f8c8d]">주문번호</div>
                <div
                  className="cursor-pointer font-mono text-lg font-bold text-[#F2779C] transition-opacity hover:opacity-80"
                  onClick={copyOrderNumber}
                >
                  {orderNumber}
                  <Copy className="ml-2 inline h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 계좌 정보 박스 */}
          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#3BB4C1]">
                <Banknote className="h-5 w-5" />
                입금 계좌 정보
              </h2>
              <div className="mb-4 rounded-r-xl border-l-4 border-[#3BB4C1] bg-gradient-to-r from-[#3BB4C1]/10 to-[#2ecc71]/10 p-5">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-[#7f8c8d]">은행명</span>
                  <span className="font-semibold text-[#2C3E50]">KB국민은행</span>
                </div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-[#7f8c8d]">계좌번호</span>
                  <span className="font-semibold text-[#2C3E50]">123456-78-901234</span>
                </div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-[#7f8c8d]">예금주</span>
                  <span className="font-semibold text-[#2C3E50]">연화당</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#7f8c8d]">입금액</span>
                  <span className="text-base font-bold text-[#F2779C]">{formattedAmount}원</span>
                </div>
                <div className="mt-4 border-t border-[#3BB4C1]/20 pt-4 text-xs text-[#7f8c8d] leading-relaxed">
                  ※ 입금자명은 주문자명({order.user.nickname || order.user.name})과 동일하게 해주세요.
                  <br />
                  ※ 다른 명의로 입금 시 주문번호를 함께 기재해 주세요.
                </div>
              </div>
              <Button
                onClick={copyAccountInfo}
                className="w-full bg-[#3BB4C1] text-white hover:bg-[#2C8A99]"
              >
                <Copy className="mr-2 h-4 w-4" />
                계좌정보 복사
              </Button>
            </CardContent>
          </Card>

          {/* 주문 정보 박스 */}
          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#3BB4C1]">
                <FileText className="h-5 w-5" />
                주문 정보
              </h2>
              <div className="rounded-xl bg-[#f8f9fa] p-4">
                <div className="mb-2 flex justify-between border-b border-[#e0e0e0] pb-2 text-sm">
                  <span className="text-[#7f8c8d]">상품명</span>
                  <span className="font-medium text-[#2C3E50]">{order.orderName}</span>
                </div>
                <div className="mb-2 flex justify-between border-b border-[#e0e0e0] pb-2 text-sm">
                  <span className="text-[#7f8c8d]">주문자</span>
                  <span className="font-medium text-[#2C3E50]">
                    {order.user.nickname || order.user.name}
                  </span>
                </div>
                <div className="mb-2 flex justify-between border-b border-[#e0e0e0] pb-2 text-sm">
                  <span className="text-[#7f8c8d]">결제방법</span>
                  <span className="font-medium text-[#2C3E50]">
                    {order.method === "무통장입금" ? "무통장입금" : order.method}
                  </span>
                </div>
                <div className="flex justify-between pt-2 text-base font-semibold text-[#F2779C]">
                  <span>총 주문금액</span>
                  <span>{formattedAmount}원</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 진행 프로세스 */}
        <Card className="mt-6 border-0 bg-white shadow-lg">
          <CardContent className="p-6">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-[#3BB4C1]">
              <Clock className="h-5 w-5" />
              리포트 생성 프로세스
            </h2>
            <div className="relative mb-6">
              <div className="absolute top-5 left-10 right-10 h-0.5 bg-[#e0e0e0] md:block" />
              <div className="relative flex flex-col gap-6 md:flex-row md:justify-between">
                {processSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center ${
                      step.completed ? "completed" : step.active ? "active" : ""
                    }`}
                  >
                    <div
                      className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full text-base text-white ${
                        step.completed
                          ? "bg-gradient-to-r from-[#27ae60] to-[#2ecc71]"
                          : step.active
                          ? "animate-pulse bg-gradient-to-r from-[#F2779C] to-[#3BB4C1]"
                          : "bg-[#bdc3c7]"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-[#2C3E50]">{step.title}</div>
                      <div className="text-[10px] text-[#7f8c8d]">{step.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/student">
                <Button className="rounded-full bg-gradient-to-r from-[#F2779C] to-[#3BB4C1] px-6 py-2 text-sm font-semibold text-white hover:opacity-90">
                  마이페이지 바로가기
                </Button>
              </Link>
              <Link href="/student/products">
                <Button
                  variant="outline"
                  className="rounded-full border-2 border-[#F2779C] px-6 py-2 text-sm font-semibold text-[#F2779C] hover:bg-[#F2779C]/10"
                >
                  다른 상품 보기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

