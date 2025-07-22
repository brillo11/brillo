import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@repo/ui/components/card";
import { ShieldAlert, CheckCircle, XCircle, Clock } from "lucide-react";

export default function TestGuide() {
  return (
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
              <span className="font-medium">카드번호:</span> 4111-1111-1111-1111
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
  );
}
