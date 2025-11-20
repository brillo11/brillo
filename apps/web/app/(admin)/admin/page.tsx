import { requireAdmin } from "@/shared/lib/auth-guards";
import { getActiveCohorts } from "@/serverActions/admin/cohort";
import AdminDashboardClient from "./components/admin-dashboard-client";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();

  // 진행 중인 기수 조회
  const activeCohorts = await getActiveCohorts();
  const activeCohortCount = activeCohorts.length;

  return (
    <AdminDashboardClient
      activeCohorts={activeCohorts}
      activeCohortCount={activeCohortCount}
    />
  );
}
