import { requireAuth } from "@/shared/lib/auth-guards";
import { getUserProfile } from "@/serverActions/student/profile.actions";
import { StudentProfileClient } from "@/app/(student)/student/profile/_components/student-profile-client";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const session = await requireAuth();

  // 프로필 데이터 가져오기 (공통 함수 사용)
  const profile = await getUserProfile();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">마이페이지</h1>
          <p className="text-slate-600">
            프로필 정보를 확인하고 수정할 수 있습니다.
          </p>
        </div>

        <StudentProfileClient initialProfile={profile} />
      </div>
    </div>
  );
}
