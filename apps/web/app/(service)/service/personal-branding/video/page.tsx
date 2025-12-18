import { requireStudent } from "@/shared/lib/auth-guards";
import { AIAssistantClient } from "./_components/ai-assistant-client";

// SSR + Dynamic - 항상 최신 데이터, 캐시 없음
export const dynamic = "force-dynamic";

export default async function AIAssistantPage() {
  // 🛡️ 서버에서 권한 검증 (미들웨어 통과 후 2차 검증)
  await requireStudent();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full max-w-7xl mx-auto px-6 py-6">
        <AIAssistantClient />
      </div>
    </div>
  );
}
