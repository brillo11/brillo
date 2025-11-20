import { requireStudent } from "@/shared/lib/auth-guards";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
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
      <section className="px-5 py-8 text-center bg-gradient-to-br from-[#F9EBDD]/90 to-[#FAF0E6]/90">
        <div className="text-4xl mb-2">🪷</div>
        <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">
          연화당에서 만나는 나만의 운명
        </h1>
        <p className="text-sm text-[#7f8c8d] mb-5">
          천년의 지혜가 담긴 전통 사주를 현대적 해석으로 만나보세요
        </p>
        {/* <div className="flex gap-4 justify-center">
          <Link href="#services">
            <Button className="px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-[#F2779C] to-[#3BB4C1] text-white border-none hover:opacity-90 transition-all">
              사주 보기 시작하기
            </Button>
          </Link>
          <Link href="/about">
            <Button
              variant="outline"
              className="px-6 py-2.5 rounded-full text-sm font-semibold text-[#F2779C] border-2 border-[#F2779C] bg-transparent hover:bg-[#F2779C]/10 transition-all"
            >
              연화당 소개
            </Button>
          </Link>
        </div> */}
      </section>

      {/* 서비스 섹션 */}
      <ProductList products={services} />
    </div>
  );
}
