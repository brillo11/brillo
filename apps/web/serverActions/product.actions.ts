"use server";

import { prisma } from "@repo/database";
import type { Product } from "@repo/database";
import {
  JsonObject,
  JsonValue,
} from "../../../packages/database/generated/client/runtime/library";

// Product 테이블에서 데이터를 가져와 ProductList 형식으로 변환
export async function getProductsForList(): Promise<any[]> {
  const products = await prisma.product.findMany({
    where: {
      inStock: true, // 재고가 있는 상품만
    },
    orderBy: [
      { featured: "desc" }, // 추천 상품 우선
      { createdAt: "asc" }, // 최신순
    ],
  });

  return products.map((product: Product) => {
    return {
      id: Number(product.id),
      icon: product.icon as string,
      title: product.name,
      description: product.description || "",
      price: product.price > 0 ? `${product.price.toLocaleString()}원` : "무료",
      href:
        ((product.specifications as JsonObject)?.slug as string | undefined) ||
        `/student/products/${product.id.toString()}`,
      category: product.category || undefined,
      rating: ((product.specifications as JsonObject)?.rating as number) || 0,
      reviewCount:
        ((product.specifications as JsonObject)?.reviewCount as number) || 0,
      badge:
        ((product.specifications as JsonObject)?.badge as string) || undefined,
    };
  });
}

// 상품 상세 정보 가져오기
export async function getProductDetail(id: string) {
  const product = await prisma.product.findUnique({
    where: { id: BigInt(id) },
  });

  if (!product) {
    return null;
  }

  const specs = product.specifications as any;
  const images = (product.images as any) || [];

  return {
    id: Number(product.id),
    name: product.name,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    images: Array.isArray(images) ? images : [],
    category: product.category,
    inStock: product.inStock,
    featured: product.featured,
    specifications: specs || {},
    tags: product.tags,
    viewCount: product.viewCount,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

// 기존 함수들 (호환성 유지)
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
