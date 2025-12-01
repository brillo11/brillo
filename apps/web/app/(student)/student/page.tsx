import { requireStudent } from "@/shared/lib/auth-guards";
import { getStudentMissionData } from "@/serverActions/mission.actions";
import { getPosts } from "@/serverActions/post.actions";
import { getTopPrecomputedVideos } from "@/serverActions/youtube/youtube-precomputed.actions";
import { prisma } from "@repo/database";
import StudentDashboardClient from "./studentLounge/dashboard/_components/student-dashboard-client";

// SSR + Dynamic - 항상 최신 데이터, 캐시 없음
export const dynamic = "force-dynamic";

export default async function StudentPage() {
  // 🛡️ 서버에서 권한 검증 (미들웨어 통과 후 2차 검증)
  const session = await requireStudent();
  const userId = session.user.id;

  // 사용자 정보 가져오기
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      nickname: true,
      points: true,
    },
  });

  // 미션 데이터 가져오기
  const { missions } = await getStudentMissionData();
  const completedMissions = missions.filter(
    (m) => m.submissions.length > 0
  ).length;
  const totalMissions = missions.length;
  const progressPercentage =
    totalMissions > 0
      ? Math.round((completedMissions / totalMissions) * 100)
      : 0;

  // 현재 미션 찾기
  const now = new Date();
  const upcomingMissions = missions.filter((m) => new Date(m.dueDate) > now);
  const currentMission =
    upcomingMissions.length > 0
      ? upcomingMissions.sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        )[0]
      : missions[missions.length - 1];

  // 공지사항 가져오기 (최근 2개)
  const { posts: notices } = await getPosts("notice", 1, 2);

  // 추천 영상 가져오기 (최근 3개)
  const recommendedVideos = await getTopPrecomputedVideos(4, "KR");

  const userName = user?.name || user?.nickname || "학습자";
  const userPoints = user?.points || 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6">
      <StudentDashboardClient
        userName={userName}
        pointsEarned={userPoints}
        missionsDone={completedMissions}
        progressPercentage={progressPercentage}
        currentMission={currentMission}
        notices={notices}
        recommendedVideos={recommendedVideos}
      />
    </div>
  );
}
