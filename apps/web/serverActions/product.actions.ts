"use server";

import { prisma } from "@repo/database";
import type { Product } from "@/app/features/product/ui/ProductList";

// Product 테이블에서 데이터를 가져와 ProductList 형식으로 변환
export async function getProductsForList(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      inStock: true, // 재고가 있는 상품만
    },
    orderBy: [
      { featured: "desc" }, // 추천 상품 우선
      { createdAt: "asc" }, // 최신순
    ],
  });

  return products.map((product) => {
    // specifications JSON에서 추가 정보 추출
    const specs = product.specifications as any;
    const images = (product.images as any) || [];
    const firstImage =
      Array.isArray(images) && images.length > 0 ? images[0] : null;

    // icon은 specifications에서 가져오거나 기본값 사용
    const icon = specs?.icon || "🔮";

    // rating과 reviewCount는 specifications에서 가져오거나 기본값
    const rating = specs?.rating || 0;
    const reviewCount = specs?.reviewCount || 0;

    // badge는 featured가 true면 "베스트", 아니면 specifications에서 가져오거나 없음
    let badge: "베스트" | "신규" | undefined = undefined;
    if (product.featured) {
      badge = "베스트";
    } else if (specs?.badge === "신규") {
      badge = "신규";
    }

    // href는 slug가 있으면 사용, 없으면 id 기반
    const href = specs?.slug || `/student/products/${product.id.toString()}`;

    return {
      id: Number(product.id),
      icon: icon,
      title: product.name,
      description: product.description || "",
      price: product.price > 0 ? `${product.price.toLocaleString()}원` : "무료",
      href: href,
      category: product.category || undefined,
      rating: rating > 0 ? rating : undefined,
      reviewCount: reviewCount > 0 ? reviewCount : undefined,
      badge: badge,
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
