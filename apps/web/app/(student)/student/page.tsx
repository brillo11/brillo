import { requireStudent } from "@/shared/lib/auth-guards";
import { ProductList } from "@/features/product/ui/ProductList";
import { getProductsForList } from "@/serverActions/product.actions";

// SSR + Dynamic - 항상 최신 데이터, 캐시 없음
export const dynamic = "force-dynamic";

export default async function StudentPage() {
  // 🛡️ 서버에서 권한 검증 (미들웨어 통과 후 2차 검증)
  await requireStudent();

  // Product 테이블에서 상품 데이터 가져오기
  const services = await getProductsForList();

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)]">
      {/* 히어로 섹션 */}
      <section className="px-5 py-8 text-center bg-gradient-to-br from-[#3B82F6]/10 via-[#60A5FA]/5 to-white">
        <div className="text-4xl mb-2">📚</div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">LearnFlow</h1>
        <p className="text-sm text-slate-600 mb-5">
          YouTube로 시작하는 개인화된 학습
        </p>
        {/* <div className="flex gap-4 justify-center">
          <Link href="#services">
            <Button className="px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-[#3B82F6] to-[#1E3A8A] text-white border-none hover:opacity-90 transition-all">
              학습 시작하기
            </Button>
          </Link>
          <Link href="/about">
            <Button
              variant="outline"
              className="px-6 py-2.5 rounded-full text-sm font-semibold text-[#3B82F6] border-2 border-[#3B82F6] bg-transparent hover:bg-[#3B82F6]/10 transition-all"
            >
              LearnFlow 소개
            </Button>
          </Link>
        </div> */}
      </section>

      {/* 서비스 섹션 */}
      <ProductList products={services} />
    </div>
  );
}
