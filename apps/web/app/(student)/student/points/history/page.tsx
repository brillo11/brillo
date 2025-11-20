"use client";

import { useState } from "react";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";

interface PointHistory {
  id: string;
  createdAt: Date;
  amount: number;
  type: "CHARGE" | "USE" | "REFUND";
  status: "COMPLETED" | "PENDING" | "FAILED";
  method?: string;
  description: string;
  balance: number;
}

// Mock data
const mockHistory: PointHistory[] = [
  {
    id: "1",
    createdAt: new Date("2024-11-20T14:30:00"),
    amount: 50000,
    type: "CHARGE",
    status: "COMPLETED",
    method: "카드결제",
    description: "복비 충전",
    balance: 150000,
  },
  {
    id: "2",
    createdAt: new Date("2024-11-19T10:15:00"),
    amount: -30000,
    type: "USE",
    status: "COMPLETED",
    description: "종합사주 분석 주문",
    balance: 100000,
  },
  {
    id: "3",
    createdAt: new Date("2024-11-18T16:45:00"),
    amount: 100000,
    type: "CHARGE",
    status: "COMPLETED",
    method: "카드결제",
    description: "복비 충전",
    balance: 130000,
  },
  {
    id: "4",
    createdAt: new Date("2024-11-17T09:20:00"),
    amount: -20000,
    type: "USE",
    status: "COMPLETED",
    description: "궁합 분석 주문",
    balance: 30000,
  },
  {
    id: "5",
    createdAt: new Date("2024-11-15T11:00:00"),
    amount: 50000,
    type: "CHARGE",
    status: "COMPLETED",
    method: "계좌이체",
    description: "복비 충전",
    balance: 50000,
  },
  {
    id: "6",
    createdAt: new Date("2024-11-14T13:30:00"),
    amount: 30000,
    type: "CHARGE",
    status: "PENDING",
    method: "카드결제",
    description: "복비 충전 (처리중)",
    balance: 0,
  },
  {
    id: "7",
    createdAt: new Date("2024-11-13T15:10:00"),
    amount: 20000,
    type: "CHARGE",
    status: "FAILED",
    method: "카드결제",
    description: "복비 충전 실패",
    balance: 0,
  },
];

const typeMap = {
  CHARGE: { label: "충전", className: "bg-blue-100 text-blue-700", icon: "💰" },
  USE: {
    label: "사용",
    className: "bg-orange-100 text-orange-700",
    icon: "📤",
  },
  REFUND: {
    label: "환불",
    className: "bg-green-100 text-green-700",
    icon: "💸",
  },
};

const statusMap = {
  COMPLETED: { label: "완료", className: "bg-green-100 text-green-700" },
  PENDING: { label: "처리중", className: "bg-yellow-100 text-yellow-700" },
  FAILED: { label: "실패", className: "bg-red-100 text-red-700" },
};

export default function PointsHistoryPage() {
  const [history] = useState<PointHistory[]>(mockHistory);
  const [filter, setFilter] = useState<"ALL" | "CHARGE" | "USE">("ALL");

  const filteredHistory = history.filter((item) => {
    if (filter === "ALL") return true;
    return item.type === filter;
  });

  const totalCharged = history
    .filter((h) => h.type === "CHARGE" && h.status === "COMPLETED")
    .reduce((sum, h) => sum + h.amount, 0);

  const totalUsed = history
    .filter((h) => h.type === "USE" && h.status === "COMPLETED")
    .reduce((sum, h) => sum + Math.abs(h.amount), 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#fbf4ec] p-4 lg:p-6">
      <div className="max-w-7xl mx-auto w-full flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">복비 내역</h1>
            <p className="text-stone-600 text-sm mt-1">
              복비 충전 및 사용 내역을 확인할 수 있습니다.
            </p>
          </div>
          <Link href="/student/points/charge">
            <Button className="bg-gradient-to-r from-[#3BB4C1] to-[#2C8A99] text-white hover:opacity-90">
              💰 복비 충전
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 mb-1">총 충전 금액</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalCharged.toLocaleString()}냥
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 mb-1">총 사용 금액</p>
                <p className="text-2xl font-bold text-orange-600">
                  {totalUsed.toLocaleString()}냥
                </p>
              </div>
              <div className="text-4xl">📤</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 mb-1">현재 잔액</p>
                <p className="text-2xl font-bold text-green-600">
                  {(totalCharged - totalUsed).toLocaleString()}냥
                </p>
              </div>
              <div className="text-4xl">💎</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-200">
          <div className="flex gap-2">
            <Button
              variant={filter === "ALL" ? "default" : "outline"}
              onClick={() => setFilter("ALL")}
              className={
                filter === "ALL"
                  ? "bg-stone-800 text-white"
                  : "border-stone-300 text-stone-700"
              }
            >
              전체
            </Button>
            <Button
              variant={filter === "CHARGE" ? "default" : "outline"}
              onClick={() => setFilter("CHARGE")}
              className={
                filter === "CHARGE"
                  ? "bg-blue-600 text-white"
                  : "border-stone-300 text-stone-700"
              }
            >
              💰 충전
            </Button>
            <Button
              variant={filter === "USE" ? "default" : "outline"}
              onClick={() => setFilter("USE")}
              className={
                filter === "USE"
                  ? "bg-orange-600 text-white"
                  : "border-stone-300 text-stone-700"
              }
            >
              📤 사용
            </Button>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    날짜
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    구분
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    내용
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    결제수단
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    금액
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    잔액
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-stone-500"
                    >
                      내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => {
                    const type = typeMap[item.type];
                    const status = statusMap[item.status];

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-stone-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-stone-600">
                          {kdayjs(item.createdAt).format("YYYY.MM.DD HH:mm")}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${type.className}`}
                          >
                            <span>{type.icon}</span>
                            {type.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-stone-900">
                          {item.description}
                        </td>
                        <td className="px-4 py-3 text-sm text-stone-600">
                          {item.method || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-right">
                          <span
                            className={
                              item.amount > 0
                                ? "text-blue-600"
                                : "text-orange-600"
                            }
                          >
                            {item.amount > 0 ? "+" : ""}
                            {item.amount.toLocaleString()}냥
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-stone-900 text-right">
                          {item.status === "COMPLETED"
                            ? `${item.balance.toLocaleString()}냥`
                            : "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
