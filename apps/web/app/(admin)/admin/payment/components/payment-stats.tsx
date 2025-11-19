import { Card, CardContent } from "@repo/ui/components/card";
import { BarChart4, CheckCircle, XCircle } from "lucide-react";

export function PaymentStats({
  stats
}: {
  stats: {
    totalSales: number;
    successCount: number;
    refundCount: number;
    partialRefundCount: number;
    cancelCount: number;
  };
}) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">총 매출액</p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">
                {stats.totalSales.toLocaleString()}원
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <BarChart4 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">결제 완료</p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">
                {stats.successCount}건
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">취소/환불</p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">
                {stats.refundCount + stats.cancelCount}건
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
