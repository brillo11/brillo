import { Suspense } from "react";
import { ProductDetailClient } from "./components/product-detail-client";
import { getProductById } from "@/serverActions/product.actions";

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const numericId = Number(id);
  const product = Number.isFinite(numericId)
    ? await getProductById(numericId)
    : null;

  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <ProductDetailClient product={product} />
    </Suspense>
  );
}
