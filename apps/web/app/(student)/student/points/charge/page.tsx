import { requireStudent } from "@/shared/lib/auth-guards";
import { PointsChargeView } from "./PointsChargeView";

export const dynamic = "force-dynamic";

export default async function PointsPage() {
  const session = await requireStudent();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            포인트 충전
          </h1>
          <p className="text-slate-600">학습에 필요한 포인트를 충전해보세요.</p>
        </div>

        <PointsChargeView user={session.user} />
      </div>
    </div>
  );
}
