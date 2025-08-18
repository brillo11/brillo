import { Suspense } from "react";
import { ProductGrid } from "./components/product-grid";
import { ProductFilters } from "./components/product-filters";
import { ProductSort } from "./components/product-sort";
import { ProductSearch } from "./components/product-search";
import { ProductGridSkeleton } from "./components/product-grid-skeleton";
import { getProducts } from "@/serverActions/product.actions";

export default async function ProductsPage() {
  const products = await getProducts();

  // DB 모델을 카드 컴포넌트 Product 타입으로 매핑
  const items = products.map((p) => ({
    id: String(p.id),
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice ?? undefined,
    discount: p.originalPrice
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : undefined,
    rating: 4.7, // TODO: 실제 평점 컬럼 연결 시 교체
    reviewCount: 0, // TODO: 리뷰 수 컬럼 연결 시 교체
    image:
      Array.isArray(p.images) && p.images.length > 0 ? String(p.images[0]) : "",
    category: p.category,
    tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
    inStock: p.inStock,
    isNew: false,
    isHot: p.featured,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">제품 목록</h1>
          <p className="text-gray-600 mt-2">
            다양한 제품을 둘러보고 원하는 상품을 찾아보세요
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 검색 및 필터 영역 */}
        <div className="mb-8 space-y-4">
          <ProductSearch />
          <div className="flex flex-col sm:flex-row gap-4">
            <ProductFilters />
            <ProductSort />
          </div>
        </div>

        {/* 제품 그리드 */}
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid items={items} />
        </Suspense>
      </div>
    </div>
  );
}
