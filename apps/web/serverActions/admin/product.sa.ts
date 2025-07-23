"use server";

import { prisma } from "@repo/database";
import { requireAdmin } from "@/lib/auth-guards";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

// 제품 목록 조회 (관리자용)
export async function getAdminProducts(
  page = 1,
  limit = 20
): Promise<{
  products: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  await requireAdmin();

  const offset = (page - 1) * limit;

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    }),
    prisma.product.count(),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    products,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// 제품 상세 조회
export async function getProduct(id: string): Promise<any> {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });

  if (!product) {
    throw new Error("제품을 찾을 수 없습니다.");
  }

  return product;
}

// 제품 등록
export async function createProduct(formData: FormData): Promise<void> {
  await requireAdmin();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseInt(formData.get("price") as string);
  const originalPrice = formData.get("originalPrice")
    ? parseInt(formData.get("originalPrice") as string)
    : null;
  const category = formData.get("category") as string;
  const inStock = formData.get("inStock") === "on";
  const featured = formData.get("featured") === "on";

  // 이미지 URL들 (JSON 배열로 저장)
  const imageUrls = formData
    .getAll("imageUrls")
    .filter((url) => url.toString().trim())
    .map((url) => url.toString());

  // 태그들 (쉼표로 구분된 문자열을 배열로 변환)
  const tagsString = formData.get("tags") as string;
  const tags = tagsString
    ? tagsString
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  // 제품 규격 (JSON 형태로 저장)
  const specifications: Record<string, string> = {};
  const specKeys = formData.getAll("specKey");
  const specValues = formData.getAll("specValue");
  specKeys.forEach((key, index) => {
    if (key && specValues[index]) {
      specifications[key.toString()] = specValues[index].toString();
    }
  });

  if (!name.trim()) {
    throw new Error("제품명을 입력해주세요.");
  }

  if (!price || price <= 0) {
    throw new Error("올바른 가격을 입력해주세요.");
  }

  try {
    await prisma.product.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price,
        originalPrice,
        category: category || "일반",
        inStock,
        featured,
        images: imageUrls,
        tags,
        specifications,
      },
    });

    revalidateTag("products");
    revalidatePath("/admin/products");
  } catch (error) {
    console.error("제품 등록 실패:", error);
    throw new Error("제품 등록에 실패했습니다.");
  }

  redirect("/admin/products");
}

// 제품 수정
export async function updateProduct(
  id: string,
  formData: FormData
): Promise<void> {
  await requireAdmin();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseInt(formData.get("price") as string);
  const originalPrice = formData.get("originalPrice")
    ? parseInt(formData.get("originalPrice") as string)
    : null;
  const category = formData.get("category") as string;
  const inStock = formData.get("inStock") === "on";
  const featured = formData.get("featured") === "on";

  // 이미지 URL들
  const imageUrls = formData
    .getAll("imageUrls")
    .filter((url) => url.toString().trim())
    .map((url) => url.toString());

  // 태그들
  const tagsString = formData.get("tags") as string;
  const tags = tagsString
    ? tagsString
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  // 제품 규격
  const specifications: Record<string, string> = {};
  const specKeys = formData.getAll("specKey");
  const specValues = formData.getAll("specValue");
  specKeys.forEach((key, index) => {
    if (key && specValues[index]) {
      specifications[key.toString()] = specValues[index].toString();
    }
  });

  if (!name.trim()) {
    throw new Error("제품명을 입력해주세요.");
  }

  if (!price || price <= 0) {
    throw new Error("올바른 가격을 입력해주세요.");
  }

  try {
    await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: name.trim(),
        description: description.trim(),
        price,
        originalPrice,
        category: category || "일반",
        inStock,
        featured,
        images: imageUrls,
        tags,
        specifications,
      },
    });

    revalidateTag("products");
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}/edit`);
  } catch (error) {
    console.error("제품 수정 실패:", error);
    throw new Error("제품 수정에 실패했습니다.");
  }

  redirect("/admin/products");
}

// 제품 삭제
export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();

  try {
    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    revalidateTag("products");
    revalidatePath("/admin/products");
  } catch (error) {
    console.error("제품 삭제 실패:", error);
    throw new Error("제품 삭제에 실패했습니다.");
  }
}

// 제품 통계 조회
export async function getProductStats(): Promise<{
  totalProducts: number;
  inStockProducts: number;
  featuredProducts: number;
  totalValue: number;
}> {
  await requireAdmin();

  const [totalProducts, inStockProducts, featuredProducts, products] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { inStock: true } }),
      prisma.product.count({ where: { featured: true } }),
      prisma.product.findMany({ select: { price: true } }),
    ]);

  const totalValue = products.reduce((sum, product) => sum + product.price, 0);

  return {
    totalProducts,
    inStockProducts,
    featuredProducts,
    totalValue,
  };
}
