"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Badge } from "@repo/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@repo/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { toast } from "sonner";
import { Search, Filter, RefreshCw, Download, Calendar } from "lucide-react";
import { PAYMENT_STATUS } from "@repo/database";
import { StatusBadge } from "./get-status-badge";
import { getRefundInfo } from "@/serverActions/admin/payment.actions";
import type { Payment } from "@repo/database";
import dayjs from "dayjs";
import Pagination from "../../(_components)/pagination";

type PaymentWithDetail = Payment & {
  user?: { nickname?: string };
  isTest?: boolean;
};

interface PaymentHistoryTabProps {
  payments: PaymentWithDetail[];
  onRefundModalOpen: (payment: PaymentWithDetail, refundInfo: any) => void;
}

export function PaymentHistoryTab({
  payments,
  onRefundModalOpen,
}: PaymentHistoryTabProps) {
  const router = useRouter();
  const [filteredPayments, setFilteredPayments] =
    useState<PaymentWithDetail[]>(payments);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingRefundInfo, setIsLoadingRefundInfo] = useState(false);
  const pageSize = 30;

  // 결제 내역 필터링
  useEffect(() => {
    let filtered = [...payments];

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.user?.nickname?.includes(searchTerm) ||
          payment.merchantUid?.includes(searchTerm)
      );
    }

    // 상태 필터링
    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
    // 필터링이 변경될 때 첫 페이지로 이동
    setCurrentPage(1);
  }, [payments, searchTerm, statusFilter]);

  // 결제 내역 CSV 다운로드
  const handleDownloadCSV = () => {
    const headers =
      "결제ID,주문번호,구매 옵션,고객명,금액,상태,결제수단,결제일시\n";

    const csvContent = filteredPayments.reduce((acc, payment) => {
      const row = [
        payment.id,
        payment.merchantUid,
        payment.user?.nickname,
        payment.amount,
        payment.status,
        payment.method,
        dayjs(payment.createdAt).format("YYYY-MM-DD HH:mm:ss"),
      ].join(",");

      return acc + row + "\n";
    }, headers);

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `payment_history_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("결제 내역이 CSV 파일로 다운로드되었습니다.");
  };

  const handleRefundClick = async (payment: PaymentWithDetail) => {
    // 테스트 결제는 조기 return
    if (payment.isTest) {
      toast.error("테스트 결제는 환불 처리가 불가능합니다.");
      return;
    }

    // 중복 클릭 방지
    if (isLoadingRefundInfo) {
      return;
    }

    setIsLoadingRefundInfo(true);

    try {
      // 환불 정보 비동기 로드
      const refundInfoData = await getRefundInfo(BigInt(payment.id));

      // 모든 상태를 한번에 설정 (단일 리렌더)
      onRefundModalOpen(payment, refundInfoData);
    } catch (error) {
      console.error("환불 정보 로드 실패:", error);
      toast.error("환불 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingRefundInfo(false);
    }
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#E53935]" />
          결제 내역
        </CardTitle>
        <CardDescription>
          모든 결제 내역을 조회하고 관리할 수 있습니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 필터 및 검색 */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="이름, 주문번호, 구매 옵션으로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>상태 필터</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="COMPLETED">완료</SelectItem>
                <SelectItem value="CANCELED">취소됨</SelectItem>
                <SelectItem value="REFUNDING">환불진행중</SelectItem>
                <SelectItem value="REFUNDED">환불완료</SelectItem>
                <SelectItem value="FAILED">실패</SelectItem>
                <SelectItem value="PARTIAL_REFUNDED">부분환불</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleDownloadCSV}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setFilteredPayments([...payments]);
                setSearchTerm("");
                setStatusFilter("all");
                setCurrentPage(1);
                router.refresh();
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 결제 내역 테이블 */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">주문번호</TableHead>
                <TableHead className="text-center">고객명</TableHead>
                <TableHead className="text-center">금액</TableHead>
                <TableHead className="text-center">결제수단</TableHead>
                <TableHead className="text-center">상태</TableHead>
                <TableHead className="text-center">테스트</TableHead>
                <TableHead className="text-center">결제일시</TableHead>
                <TableHead className="text-center">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.merchantUid}</TableCell>
                    <TableCell className="text-center">
                      {payment.user?.nickname}
                    </TableCell>
                    <TableCell className="text-center">
                      {payment.amount.toLocaleString()}원
                    </TableCell>
                    <TableCell className="text-center">
                      {payment.method}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell className="text-center">
                      {payment.isTest ? (
                        <Badge className="bg-blue-500">테스트 결제</Badge>
                      ) : (
                        <Badge className="bg-red-500">실제 결제</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {dayjs(payment.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRefundClick(payment)}
                        disabled={
                          payment.status !== PAYMENT_STATUS.COMPLETED ||
                          payment.isTest ||
                          isLoadingRefundInfo
                        }
                      >
                        {isLoadingRefundInfo ? "처리 중..." : "환불"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-8 text-center text-gray-500"
                  >
                    결제 내역이 없거나 검색 조건에 맞는 결과가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* 페이지네이션 */}
        {filteredPayments.length > 0 && (
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalCount={filteredPayments.length}
            setPage={handlePageChange}
          />
        )}
      </CardContent>
    </Card>
  );
}
