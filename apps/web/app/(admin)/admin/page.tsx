import { getAdminDashboardStats } from "@/serverActions/admin/dashboard.sa";
import DashboardHeader from "./(_components)/dashboard-header";
import AdminManageMenu from "./(_components)/admin-manage-menu";
import StatusCardList from "./(_components)/status-card-list";
import QuickActions from "./(_components)/quick-actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 주요 통계 카드 */}
        <StatusCardList stats={stats} />
        <QuickActions stats={stats} />
        <AdminManageMenu stats={stats} />
      </div>
    </div>
  );
}
