import { requireStudent } from "@/shared/lib/auth-guards";
import { getAdminDashboardStats } from "@/serverActions/admin/dashboard.sa";
// import DashboardHeader from "./components/dashboard-header";
// import AdminManageMenu from "./components/admin-manage-menu";
// import StatusCardList from "./components/status-card-list";
// import QuickActions from "./components/quick-actions";

// SSR + Dynamic - 항상 최신 데이터, 캐시 없음
export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  // 🛡️ 서버에서 권한 검증 (미들웨어 통과 후 2차 검증)
  const session = await requireStudent();

  // 서버에서 대시보드 데이터 직접 페칭
  // const stats = await getAdminDashboardStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <DashboardHeader /> */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* 주요 통계 카드 */}
          {/* <StatusCardList stats={stats} /> */}

          {/* 빠른 작업 */}
          {/* <QuickActions stats={stats} /> */}

          {/* 관리 메뉴 */}
          {/* <AdminManageMenu stats={stats} /> */}
        </div>

        {/* 개발 모드 디버깅 정보 */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-12 p-4 bg-white rounded-lg shadow text-xs space-y-2">
            <h4 className="font-semibold text-gray-900">
              🔧 개발자 디버깅 정보
            </h4>
            <div className="grid grid-cols-2 gap-4 text-gray-600">
              <div>
                <p>
                  <strong>렌더링:</strong> SSR (Server-Side Rendering)
                </p>
                <p>
                  <strong>캐싱:</strong> force-dynamic (비활성화)
                </p>
                <p>
                  <strong>보안:</strong> 미들웨어 + 서버 권한검증
                </p>
              </div>
              <div>
                <p>
                  <strong>사용자:</strong>{" "}
                  {session.user?.nickname || session.user?.name}
                </p>
                <p>
                  <strong>권한:</strong> {session.user?.role}
                </p>
                <p>
                  <strong>렌더링 시간:</strong> {new Date().toISOString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
