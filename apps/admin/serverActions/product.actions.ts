"use server";

import { prisma } from "@repo/database";

export async function getProducts(): Promise<any[]> {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return products as any[];
}

export async function getProductById(id: number): Promise<any | null> {
  const product = await prisma.product.findUnique({
    where: { id: BigInt(id) },
  });
  return product as any;
}
