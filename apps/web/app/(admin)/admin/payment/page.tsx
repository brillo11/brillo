import { getPaymentsWithDetail } from "@/serverActions/payment/payment.actions";
import AdminPaymentClientView from "./AdminPaymentClientView";
import { Payment } from "@repo/database";

// 캐시 비활성화 - 결제 데이터는 실시간 업데이트가 필요
export const dynamic = "force-dynamic";
// export const revalidate = 0;

type PaymentWithDetail = Payment & {
  user?: { nickname?: string };
  isTest?: boolean;
};

export default async function AdminPaymentPage() {
  const payments = await getPaymentsWithDetail();
  return <AdminPaymentClientView payments={payments as PaymentWithDetail[]} />;
}
