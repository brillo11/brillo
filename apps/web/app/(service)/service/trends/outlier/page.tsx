import { requireStudent } from "@/shared/lib/auth-guards";
import {
  getTopPrecomputedVideos,
  getTopPrecomputedShorts,
} from "@/serverActions/youtube/youtube-library.actions";
import { LibraryClient } from "./_components/library-client";

// SSR + Dynamic - 항상 최신 데이터, 캐시 없음
export const dynamic = "force-dynamic";

export default async function OutlierLibraryPage() {
  // 🛡️ 서버에서 권한 검증 (미들웨어 통과 후 2차 검증)
//   await requireStudent();

  // const [precomputed, shorts] = await Promise.all([
  //   getTopPrecomputedVideos(200, "KR", "outlierView", 1.4, 50),
  //   getTopPrecomputedShorts(200, "KR", "outlierView", 1.4, 50),
  // ]);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="w-full max-w-[1600px] mx-auto px-6 py-8">
        {/* <LibraryClient videos={precomputed} shorts={shorts} /> */}
      </div>
    </div>
  );
}
