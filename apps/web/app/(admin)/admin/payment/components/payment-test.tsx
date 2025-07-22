import { TabsContent } from "@repo/ui/components/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@repo/ui/components/card";
import {
  CreditCard,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Label } from "@repo/ui/components/label";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@repo/ui/components/select";

interface PaymentTestProps {
  selectedOption: string;
  setSelectedOption: (value: string) => void;
  selectedOptionData: { id: number; name: string; price: number };
  discount: number;
  setDiscount: (value: number) => void;
  finalPrice: number;
  setPaymentModalOpen: (value: string) => void;
  courseOptions: { id: number; name: string; price: number }[];
}

export function PaymentTest({
  selectedOption,
  setSelectedOption,
  selectedOptionData,
  discount,
  setDiscount,
  finalPrice,
  setPaymentModalOpen,
  courseOptions,
}: PaymentTestProps) {
  return (
    <TabsContent value="payment-test">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#E53935]" />
              결제 테스트
            </CardTitle>
            <CardDescription>
              테스트 결제를 생성하고 다양한 결제 시나리오를 테스트할 수 있습니다
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
                    {courseOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id.toString()}>
                        {option.name} - {option.price.toLocaleString()}원
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discount">할인 금액</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max={selectedOptionData?.price}
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setDiscount(0)}
                    className="whitespace-nowrap"
                  >
                    초기화
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-gray-600">상품 금액</span>
                  <span className="font-medium">
                    {selectedOptionData?.price.toLocaleString()}원
                  </span>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-gray-600">할인 금액</span>
                  <span className="font-medium text-red-600">
                    -{discount.toLocaleString()}원
                  </span>
                </div>
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
              onClick={() => {
                setSelectedOption("1");
                setDiscount(0);
              }}
            >
              초기화
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setPaymentModalOpen("test")}
            >
              테스트 결제
            </Button>
            <Button
              className="bg-[#E53935] hover:bg-[#d32f2f]"
              onClick={() => setPaymentModalOpen("live")}
            >
              실 결제
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-blue-600" />
              테스트 가이드
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-2 font-semibold">테스트 카드 정보</h3>
              <div className="space-y-1 rounded-md bg-gray-50 p-3 text-sm">
                <p>
                  <span className="font-medium">카드번호:</span>{" "}
                  4111-1111-1111-1111
                </p>
                <p>
                  <span className="font-medium">만료일:</span> 12/25
                </p>
                <p>
                  <span className="font-medium">CVC:</span> 123
                </p>
                <p>
                  <span className="font-medium">비밀번호:</span> 00
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">테스트 시나리오</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                  <span>정상 결제: 위 카드 정보로 결제</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                  <span>결제 실패: 카드번호 4000-0000-0000-0000 사용</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
                  <span>결제 취소: 결제 진행 중 창 닫기</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
