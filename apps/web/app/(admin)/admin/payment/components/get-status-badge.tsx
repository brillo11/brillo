import { PAYMENT_STATUS } from "@repo/database";
import { Badge } from "@repo/ui/components/badge";

export function StatusBadge({ status }: { status: PAYMENT_STATUS | string }) {
  switch (status) {
    case PAYMENT_STATUS.COMPLETED:
      return <Badge className="bg-green-500">결제완료</Badge>;
    case PAYMENT_STATUS.CANCELED:
      return (
        <Badge variant="outline" className="border-gray-300 text-gray-500">
          결제취소
        </Badge>
      );
    case PAYMENT_STATUS.REFUNDED:
      return <Badge className="bg-blue-500">환불완료</Badge>;
    case PAYMENT_STATUS.REFUNDING:
      return <Badge className="bg-yellow-500">환불진행중</Badge>;
    case PAYMENT_STATUS.FAILED:
      return <Badge className="bg-red-500">결제실패</Badge>;
    case PAYMENT_STATUS.PARTIAL_REFUNDED:
      return <Badge className="bg-yellow-500">부분환불</Badge>;
    default:
      return <Badge variant="outline">알 수 없음</Badge>;
  }
}
