import { requireStudent } from "@/shared/lib/auth-guards";
import { ProductList } from "@/features/product/ui/ProductList";
import { getProductsForList } from "@/serverActions/product.actions";

// SSR + Dynamic - 항상 최신 데이터, 캐시 없음
export const dynamic = "force-dynamic";

export default async function StudentProductsPage() {
  // 🛡️ 서버에서 권한 검증 (미들웨어 통과 후 2차 검증)
  await requireStudent();

  // Product 테이블에서 상품 데이터 가져오기
  const shopProducts = await getProductsForList();

  return (
    <ProductList
      products={shopProducts}
      title="학습 상품"
      subtitle="YouTube 기반 개인화된 학습 자료 서비스"
      showFilters={true}
      showRating={true}
    />
  );
}
