import React from "react";
import { prisma } from "@repo/database";
import { auth } from "@/shared/lib/auth";
import { headers } from "next/headers";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import Link from "next/link";
import { GuestOrderLookup } from "./GuestOrderLookup";

export const dynamic = "force-dynamic";

export default async function MyPageOrders() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return <GuestOrderLookup />;
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { review: true },
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
                    {kdayjs(order.createdAt).format("YYYY.MM.DD HH:mm")}
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
                  {(() => {
                    try {
                      const desc = order.description
                        ? JSON.parse(order.description)
                        : null;
                      const info = desc?.reservationInfo;
                      if (!info) return null;
                      return (
                        <div className="mt-2 text-xs font-suit text-[#000000]/60 space-y-0.5">
                          <div>
                            예약자: {info.name}
                            {info.gender === "male"
                              ? " (남)"
                              : info.gender === "female"
                                ? " (여)"
                                : ""}
                            {info.age ? ` · ${info.age}세` : ""}
                          </div>
                          {info.phone && <div>연락처: {info.phone}</div>}
                          {info.email && <div>이메일: {info.email}</div>}
                        </div>
                      );
                    } catch {
                      return null;
                    }
                  })()}
                </div>
                <div className="mt-4 md:mt-0 text-left md:text-right">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-suit font-bold border ${
                      (order.status as string) === "결제완료" || (order.status as string) === "PAID"
                        ? "border-black text-black bg-transparent"
                        : "border-[#d4d4d4] text-[#000000]/50"
                    }`}
                  >
                    {(order.status as string) === "PAID" ? "결제완료" : order.status}
                  </span>
                  <div
                    className="text-[11px] font-playfair text-[#000000]/40 mt-3 truncate w-32 md:w-auto"
                    title={order.paymentKey || ""}
                  >
                    {order.paymentKey ? `Key: ${order.paymentKey}` : "No Key"}
                  </div>

                  {((order.status as string) === "결제완료" || (order.status as string) === "PAID") && !order.review && (
                    <div className="mt-3 md:mt-4 flex justify-end">
                      <Link
                        href={`/mypage/reviews/new?orderId=${order.id}`}
                        className="inline-block px-4 py-1.5 text-xs font-suit font-medium bg-black text-white hover:bg-gray-800 transition-colors"
                      >
                        리뷰 남기기
                      </Link>
                    </div>
                  )}
                  {order.review && (
                    <div className="mt-3 md:mt-4 flex justify-end">
                      <span className="inline-block px-4 py-1.5 text-xs font-suit font-medium border border-[#d4d4d4] text-[#000000]/50 bg-gray-50">
                        리뷰 작성 완료
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
