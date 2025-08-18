"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Separator } from "@repo/ui/components/separator";
import { Input } from "@repo/ui/components/input";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Label } from "@repo/ui/components/label";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Heart,
  Package,
  Truck,
  Shield,
  CreditCard,
  Gift
} from "lucide-react";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  quantity: number;
  inStock: boolean;
  selected: boolean;
}

// 가상의 장바구니 데이터
const mockCartItems: CartItem[] = [
  {
    id: "1",
    productId: "1",
    name: "프리미엄 보컬 트레이닝 키트",
    price: 89000,
    originalPrice: 129000,
    discount: 31,
    image: "/api/placeholder/200/200",
    quantity: 1,
    inStock: true,
    selected: true,
  },
  {
    id: "2",
    productId: "2",
    name: "고급 음성 분석 소프트웨어",
    price: 159000,
    originalPrice: 199000,
    discount: 20,
    image: "/api/placeholder/200/200",
    quantity: 1,
    inStock: true,
    selected: true,
  },
  {
    id: "3",
    productId: "3",
    name: "전문가용 마이크 세트",
    price: 299000,
    originalPrice: 399000,
    discount: 25,
    image: "/api/placeholder/200/200",
    quantity: 2,
    inStock: true,
    selected: false,
  },
  {
    id: "4",
    productId: "4",
    name: "보컬 워밍업 가이드북",
    price: 29000,
    originalPrice: 39000,
    discount: 26,
    image: "/api/placeholder/200/200",
    quantity: 1,
    inStock: false,
    selected: false,
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);
  const [couponCode, setCouponCode] = useState("");

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleSelection = (id: string) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleAllSelection = () => {
    const allSelected = cartItems.every(item => item.selected);
    setCartItems(prev => 
      prev.map(item => ({ ...item, selected: !allSelected }))
    );
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDiscount = selectedItems.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + ((item.originalPrice - item.price) * item.quantity);
    }
    return sum;
  }, 0);
  const shippingFee = subtotal >= 100000 ? 0 : 3000;
  const total = subtotal + shippingFee;

  const applyCoupon = () => {
    // TODO: 쿠폰 적용 로직 구현
    console.log("쿠폰 적용:", couponCode);
  };

  const moveToWishlist = (item: CartItem) => {
    // TODO: 찜 목록으로 이동 로직 구현
    console.log("찜 목록으로 이동:", item.name);
    removeItem(item.id);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">장바구니가 비어있습니다</h2>
          <p className="text-gray-600 mb-8">
            원하는 제품을 찾아서 장바구니에 담아보세요
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              쇼핑 계속하기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/products">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                쇼핑 계속하기
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">장바구니</h1>
              <p className="text-gray-600 mt-1">
                총 {cartItems.length}개 상품
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 장바구니 상품 목록 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 전체 선택 */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={cartItems.every(item => item.selected)}
                      onCheckedChange={toggleAllSelection}
                    />
                    <Label htmlFor="select-all" className="font-medium cursor-pointer">
                      전체 선택 ({selectedItems.length}/{cartItems.length})
                    </Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCartItems(prev => prev.filter(item => item.selected))}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    선택 상품 삭제
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 상품 목록 */}
            {cartItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* 체크박스 */}
                    <div className="flex items-center justify-center p-4">
                      <Checkbox
                        id={`select-${item.id}`}
                        checked={item.selected}
                        onCheckedChange={() => toggleSelection(item.id)}
                      />
                    </div>

                    {/* 상품 이미지 */}
                    <div className="w-24 h-24 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* 상품 정보 */}
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Link href={`/product/${item.productId}`}>
                            <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                              {item.name}
                            </h3>
                          </Link>
                          
                          <div className="flex items-center gap-2 mt-2">
                            {item.originalPrice && (
                              <span className="text-gray-400 line-through text-sm">
                                {item.originalPrice.toLocaleString()}원
                              </span>
                            )}
                            <span className="font-bold text-lg">
                              {item.price.toLocaleString()}원
                            </span>
                            {item.discount && (
                              <Badge className="bg-red-500 text-white">
                                {item.discount}% 할인
                              </Badge>
                            )}
                          </div>

                          {!item.inStock && (
                            <Badge variant="secondary" className="mt-2">
                              품절
                            </Badge>
                          )}
                        </div>

                        {/* 수량 조정 */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-16 text-center"
                            min="1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* 액션 버튼들 */}
                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveToWishlist(item)}
                          className="text-gray-600 hover:text-red-600"
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          찜 목록으로
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          삭제
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 주문 요약 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  주문 요약
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 쿠폰 입력 */}
                <div>
                  <Label htmlFor="coupon" className="text-sm font-medium">
                    쿠폰 코드
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="coupon"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="쿠폰 코드 입력"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={applyCoupon}
                      disabled={!couponCode.trim()}
                    >
                      적용
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* 가격 정보 */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>상품 금액</span>
                    <span>{subtotal.toLocaleString()}원</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>할인 금액</span>
                      <span>-{totalDiscount.toLocaleString()}원</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>배송비</span>
                    <span className={shippingFee === 0 ? "text-green-600" : ""}>
                      {shippingFee === 0 ? "무료" : `${shippingFee.toLocaleString()}원`}
                    </span>
                  </div>
                  {shippingFee > 0 && (
                    <div className="text-xs text-gray-500">
                      * 10만원 이상 구매 시 무료배송
                    </div>
                  )}
                </div>

                <Separator />

                {/* 총 금액 */}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>총 결제 금액</span>
                  <span className="text-2xl text-blue-600">
                    {total.toLocaleString()}원
                  </span>
                </div>

                {/* 구매 혜택 */}
                <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                  <h4 className="font-medium text-blue-900 text-sm">구매 혜택</h4>
                  <div className="space-y-1 text-xs text-blue-700">
                    <div className="flex items-center gap-2">
                      <Gift className="h-3 w-3" />
                      <span>사은품 증정</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-3 w-3" />
                      <span>무료배송</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-3 w-3" />
                      <span>품질보증</span>
                    </div>
                  </div>
                </div>

                {/* 주문 버튼 */}
                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={selectedItems.length === 0}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    주문하기 ({totalQuantity}개)
                  </Button>
                  
                  <Link href="/products">
                    <Button variant="outline" size="lg" className="w-full">
                      <Package className="h-5 w-5 mr-2" />
                      쇼핑 계속하기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
