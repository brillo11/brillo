"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Separator } from "@repo/ui/components/separator";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  User,
  MapPin,
  Phone,
  Mail,
  Shield,
  Gift,
  Package,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react";

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  quantity: number;
}

interface ShippingAddress {
  name: string;
  phone: string;
  email: string;
  address: string;
  addressDetail: string;
  zipCode: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

// 가상의 주문 데이터
const mockOrderItems: OrderItem[] = [
  {
    id: "1",
    productId: "1",
    name: "프리미엄 보컬 트레이닝 키트",
    price: 89000,
    originalPrice: 129000,
    discount: 31,
    image: "/api/placeholder/100/100",
    quantity: 1,
  },
  {
    id: "2",
    productId: "2",
    name: "고급 음성 분석 소프트웨어",
    price: 159000,
    originalPrice: 199000,
    discount: 20,
    image: "/api/placeholder/100/100",
    quantity: 1,
  },
];

const mockShippingAddresses: ShippingAddress[] = [
  {
    name: "김성현",
    phone: "010-1234-5678",
    email: "kim@example.com",
    address: "서울특별시 강남구 테헤란로 123",
    addressDetail: "456동 789호",
    zipCode: "06123",
    isDefault: true,
  },
  {
    name: "김성현",
    phone: "010-1234-5678",
    email: "kim@example.com",
    address: "서울특별시 서초구 서초대로 456",
    addressDetail: "789동 101호",
    zipCode: "06611",
    isDefault: false,
  },
];

const paymentMethods: PaymentMethod[] = [
  {
    id: "card",
    name: "신용카드",
    description: "모든 신용카드 결제 가능",
    icon: CreditCard,
  },
  {
    id: "transfer",
    name: "계좌이체",
    description: "실시간 계좌이체",
    icon: CreditCard,
  },
  {
    id: "phone",
    name: "휴대폰 결제",
    description: "휴대폰 요금에 추가",
    icon: Phone,
  },
];

export default function CheckoutPage() {
  const [selectedAddress, setSelectedAddress] = useState<string>(
    mockShippingAddresses[0]?.zipCode || ""
  );
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = mockOrderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalDiscount = mockOrderItems.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + (item.originalPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);
  const shippingFee = subtotal >= 100000 ? 0 : 3000;
  const total = subtotal + shippingFee;

  const selectedAddressData = mockShippingAddresses.find(
    (addr) => addr.zipCode === selectedAddress
  );

  // 배송지가 없거나 선택된 배송지가 없는 경우 처리
  if (mockShippingAddresses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Truck className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            배송지 정보가 없습니다
          </h2>
          <p className="text-gray-600 mb-8">
            주문을 진행하기 위해 배송지 정보를 먼저 등록해주세요
          </p>
          <Link href="/mypage/address">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              배송지 관리
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("이용약관에 동의해주세요.");
      return;
    }

    setIsProcessing(true);

    // TODO: 실제 주문 처리 로직 구현
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 시뮬레이션
      console.log("주문 처리:", {
        items: mockOrderItems,
        address: selectedAddressData,
        paymentMethod,
        total,
      });

      // 성공 시 주문 완료 페이지로 이동
      // router.push('/checkout/success');
    } catch (error) {
      console.error("주문 처리 실패:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/cart">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                장바구니로 돌아가기
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">주문/결제</h1>
              <p className="text-gray-600 mt-1">
                주문 정보를 확인하고 결제를 진행해주세요
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* 주문 정보 입력 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 주문 상품 목록 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    주문 상품
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockOrderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {item.name}
                          </h3>
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
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            수량: {item.quantity}개
                          </div>
                          <div className="font-bold text-lg">
                            {(item.price * item.quantity).toLocaleString()}원
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 배송지 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    배송지 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 기존 배송지 선택 */}
                  <div>
                    <Label className="text-sm font-medium">배송지 선택</Label>
                    <RadioGroup
                      value={selectedAddress}
                      onValueChange={setSelectedAddress}
                    >
                      <div className="mt-2 space-y-2">
                        {mockShippingAddresses.map((address) => (
                          <div
                            key={address.zipCode}
                            className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedAddress === address.zipCode
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => setSelectedAddress(address.zipCode)}
                          >
                            <RadioGroupItem
                              value={address.zipCode}
                              id={`address-${address.zipCode}`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {address.name}
                                </span>
                                {address.isDefault && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    기본
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {address.address} {address.addressDetail}
                              </div>
                              <div className="text-sm text-gray-500">
                                {address.phone} • {address.email}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  {/* 새 배송지 추가 */}
                  <div className="pt-4 border-t">
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />새 배송지 추가
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 결제 방법 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    결제 방법
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            paymentMethod === method.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setPaymentMethod(method.id)}
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <method.icon className="h-5 w-5 text-gray-600" />
                          <div className="flex-1">
                            <div className="font-medium">{method.name}</div>
                            <div className="text-sm text-gray-600">
                              {method.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* 이용약관 동의 */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agree-terms"
                      checked={agreeTerms}
                      onCheckedChange={(checked) => setAgreeTerms(!!checked)}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="agree-terms"
                        className="text-sm cursor-pointer"
                      >
                        <span className="text-red-600">*</span>{" "}
                        <Link
                          href="/terms"
                          className="text-blue-600 hover:underline"
                        >
                          이용약관
                        </Link>
                        에 동의합니다.
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        주문 및 결제 진행을 위해 이용약관 동의가 필요합니다.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 주문 요약 */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    주문 요약
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 배송지 정보 요약 */}
                  {selectedAddressData && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-2">배송지</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>{selectedAddressData.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {selectedAddressData.address}{" "}
                            {selectedAddressData.addressDetail}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{selectedAddressData.phone}</span>
                        </div>
                      </div>
                    </div>
                  )}

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
                      <span
                        className={shippingFee === 0 ? "text-green-600" : ""}
                      >
                        {shippingFee === 0
                          ? "무료"
                          : `${shippingFee.toLocaleString()}원`}
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
                    <h4 className="font-medium text-blue-900 text-sm">
                      구매 혜택
                    </h4>
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
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!agreeTerms || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        처리 중...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        {total.toLocaleString()}원 결제하기
                      </>
                    )}
                  </Button>

                  {/* 주의사항 */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-yellow-800">
                        <p className="font-medium mb-1">주문 전 확인사항</p>
                        <ul className="space-y-1">
                          <li>• 배송지는 주문 완료 후 변경할 수 없습니다</li>
                          <li>
                            • 결제 완료 후 주문 취소는 고객센터로 문의해주세요
                          </li>
                          <li>
                            • 부정한 방법으로 결제 시 주문이 취소될 수 있습니다
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
