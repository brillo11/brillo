"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/alert-dialog";
import { toast } from "sonner";
import PaymentWidget from "@/app/(payment)/components/payment-widget";
import { CreditCard, RefreshCw, Settings, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { cancelPayment } from "@/serverActions/payment/payment.actions";
import type { Payment } from "@repo/database";
import { PAYMENT_STATUS } from "@repo/database";
import { PaymentStats } from "./components/payment-stats";
import { PaymentHistoryTab } from "./components/PaymentHistoryTab";
import { RefundHistoryTab } from "./components/RefundHistoryTab";
import { useSession } from "next-auth/react";

type PaymentWithDetail = Payment & {
  user?: { nickname?: string };
  isTest?: boolean;
};

export default function AdminPaymentClientView({
  payments,
}: {
  payments: PaymentWithDetail[];
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  // 상태 관리
  const [paymentModalOpen, setPaymentModalOpen] = useState<
    null | "test" | "live"
  >(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [selectedOptionData, setSelectedOptionData] = useState<any>(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [customPrice, setCustomPrice] = useState(100);
  const [isCustom, setIsCustom] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [refundInfo, setRefundInfo] = useState<any>(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    successCount: 0,
    cancelCount: 0,
    refundCount: 0,
    partialRefundCount: 0,
  });
  const [refundAmount, setRefundAmount] = useState<number>(0);

  // 통계 계산
  useEffect(() => {
    const stats = {
      totalSales: payments
        .filter(
          (p) => p.status === PAYMENT_STATUS.COMPLETED && p.isTest === false
        )
        .reduce((sum, p) => sum + p.amount, 0),
      successCount: payments.filter(
        (p) => p.status === PAYMENT_STATUS.COMPLETED && p.isTest === false
      ).length,
      cancelCount: payments.filter(
        (p) => p.status === PAYMENT_STATUS.CANCELED && p.isTest === false
      ).length,
      refundCount: payments.filter(
        (p) => p.status === PAYMENT_STATUS.REFUNDED && p.isTest === false
      ).length,
      partialRefundCount: payments.filter(
        (p) =>
          p.status === PAYMENT_STATUS.PARTIAL_REFUNDED && p.isTest === false
      ).length,
    };
    setStats(stats);
  }, [payments]);

  // 환불 다이얼로그 열릴 때 환불 금액 기본값 세팅
  useEffect(() => {
    // 환불 정보가 업데이트되고 다이얼로그가 열린 상태일 때만 실행
    if (isRefundDialogOpen && refundInfo?.refundAmount) {
      setRefundAmount(refundInfo.refundAmount);
    }
  }, [refundInfo]); // isRefundDialogOpen 제거 - refundInfo 변경시에만 실행

  // 환불 처리
  const handleRefund = async (isPartial: boolean = false, amount?: number) => {
    if (!selectedPayment) return;
    setIsLoading(true);
    try {
      // 실제 결제 취소 API 호출
      await cancelPayment(
        selectedPayment.paymentKey,
        refundReason || "관리자에 의한 환불",
        amount || null,
        isPartial
      );
      toast.error(`환불이 처리되었습니다. 결제 ID: ${selectedPayment.id}`);
    } catch (e) {
      toast.error("환불 처리 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
      setIsRefundDialogOpen(false);
      setRefundReason("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* 헤더 */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-[#E53935]" />
                <h1 className="text-2xl font-bold text-gray-900">결제 관리</h1>
              </div>
              <p className="text-gray-600">
                결제 테스트, 취소, 환불 및 결제 내역을 관리합니다
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push("/admin")}>
                <Settings className="mr-2 h-4 w-4" />
                관리자 대시보드
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 통계 카드 */}₩
        <PaymentStats stats={stats} />
        <Tabs defaultValue="payment-history">
          <TabsList className="mb-8 grid w-full grid-cols-3">
            <TabsTrigger value="payment-history" className="text-base">
              <Calendar className="mr-2 h-4 w-4" />
              결제 내역
            </TabsTrigger>
            <TabsTrigger value="refund-history" className="text-base">
              <CreditCard className="mr-2 h-4 w-4" />
              환불 내역
            </TabsTrigger>
            <TabsTrigger value="payment-test" className="text-base">
              <CreditCard className="mr-2 h-4 w-4" />
              결제 테스트
            </TabsTrigger>
          </TabsList>

          {/* 결제 내역 탭 */}
          <TabsContent value="payment-history">
            <PaymentHistoryTab
              payments={payments}
              onRefundModalOpen={(payment, refundInfo) => {
                // React 18의 자동 배치로 단일 리렌더 보장
                setSelectedPayment(payment);
                setRefundInfo(refundInfo);
                setIsRefundDialogOpen(true);
              }}
            />
          </TabsContent>

          {/* 환불 내역 탭 */}
          <TabsContent value="refund-history">
            <RefundHistoryTab />
          </TabsContent>

          {/* 결제 테스트 탭 */}
          <TabsContent value="payment-test">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#E53935]" />
                    결제 테스트
                  </CardTitle>
                  <CardDescription>
                    테스트 결제를 생성하고 다양한 결제 시나리오를 테스트할 수
                    있습니다
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="course">상품 선택</Label>
                      <Select
                        value={selectedOption}
                        onValueChange={(value) => setSelectedOption(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="상품을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">
                            직접 입력 (커스텀)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {isCustom && (
                      <div className="mt-2">
                        <Label htmlFor="customPrice">직접 입력 금액</Label>
                        <Input
                          id="customPrice"
                          type="number"
                          min={100}
                          value={customPrice}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setCustomPrice(value);
                            setFinalPrice(value);
                          }}
                          placeholder="금액을 입력하세요"
                        />
                      </div>
                    )}
                    <div className="border-t pt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-gray-600">상품 금액</span>
                        <span className="font-medium">
                          {selectedOptionData?.price?.toLocaleString() ||
                            (isCustom ? customPrice.toLocaleString() : "")}
                          원
                        </span>
                      </div>
                      {selectedOptionData?.earlyBirdPrice &&
                        selectedOptionData.earlyBirdPrice <
                          selectedOptionData.price && (
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-gray-600">할인 금액</span>
                            <span className="font-medium text-red-600">
                              -
                              {(
                                selectedOptionData.price -
                                selectedOptionData.earlyBirdPrice
                              ).toLocaleString()}
                              원
                            </span>
                          </div>
                        )}
                      <div className="flex items-center justify-between border-t pt-2">
                        <span className="font-semibold">최종 결제 금액</span>
                        <span className="text-xl font-bold text-[#E53935]">
                          {finalPrice.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setPaymentModalOpen("test")}
                  >
                    테스트 결제
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => setPaymentModalOpen("live")}
                  >
                    실 결제
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          {/* 환불 관리 탭 */}
        </Tabs>
      </div>

      {/* 결제 위젯 모달 */}
      {paymentModalOpen && (
        <PaymentWidget
          onClose={() => setPaymentModalOpen(null)}
          amount={finalPrice}
          orderName={selectedOptionData?.name}
          orderId={`order_${Date.now()}${user?.id}_${selectedOption}`}
          customerName={user?.nickname || "테스트 사용자"}
          env={paymentModalOpen}
          isEvent={false}
        />
      )}

      {/* 환불 처리 다이얼로그 */}
      <AlertDialog
        open={isRefundDialogOpen}
        onOpenChange={setIsRefundDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>환불 처리</AlertDialogTitle>
            <AlertDialogDescription>
              다음 결제에 대한 환불을 처리합니다
            </AlertDialogDescription>
            {selectedPayment && (
              <div className="space-y-2">
                <div className="space-y-1 rounded-md bg-gray-50 p-3 text-sm">
                  <p>
                    <span className="font-medium">주문번호 : </span>
                    {selectedPayment.merchantUid}
                  </p>
                  <p>
                    <span className="font-medium">고객명 : </span>{" "}
                    {selectedPayment.user?.nickname}
                  </p>
                  <p>
                    <span className="font-medium">결제 금액:</span>{" "}
                    {refundInfo?.paymentAmount?.toLocaleString()}원
                  </p>
                  <p>
                    <span className="font-medium">진도율:</span>{" "}
                    {refundInfo?.progress != null ? refundInfo.progress : 0}%
                  </p>
                </div>
                {/* 환불 금액 입력 */}
                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    환불 금액(원)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selectedPayment?.amount}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    className="w-full rounded border px-3 py-2 text-sm"
                    placeholder="부분 환불 금액을 입력하세요"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    환불 규정에 따라 자동 계산된 금액이 기본값으로 입력됩니다.
                  </p>
                </div>
              </div>
            )}
          </AlertDialogHeader>

          <div className="py-4">
            <Label htmlFor="refundReason" className="mb-2 block">
              환불 사유
            </Label>
            <Input
              id="refundReason"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="환불 사유를 입력하세요"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>취소</AlertDialogCancel>
            <div className="flex w-full gap-2">
              {/* 부분 환불 버튼 */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="flex-1 bg-[#E53935] hover:bg-[#d32f2f]">
                    부분 환불
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>
                    정말로 부분 환불을 진행하시겠습니까?
                    <br />
                    환불 절차는 취소가 불가능합니다.
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    환불 금액은 {refundAmount.toLocaleString()}원입니다.
                  </AlertDialogDescription>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        if (refundAmount > selectedPayment?.amount) {
                          toast.error("환불 금액이 결제 금액을 초과합니다.");
                        } else {
                          handleRefund(
                            refundAmount !== selectedPayment?.amount,
                            refundAmount
                          );
                        }
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          처리 중...
                        </>
                      ) : (
                        "부분 환불"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {/* 전액 환불 버튼 */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="flex-1 bg-gray-300 text-gray-800 hover:bg-gray-400">
                    전액 환불
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>
                    정말로 전액 환불을 진행하시겠습니까?
                    <br />
                    환불 절차는 취소가 불가능합니다.
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    환불 금액은 {selectedPayment?.amount.toLocaleString()}
                    원입니다.
                  </AlertDialogDescription>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleRefund(false)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          처리 중...
                        </>
                      ) : (
                        "전액 환불"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
