"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { RefreshCw, Search, Calendar, CreditCard } from "lucide-react";
import { getRefundsWithDetail } from "@/serverActions/payment/payment.actions";
import { toast } from "sonner";

// 환불 상태 배지 색상
const getRefundStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING":
      return <Badge variant="secondary">환불대기</Badge>;
    case "PROCESSING":
      return <Badge variant="secondary">환불처리중</Badge>;
    case "COMPLETED":
      return <Badge variant="default">환불완료</Badge>;
    case "FAILED":
      return <Badge variant="destructive">환불실패</Badge>;
    case "CANCELED":
      return <Badge variant="outline">환불취소</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// 환불 방법 표시
const getRefundMethod = (method: string | null) => {
  if (!method) return "미정";
  switch (method) {
    case "카드":
      return "카드취소";
    case "계좌이체":
      return "계좌이체";
    default:
      return method;
  }
};

export function RefundHistoryTab() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [filteredRefunds, setFilteredRefunds] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRefunds: 0,
    totalAmount: 0,
    completedCount: 0,
    pendingCount: 0,
  });

  // 환불 내역 로드
  const loadRefunds = async () => {
    setIsLoading(true);
    try {
      const data = await getRefundsWithDetail();
      setRefunds(data);
      setFilteredRefunds(data);

      // 통계 계산
      const stats = {
        totalRefunds: data.length,
        totalAmount: data.reduce(
          (sum: number, refund: any) => sum + refund.amount,
          0
        ),
        completedCount: data.filter((r: any) => r.status === "COMPLETED")
          .length,
        pendingCount: data.filter((r: any) => r.status === "PENDING").length,
      };
      setStats(stats);
    } catch (error) {
      toast.error("환불 내역을 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  // 검색 필터링
  useEffect(() => {
    if (!searchTerm) {
      setFilteredRefunds(refunds);
      return;
    }

    const filtered = refunds.filter((refund) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        refund.payment?.merchantUid?.toLowerCase().includes(searchLower) ||
        refund.payment?.user?.nickname?.toLowerCase().includes(searchLower) ||
        refund.reason?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredRefunds(filtered);
  }, [searchTerm, refunds]);

  // 초기 데이터 로드
  useEffect(() => {
    loadRefunds();
  }, []);

  return (
    <div className="space-y-6">
      {/* 환불 통계 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">총 환불 건수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRefunds}건</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">총 환불 금액</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.totalAmount.toLocaleString()}원
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">완료된 환불</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completedCount}건
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              대기 중인 환불
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingCount}건
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 환불 내역 테이블 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#E53935]" />
                환불 내역
              </CardTitle>
              <CardDescription>
                모든 환불 내역을 확인하고 관리할 수 있습니다
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadRefunds}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              새로고침
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 검색 */}
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="주문번호, 고객명, 환불 사유로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 환불 내역 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left text-sm font-medium">환불 ID</th>
                  <th className="p-3 text-left text-sm font-medium">
                    주문번호
                  </th>
                  <th className="p-3 text-left text-sm font-medium">고객명</th>
                  <th className="p-3 text-left text-sm font-medium">
                    환불 금액
                  </th>
                  <th className="p-3 text-left text-sm font-medium">
                    환불 사유
                  </th>
                  <th className="p-3 text-left text-sm font-medium">상태</th>
                  <th className="p-3 text-left text-sm font-medium">
                    환불 방법
                  </th>
                  <th className="p-3 text-left text-sm font-medium">처리일</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500">
                      {isLoading
                        ? "환불 내역을 불러오는 중..."
                        : "환불 내역이 없습니다"}
                    </td>
                  </tr>
                ) : (
                  filteredRefunds.map((refund) => (
                    <tr key={refund.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm">#{refund.id}</td>
                      <td className="p-3 font-mono text-sm">
                        {refund.payment?.merchantUid || "N/A"}
                      </td>
                      <td className="p-3 text-sm">
                        {refund.payment?.user?.nickname || "N/A"}
                      </td>
                      <td className="p-3 text-sm font-medium text-red-600">
                        {refund.amount.toLocaleString()}원
                      </td>
                      <td className="p-3 text-sm">
                        <div
                          className="max-w-48 truncate"
                          title={refund.reason}
                        >
                          {refund.reason}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {getRefundStatusBadge(refund.status)}
                      </td>
                      <td className="p-3 text-sm">
                        {getRefundMethod(refund.refundMethod)}
                      </td>
                      <td className="p-3 text-sm">
                        {refund.processedAt ? (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {new Date(refund.processedAt).toLocaleDateString()}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 또는 추가 정보 */}
          {filteredRefunds.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>총 {filteredRefunds.length}개의 환불 내역</span>
              <span>
                총 환불 금액:{" "}
                {filteredRefunds
                  .reduce((sum, r) => sum + r.amount, 0)
                  .toLocaleString()}
                원
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
