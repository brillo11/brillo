import { requireStudent } from "@/shared/lib/auth-guards";
import { ProductList } from "@/features/product/ui/ProductList";
import { getProductsForList } from "@/serverActions/product.actions";
import { getTopPrecomputedVideos } from "@/serverActions/youtube/youtube-precomputed.actions";
import { PopularVideosSection } from "./studentLounge/dashboard/_components/PopularVideosSection";

// SSR + Dynamic - 항상 최신 데이터, 캐시 없음
export const dynamic = "force-dynamic";

export default async function StudentPage() {
  // 🛡️ 서버에서 권한 검증 (미들웨어 통과 후 2차 검증)
  await requireStudent();

  const precomputed = await getTopPrecomputedVideos(50, "KR");

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)]">
      {/* 인기 YouTube 영상 섹션 */}
      <section className="px-5 py-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          {/* PopularVideosSection 타입 호환: 필요한 필드가 superset이므로 그대로 사용 */}
          <PopularVideosSection videos={precomputed as any} />
        </div>
      </section>
    </div>
  );
}
