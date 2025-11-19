import { requireStudent } from "@/shared/lib/auth-guards";
import { PointsChargeView } from "./PointsChargeView";

export const dynamic = "force-dynamic";

export default async function PointsPage() {
  const session = await requireStudent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9EBDD] to-[#FAF0E6] p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">
            복비(냥) 충전소
          </h1>
          <p className="text-[#7f8c8d]">
            사주 분석에 필요한 복비를 충전해보세요.
          </p>
        </div>

        <PointsChargeView user={session.user} />
      </div>
    </div>
  );
}
