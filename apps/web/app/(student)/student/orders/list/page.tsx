"use client";

import { useEffect, useState } from "react";
import { getPointOrders } from "@/serverActions/pointOrder.actions";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Checkbox } from "@repo/ui/components/checkbox";
import Link from "next/link";

interface PointOrder {
  id: bigint;
  createdAt: Date;
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

export default function OrderListPage() {
  const [orders, setOrders] = useState<PointOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getPointOrders();
        setOrders(data as any);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(orders.map(order => order.id.toString()));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleOrder = (orderId: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(orderId);
    } else {
      newSelected.delete(orderId);
    }
    setSelectedIds(newSelected);
  };

  const selectedOrders = orders.filter(order => 
    selectedIds.has(order.id.toString())
  );

  const totalAmount = selectedOrders.reduce((sum, order) => 
    sum + (order.product.price * order.amount), 0
  );

  const handleConfirmOrders = () => {
    if (selectedIds.size === 0) {
      alert("확정할 주문을 선택해주세요.");
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleFinalConfirm = () => {
    // TODO: Implement actual order confirmation logic
    setConfirmModalOpen(false);
    alert(`${selectedIds.size}건의 주문이 확정되었습니다.`);
    setSelectedIds(new Set());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fbf4ec]">
        <div className="text-stone-600">로딩 중...</div>
      </div>
    );
  }

  const allSelected = orders.length > 0 && selectedIds.size === orders.length;

  return (
    <div className="flex flex-col min-h-screen bg-[#fbf4ec] p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto w-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">주문 목록</h1>
            <p className="text-stone-600 text-sm mt-1">
              등록된 주문 내역을 확인할 수 있습니다.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleConfirmOrders}
              className="bg-stone-800 text-white hover:bg-stone-700"
              disabled={selectedIds.size === 0}
            >
              주문 확정 ({selectedIds.size})
            </Button>
            <Link href="/student/orders/entry">
              <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-100">
                + 주문 등록
              </Button>
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleToggleAll}
                    />
                  </th>
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
                    생성 날짜
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-stone-500">
                      등록된 주문이 없습니다.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id.toString()} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedIds.has(order.id.toString())}
                          onCheckedChange={(checked) => 
                            handleToggleOrder(order.id.toString(), checked as boolean)
                          }
                        />
                      </td>
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
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === "PENDING" 
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {order.status === "PENDING" ? "결제대기" : order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-500">
                        {kdayjs(order.createdAt).format("YYYY년 MM월 DD일 오전 HH:mm")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-stone-900 text-center">
              주문 확정
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            <div className="text-center">
              <p className="text-stone-600 text-sm mb-2">주문을 확정할 회사</p>
              <p className="text-xl font-bold text-stone-900">"앤유컴퍼니"</p>
            </div>

            <div className="space-y-3 border-t border-b border-stone-200 py-4">
              <div className="flex justify-between items-center">
                <span className="text-stone-600">현재 잔여 복비</span>
                <span className="text-lg font-bold text-stone-900">
                  995,000원
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-600">주문 확정 복비</span>
                <span className="text-lg font-bold text-red-500">
                  -{totalAmount.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-600">실시간 전송 추가요금</span>
                <span className="text-lg font-bold text-stone-900">
                  +0원
                </span>
              </div>
            </div>

            <p className="text-center text-stone-600 text-sm">
              위 내용으로 주문을 확정하시겠습니까?
            </p>
          </div>

          <DialogFooter className="sm:justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmModalOpen(false)}
              className="flex-1 border-stone-300 text-stone-700 hover:bg-stone-100"
            >
              취소
            </Button>
            <Button
              onClick={handleFinalConfirm}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
            >
              확정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
