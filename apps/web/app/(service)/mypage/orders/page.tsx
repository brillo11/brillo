import React from "react";
import { prisma } from "@repo/database";
import { auth } from "@/shared/lib/auth";
import { headers } from "next/headers";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function MyPageOrders() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return <div className="font-suit pl-4">로그인이 필요합니다.</div>;
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full">
      <div className="max-w-[700px]">
        <h2 className="font-suit text-lg font-bold text-black border-b border-black pb-3 mb-6">
          내 주문 내역
        </h2>

        {orders.length === 0 ? (
          <div className="py-12 flex justify-center text-[#000000]/50 font-suit text-sm border-b border-[#d4d4d4]">
            구매 내역이 없습니다.
          </div>
        ) : (
          <div className="flex flex-col">
            {orders.map((order) => (
              <div
                key={order.id.toString()}
                className="w-full border-b border-[#d4d4d4] py-6 flex flex-col md:flex-row md:items-center justify-between"
              >
                <div>
                  <div className="text-sm font-playfair text-[#000000]/60 mb-2">
                    {format(new Date(order.createdAt), "yyyy.MM.dd HH:mm")}
                  </div>
                  <h3 className="font-suit text-base font-bold text-black mb-1">
                    {order.orderName || "서비스 이용료"}
                  </h3>
                  <div className="font-suit text-sm text-[#000000]/80">
                    결제 금액:{" "}
                    <span className="font-semibold">
                      {order.amount.toLocaleString()}원
                    </span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 text-left md:text-right">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-suit font-bold border ${
                      order.status === "결제완료"
                        ? "border-black text-black bg-transparent"
                        : "border-[#d4d4d4] text-[#000000]/50"
                    }`}
                  >
                    {order.status}
                  </span>
                  <div
                    className="text-[11px] font-playfair text-[#000000]/40 mt-3 truncate w-32 md:w-auto"
                    title={order.paymentKey || ""}
                  >
                    {order.paymentKey ? `Key: ${order.paymentKey}` : "No Key"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
