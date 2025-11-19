"use server";

import { prisma } from "@repo/database";
import { requireStudent } from "@/shared/lib/auth-guards";
import { revalidatePath } from "next/cache";

interface OrderData {
  productCode: string;
  email: string;
  name: string;
  calendar: "SOLAR" | "LUNAR";
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  gender: "MALE" | "FEMALE";
}

export async function createBulkPointOrders(orders: OrderData[]) {
  const session = await requireStudent();
  
  try {
    // Validate and filter valid orders
    const validOrders = orders.filter(order => {
      return (
        order.email &&
        order.name &&
        order.productCode &&
        order.birthYear &&
        order.birthMonth &&
        order.birthDay
      );
    });

    if (validOrders.length === 0) {
      return {
        success: false,
        error: "등록할 유효한 주문이 없습니다.",
      };
    }

    // Get all products to map product names to IDs
    const products = await prisma.product.findMany({
      select: { id: true, name: true },
    });

    const productMap = new Map(
      products.map(p => [p.name, p.id])
    );

    // Create PointOrders
    const createdOrders = await Promise.all(
      validOrders.map(async (order) => {
        const productId = productMap.get(order.productCode);
        
        if (!productId) {
          throw new Error(`Product not found: ${order.productCode}`);
        }

        return prisma.pointOrder.create({
          data: {
            userId: session.user.id,
            productId: productId,
            amount: 1,
            status: "PENDING",
            orderName: `${order.productCode} - ${order.name}`,
            description: `${order.name} (${order.email})`,
            email: order.email,
            name: order.name,
            calendar: order.calendar,
            birthYear: order.birthYear,
            birthMonth: order.birthMonth,
            birthDay: order.birthDay,
            birthHour: order.birthHour,
            birthMinute: order.birthMinute,
            gender: order.gender,
          },
        });
      })
    );

    revalidatePath("/student/orders/list");

    return {
      success: true,
      count: createdOrders.length,
    };
  } catch (error) {
    console.error("Failed to create bulk orders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "주문 생성에 실패했습니다.",
    };
  }
}

export async function getPointOrders() {
  const session = await requireStudent();
  
  const orders = await prisma.pointOrder.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: {
          name: true,
          price: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
}

export async function confirmPointOrders(orderIds: string[]) {
  const session = await requireStudent();
  
  try {
    // Convert string IDs to BigInt
    const bigIntIds = orderIds.map(id => BigInt(id));
    
    // Update orders to PAID status
    const result = await prisma.pointOrder.updateMany({
      where: {
        id: { in: bigIntIds },
        userId: session.user.id, // Security: only update user's own orders
        status: "PENDING", // Only confirm pending orders
      },
      data: {
        status: "PAID",
        updatedAt: new Date(),
      },
    });

    revalidatePath("/student/orders/list");
    revalidatePath("/student/orders/history");

    return {
      success: true,
      count: result.count,
    };
  } catch (error) {
    console.error("Failed to confirm orders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "주문 확정에 실패했습니다.",
    };
  }
}

export async function getOrderHistory() {
  const session = await requireStudent();
  
  const orders = await prisma.pointOrder.findMany({
    where: { 
      userId: session.user.id,
      status: { in: ["PAID", "DELIVERED", "CANCELED", "REFUNDED"] },
    },
    include: {
      product: {
        select: {
          name: true,
          price: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
}
