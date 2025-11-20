"use client";

import { useEffect, useState } from "react";
import { getPointOrders, confirmPointOrders, getUserPoints, createBulkPointOrders } from "@/serverActions/pointOrder.actions";
import { getProductsForList } from "@/serverActions/product.actions";
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
import { toast } from "sonner";
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

interface Product {
  id: number;
  title: string;
  price: string;
}

export default function OrderListPage() {
  const [orders, setOrders] = useState<PointOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  
  // Registration Modal State
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    productCode: "",
    name: "",
    email: "",
    calendar: "SOLAR" as "SOLAR" | "LUNAR",
    birthYear: 1990,
    birthMonth: 1,
    birthDay: 1,
    birthHour: 0,
    birthMinute: 0,
    gender: "FEMALE" as "MALE" | "FEMALE",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, pointsData, productsData] = await Promise.all([
          getPointOrders(),
          getUserPoints(),
          getProductsForList(),
        ]);
        setOrders(ordersData as any);
        setUserPoints(pointsData);
        setProducts(productsData);
        if (productsData.length > 0) {
          const firstProductTitle = productsData[0]?.title || "";
          setFormData(prev => ({ ...prev, productCode: firstProductTitle }));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const handleFinalConfirm = async () => {
    if (userPoints < totalAmount) {
      toast.error("보유 복비가 부족합니다.");
      return;
    }

    setConfirmModalOpen(false);
    
    try {
      const orderIds = Array.from(selectedIds);
      const result = await confirmPointOrders(orderIds);
      
      if (result.success) {
        toast.success(`${result.count}건의 주문이 확정되었습니다.`);
        setSelectedIds(new Set());
        
        // Refresh data
        const [ordersData, pointsData] = await Promise.all([
          getPointOrders(),
          getUserPoints(),
        ]);
        setOrders(ordersData as any);
        setUserPoints(pointsData);
      } else {
        toast.error(result.error || "주문 확정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Confirmation error:", error);
      toast.error("주문 확정 중 오류가 발생했습니다.");
    }
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.productCode) {
      toast.error("필수 정보를 모두 입력해주세요.");
      return;
    }

    try {
      const result = await createBulkPointOrders([formData]);

      if (result.success) {
        toast.success("주문이 등록되었습니다.");
        setRegisterModalOpen(false);
        // Reset form
        setFormData({
          productCode: products[0]?.title || "",
          name: "",
          email: "",
          calendar: "SOLAR",
          birthYear: 1990,
          birthMonth: 1,
          birthDay: 1,
          birthHour: 0,
          birthMinute: 0,
          gender: "FEMALE",
        });
        
        // Refresh data
        const ordersData = await getPointOrders();
        setOrders(ordersData as any);
      } else {
        toast.error(result.error || "주문 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("주문 등록 중 오류가 발생했습니다.");
    }
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
      <div className="max-w-7xl mx-auto w-full flex flex-col space-y-4">
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
            <Button 
              variant="outline" 
              className="border-stone-300 text-stone-700 hover:bg-stone-100"
              onClick={() => setRegisterModalOpen(true)}
            >
              + 주문 등록
            </Button>
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
            <div className="space-y-3 border-t border-b border-stone-200 py-4">
              <div className="flex justify-between items-center">
                <span className="text-stone-600">현재 잔여 복비</span>
                <span className="text-lg font-bold text-stone-900">
                  {userPoints.toLocaleString()}냥
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-600">주문 확정 복비</span>
                <span className="text-lg font-bold text-red-500">
                  -{totalAmount.toLocaleString()}냥
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

      {/* Registration Modal */}
      <Dialog open={registerModalOpen} onOpenChange={setRegisterModalOpen}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-stone-900">
              주문 등록
            </DialogTitle>
            <DialogDescription>
              새로운 주문 정보를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium text-stone-600">
                상품
              </label>
              <select
                className="col-span-3 flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2"
                value={formData.productCode}
                onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
              >
                {products.map((product) => (
                  <option key={product.id} value={product.title}>
                    {product.title} ({product.price})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium text-stone-600">
                이름
              </label>
              <input
                className="col-span-3 flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="이름을 입력하세요"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium text-stone-600">
                이메일
              </label>
              <input
                type="email"
                className="col-span-3 flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="이메일을 입력하세요"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium text-stone-600">
                성별
              </label>
              <div className="col-span-3 flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={formData.gender === "FEMALE"}
                    onChange={() => setFormData({ ...formData, gender: "FEMALE" })}
                    className="text-stone-900 focus:ring-stone-900"
                  />
                  <span className="text-sm text-stone-700">여성</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={formData.gender === "MALE"}
                    onChange={() => setFormData({ ...formData, gender: "MALE" })}
                    className="text-stone-900 focus:ring-stone-900"
                  />
                  <span className="text-sm text-stone-700">남성</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium text-stone-600">
                생년월일
              </label>
              <div className="col-span-3 space-y-2">
                <div className="flex gap-2">
                  <select
                    className="flex-1 h-10 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
                    value={formData.calendar}
                    onChange={(e) => setFormData({ ...formData, calendar: e.target.value as "SOLAR" | "LUNAR" })}
                  >
                    <option value="SOLAR">양력</option>
                    <option value="LUNAR">음력</option>
                  </select>
                  <input
                    type="number"
                    className="flex-1 h-10 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
                    value={formData.birthYear}
                    onChange={(e) => setFormData({ ...formData, birthYear: parseInt(e.target.value) })}
                    placeholder="년"
                  />
                </div>
                <div className="flex gap-2 w-full">
                  <input
                    type="number"
                    className="flex-1 h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
                    value={formData.birthMonth}
                    onChange={(e) => setFormData({ ...formData, birthMonth: parseInt(e.target.value) })}
                    placeholder="월"
                  />
                  <input
                    type="number"
                    className="flex-1 h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
                    value={formData.birthDay}
                    onChange={(e) => setFormData({ ...formData, birthDay: parseInt(e.target.value) })}
                    placeholder="일"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium text-stone-600">
                태어난 시간
              </label>
              <div className="col-span-3 w-full flex gap-2">
                <input
                  type="number"
                  className="flex-1 h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
                  value={formData.birthHour}
                  onChange={(e) => setFormData({ ...formData, birthHour: parseInt(e.target.value) })}
                  placeholder="시 (0-23)"
                />
                <input
                  type="number"
                  className="flex-1 h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
                  value={formData.birthMinute}
                  onChange={(e) => setFormData({ ...formData, birthMinute: parseInt(e.target.value) })}
                  placeholder="분 (0-59)"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRegisterModalOpen(false)}
              className="border-stone-300 text-stone-700 hover:bg-stone-100"
            >
              취소
            </Button>
            <Button
              onClick={handleRegister}
              className="bg-stone-800 text-white hover:bg-stone-700"
            >
              등록하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
