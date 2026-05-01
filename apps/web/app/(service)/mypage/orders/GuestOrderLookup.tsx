"use client";

import { FormEvent, useState, useTransition } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  GuestOrderLookupState,
  lookupGuestOrdersAction,
} from "./actions";

function formatStatus(status: string) {
  return status === "PAID" ? "결제완료" : status;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function GuestOrderLookup() {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<GuestOrderLookupState>({
    success: false,
    orders: [],
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await lookupGuestOrdersAction(formData);
      setState(result);
    });
  };

  return (
    <div className="w-full max-w-[700px]">
      <h2 className="font-suit text-lg font-bold text-black border-b border-black pb-3 mb-6">
        비회원 주문 조회
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 border-b border-[#d4d4d4] pb-8"
      >
        <div className="grid gap-2">
          <Label htmlFor="guest-email" className="text-black font-suit">
            결제 시 입력한 이메일
          </Label>
          <Input
            id="guest-email"
            name="email"
            type="email"
            placeholder="example@email.com"
            required
            className="h-12 rounded-none border-black bg-white focus-visible:ring-0"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="guest-phone" className="text-black font-suit">
            결제 시 입력한 연락처
          </Label>
          <Input
            id="guest-phone"
            name="phone"
            inputMode="numeric"
            placeholder="01000000000"
            required
            className="h-12 rounded-none border-black bg-white focus-visible:ring-0"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="h-12 rounded-none bg-black text-white hover:bg-gray-800"
        >
          {isPending ? "조회 중..." : "주문 조회"}
        </Button>
      </form>

      {state.error && (
        <div className="py-6 text-sm font-suit text-[#000000]/50">
          {state.error}
        </div>
      )}

      {state.orders.length > 0 && (
        <div className="flex flex-col">
          {state.orders.map((order) => {
            const info = order.reservationInfo;
            const isPaid =
              order.status === "결제완료" || order.status === "PAID";

            return (
              <div
                key={order.id}
                className="w-full border-b border-[#d4d4d4] py-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="text-sm font-playfair text-[#000000]/60 mb-2">
                    {formatDate(order.createdAt)}
                  </div>
                  <div className="mb-2">
                    <span className="inline-block px-2 py-0.5 text-[11px] font-suit font-bold border border-black text-black">
                      비회원 주문
                    </span>
                  </div>
                  <h3 className="font-suit text-base font-bold text-black mb-1">
                    {order.orderName}
                  </h3>
                  <div className="font-suit text-sm text-[#000000]/80">
                    결제 금액:{" "}
                    <span className="font-semibold">
                      {order.amount.toLocaleString()}원
                    </span>
                  </div>
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
                </div>

                <div className="text-left md:text-right">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-suit font-bold border ${
                      isPaid
                        ? "border-black text-black bg-transparent"
                        : "border-[#d4d4d4] text-[#000000]/50"
                    }`}
                  >
                    {formatStatus(order.status)}
                  </span>
                  <div
                    className="text-[11px] font-playfair text-[#000000]/40 mt-3 truncate w-32 md:w-auto"
                    title={order.paymentKey || ""}
                  >
                    {order.paymentKey ? `Key: ${order.paymentKey}` : "No Key"}
                  </div>
                  <div className="mt-3 text-xs font-suit text-[#000000]/50">
                    비회원 주문은 리뷰 작성이 제한됩니다.
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
