import { requireAdmin } from "@/shared/lib/auth-guards";
import { getCohortsForSelect, getCohortMissions, getActiveCohorts } from "@/serverActions/admin/cohort";
import MissionNoticeClientPage from "./components/mission-notice-client-page";

export const dynamic = "force-dynamic";

export default async function MissionNoticePage() {
  await requireAdmin();

  // 진행 중인 기수 목록 조회
  const [activeCohorts, allCohorts] = await Promise.all([
    getActiveCohorts(),
    getCohortsForSelect(),
  ]);

  // 기본 선택 기수 (첫 번째 활성 기수 또는 첫 번째 기수)
  const defaultCohortId = activeCohorts.length > 0 
    ? activeCohorts[0].id 
    : (allCohorts.length > 0 ? allCohorts[0].id : null);

  // 기본 선택 기수의 미션 목록 조회
  const initialMissions = defaultCohortId 
    ? await getCohortMissions(defaultCohortId)
    : [];

  return (
    <MissionNoticeClientPage 
      initialMissions={initialMissions}
      cohorts={allCohorts}
      defaultCohortId={defaultCohortId}
    />
  );
}
