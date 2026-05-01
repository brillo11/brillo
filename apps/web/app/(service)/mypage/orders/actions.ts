"use server";

import { prisma } from "@repo/database";

export interface GuestOrderSummary {
  id: string;
  createdAt: string;
  orderName: string;
  amount: number;
  status: string;
  paymentKey: string | null;
  reservationInfo: {
    name?: string;
    gender?: string;
    age?: string;
    phone?: string;
    email?: string;
  };
}

export interface GuestOrderLookupState {
  success: boolean;
  error?: string;
  orders: GuestOrderSummary[];
}

function parseReservationInfo(description: string | null) {
  if (!description) return null;

  try {
    const parsed = JSON.parse(description);
    return parsed?.reservationInfo || null;
  } catch {
    return null;
  }
}

export async function lookupGuestOrdersAction(
  formData: FormData,
): Promise<GuestOrderLookupState> {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const phone = formData.get("phone")?.toString().replace(/\D/g, "");

  if (!email || !phone) {
    return {
      success: false,
      error: "이메일과 연락처를 입력해주세요.",
      orders: [],
    };
  }

  const candidateOrders = await prisma.order.findMany({
    where: {
      userId: null,
      description: {
        contains: email,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const orders = candidateOrders
    .map((order) => {
      const reservationInfo = parseReservationInfo(order.description);
      const savedEmail = reservationInfo?.email?.toString().trim().toLowerCase();
      const savedPhone = reservationInfo?.phone?.toString().replace(/\D/g, "");

      if (savedEmail !== email || savedPhone !== phone) return null;

      return {
        id: order.id.toString(),
        createdAt: order.createdAt.toISOString(),
        orderName: order.orderName || "서비스 이용료",
        amount: order.amount,
        status: order.status as string,
        paymentKey: order.paymentKey,
        reservationInfo,
      };
    })
    .filter((order): order is GuestOrderSummary => order !== null);

  if (orders.length === 0) {
    return {
      success: false,
      error: "일치하는 비회원 주문 내역이 없습니다.",
      orders: [],
    };
  }

  return {
    success: true,
    orders,
  };
}
