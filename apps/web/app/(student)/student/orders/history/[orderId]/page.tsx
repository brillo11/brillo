import { requireStudent } from "@/shared/lib/auth-guards";
import { getOrderById } from "@/serverActions/order.actions";
import { notFound } from "next/navigation";
import { OrderCompleteView } from "./OrderCompleteView";

export const dynamic = "force-dynamic";

interface OrderPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  await requireStudent();
  
  const { orderId } = await params;

  try {
    const order = await getOrderById(orderId);
    
    if (!order) {
      notFound();
    }

    return <OrderCompleteView order={order} />;
  } catch (error) {
    console.error("주문 조회 오류:", error);
    notFound();
  }
}

