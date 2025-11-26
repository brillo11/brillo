"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";

interface PointOrder {
  id: bigint;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  name: string;
  orderName: string;
  amount: number;
  product: {
    name: string;
    price: number;
  };
  calendar: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  gender: string;
  status: string;
}

export default function ReportPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<PointOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // For now, we'll use mock data. In production, fetch from API
        // const response = await fetch(`/api/orders/${orderId}`);
        // const data = await response.json();

        // Mock data for demonstration
        const mockOrder: PointOrder = {
          id: BigInt(orderId),
          createdAt: new Date(),
          updatedAt: new Date(),
          email: "example@email.com",
          name: "김연화",
          orderName: "2024년 학습 분석",
          amount: 1,
          product: {
            name: "종합 학습 분석",
            price: 50000,
          },
          calendar: "SOLAR",
          birthYear: 1990,
          birthMonth: 3,
          birthDay: 15,
          birthHour: 14,
          birthMinute: 30,
          gender: "FEMALE",
          status: "DELIVERED",
        };

        setOrder(mockOrder);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-stone-600">로딩 중...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-stone-600">주문을 찾을 수 없습니다.</div>
      </div>
    );
  }

  const birthTime = `${order.birthHour.toString().padStart(2, "0")}:${order.birthMinute.toString().padStart(2, "0")}`;
  const genderText = order.gender === "FEMALE" ? "여성" : "남성";

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Report Header */}
        <div className="bg-white rounded-2xl p-8 mb-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3B82F6] to-[#1E3A8A]" />

          <div className="text-center">
            <div className="text-5xl mb-4">📚</div>
            <h1 className="text-3xl font-bold text-stone-900 mb-2">
              {order.product.name}
            </h1>
            <p className="text-stone-600 mb-6">
              {order.name}님의 {order.birthYear}년생 운세 및 상세 분석 리포트
            </p>

            {/* Meta Information */}
            <div className="flex justify-center gap-8 mb-6 flex-wrap">
              <div className="text-center">
                <div className="text-xs text-stone-500 mb-1">생년월일</div>
                <div className="text-sm font-semibold text-stone-900">
                  {order.birthYear}.{String(order.birthMonth).padStart(2, "0")}.
                  {String(order.birthDay).padStart(2, "0")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-stone-500 mb-1">출생시간</div>
                <div className="text-sm font-semibold text-stone-900">
                  {birthTime}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-stone-500 mb-1">성별</div>
                <div className="text-sm font-semibold text-stone-900">
                  {genderText}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-stone-500 mb-1">분석일</div>
                <div className="text-sm font-semibold text-stone-900">
                  {kdayjs(order.createdAt).format("YYYY.MM.DD")}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 flex-wrap">
              <Button
                className="bg-gradient-to-r from-[#3B82F6] to-[#1E3A8A] text-white hover:opacity-90"
                onClick={() => alert("PDF 다운로드 기능은 준비중입니다.")}
              >
                📄 PDF 다운로드
              </Button>
              <Link href="/student/orders/history">
                <Button
                  variant="outline"
                  className="border-stone-300 text-stone-700"
                >
                  ↩️ 주문 내역
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Report Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 pb-3 border-b-2 border-[#3B82F6]/20">
              🎯 학습 기본 정보
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#3B82F6]/5 to-[#1E3A8A]/5 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">🐎</div>
                <div className="text-xs text-stone-500 mb-1">띠</div>
                <div className="text-sm font-semibold text-[#3B82F6]">말띠</div>
              </div>
              <div className="bg-gradient-to-br from-[#3B82F6]/5 to-[#1E3A8A]/5 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">🔥</div>
                <div className="text-xs text-stone-500 mb-1">오행</div>
                <div className="text-sm font-semibold text-[#3B82F6]">
                  화(火)
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#3B82F6]/5 to-[#1E3A8A]/5 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-xs text-stone-500 mb-1">체질</div>
                <div className="text-sm font-semibold text-[#3B82F6]">
                  태양인
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#3B82F6]/5 to-[#1E3A8A]/5 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">💎</div>
                <div className="text-xs text-stone-500 mb-1">행운의 색</div>
                <div className="text-sm font-semibold text-[#3B82F6]">
                  빨강·주황
                </div>
              </div>
            </div>
          </div>

          {/* Fortune Scores */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 pb-3 border-b-2 border-[#3B82F6]/20">
              ✨ 2024년 운세 총평
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  category: "종합운",
                  score: 85,
                  stars: "★★★★☆",
                  color: "text-orange-500",
                },
                {
                  category: "재물운",
                  score: 92,
                  stars: "★★★★★",
                  color: "text-red-500",
                },
                {
                  category: "연애운",
                  score: 76,
                  stars: "★★★☆☆",
                  color: "text-yellow-500",
                },
                {
                  category: "직업운",
                  score: 88,
                  stars: "★★★★☆",
                  color: "text-orange-500",
                },
                {
                  category: "건강운",
                  score: 79,
                  stars: "★★★☆☆",
                  color: "text-yellow-500",
                },
                {
                  category: "학업운",
                  score: 83,
                  stars: "★★★★☆",
                  color: "text-orange-500",
                },
              ].map((item) => (
                <div
                  key={item.category}
                  className="bg-stone-50 rounded-xl p-3 text-center"
                >
                  <div className="text-xs text-stone-500 mb-1">
                    {item.category}
                  </div>
                  <div className={`text-2xl font-bold mb-1 ${item.color}`}>
                    {item.score}
                  </div>
                  <div className="text-yellow-500 text-sm">{item.stars}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Points */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 pb-3 border-b-2 border-[#3B82F6]/20">
              💡 2024년 핵심 포인트
            </h2>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#3B82F6]/10 to-[#1E3A8A]/10 border-l-4 border-[#3B82F6] rounded-r-xl p-4">
                <div className="text-sm font-semibold text-stone-900 mb-2">
                  🎊 길한 운세
                </div>
                <div className="text-xs text-stone-700 leading-relaxed">
                  올해는 전반적으로 상승 기류를 타는 한 해입니다. 특히 재물운과
                  직업운이 매우 좋아 새로운 도전과 투자에 적합한 시기입니다.
                </div>
              </div>
              <div className="bg-gradient-to-r from-[#3B82F6]/10 to-[#1E3A8A]/10 border-l-4 border-[#3B82F6] rounded-r-xl p-4">
                <div className="text-sm font-semibold text-stone-900 mb-2">
                  ⚠️ 주의사항
                </div>
                <div className="text-xs text-stone-700 leading-relaxed">
                  건강 관리에 각별한 주의가 필요합니다. 특히 소화기 계통과
                  스트레스로 인한 불면증에 주의하세요.
                </div>
              </div>
            </div>
          </div>

          {/* Advice */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 pb-3 border-b-2 border-[#3B82F6]/20">
              🔮 개운법 및 조언
            </h2>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#3B82F6]/10 to-[#1E3A8A]/10 border-l-4 border-[#3B82F6] rounded-r-xl p-4">
                <div className="text-sm font-semibold text-stone-900 mb-2">
                  🌟 일상 개운법
                </div>
                <div className="text-xs text-stone-700 leading-relaxed space-y-1">
                  <div>
                    <strong>방향:</strong> 남쪽과 동남쪽
                  </div>
                  <div>
                    <strong>색상:</strong> 빨강, 주황, 분홍
                  </div>
                  <div>
                    <strong>숫자:</strong> 3, 7, 9
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-[#3B82F6]/10 to-[#1E3A8A]/10 border-l-4 border-[#3B82F6] rounded-r-xl p-4">
                <div className="text-sm font-semibold text-stone-900 mb-2">
                  🎯 성공 키워드
                </div>
                <div className="text-xs text-stone-700 leading-relaxed">
                  <strong>"신중한 도전"</strong> - 올해는 많은 기회가 찾아오는
                  해입니다. 신중하게 판단하고 준비된 상태에서 도전하세요.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
