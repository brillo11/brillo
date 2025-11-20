"use client";

import { useEffect, useState } from "react";
import { getOrderHistory } from "@/serverActions/pointOrder.actions";
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

const statusMap: Record<string, { label: string; className: string }> = {
  PAID: { label: "결제완료", className: "bg-green-100 text-green-700" },
  DELIVERED: { label: "전송완료", className: "bg-blue-100 text-blue-700" },
  CANCELED: { label: "결제취소", className: "bg-gray-100 text-gray-700" },
  REFUNDED: { label: "환불완료", className: "bg-red-100 text-red-700" },
  PARTIAL_REFUNDED: { label: "부분환불", className: "bg-orange-100 text-orange-700" },
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<PointOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrderHistory();
        setOrders(data as any);
      } catch (error) {
        console.error("Failed to fetch order history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fbf4ec]">
        <div className="text-stone-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fbf4ec] p-4 lg:p-6">
      <div className="max-w-screen-xl mx-auto w-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">확정 주문</h1>
            <p className="text-stone-600 text-sm mt-1">
              주문이 확정되어 고객에게 전송됩니다.
            </p>
          </div>
          <Link href="/student/orders/entry">
            <Button className="bg-stone-800 text-white hover:bg-stone-700">
              + 주문 등록
            </Button>
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    이름
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    상품명
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    가격
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    생년월일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    주문 날짜
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    확정 날짜
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-stone-500">
                      확정된 주문이 없습니다.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const status = statusMap[order.status] || { 
                      label: order.status, 
                      className: "bg-gray-100 text-gray-700" 
                    };
                    
                    return (
                      <tr key={order.id.toString()} className="hover:bg-stone-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-stone-900">
                          {order.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-stone-600">
                          {order.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-stone-900">
                          {order.product.name}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-stone-900">
                          {order.product.price.toLocaleString()}원
                        </td>
                        <td className="px-4 py-3 text-sm text-stone-600">
                          {order.birthYear}.{String(order.birthMonth).padStart(2, '0')}.{String(order.birthDay).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-stone-500">
                          {kdayjs(order.createdAt).format("YYYY년 MM월 DD일")}
                        </td>
                        <td className="px-4 py-3 text-sm text-stone-500">
                          {kdayjs(order.updatedAt).format("YYYY년 MM월 DD일 HH:mm")}
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
