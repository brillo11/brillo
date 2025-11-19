import { requireStudent } from "@/shared/lib/auth-guards";
import { getStudentMissionData } from "@/serverActions/mission.actions";
import MissionContent from "./_components/MissionContent";

export default async function MissionPage() {
  await requireStudent();
  const { cohort, missions } = await getStudentMissionData();

  return <MissionContent cohort={cohort} missions={missions} />;
}
