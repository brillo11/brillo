"use server";

import { prisma } from "@repo/database";
import { requireAdmin } from "@/shared/lib/auth-guards";
import { revalidatePath } from "next/cache";
import { PATH } from "@/shared/consts/path";

// Select용 기수 목록 조회
export async function getCohortsForSelect(): Promise<
  Array<{
    id: number;
    title: string;
    slug: string;
  }>
> {
  await requireAdmin();

  const cohorts = await prisma.cohort.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // BigInt id를 number로 변환 (클라이언트 전달용)
  return cohorts.map((cohort) => ({
    ...cohort,
    id: Number(cohort.id),
  }));
}

// 진행 중인 기수 조회 (endDate가 지나지 않은 기수)
export async function getActiveCohorts(): Promise<
  Array<{
    id: number;
    title: string;
    slug: string;
    endDate: Date;
  }>
> {
  await requireAdmin();

  const now = new Date();
  const cohorts = await prisma.cohort.findMany({
    where: {
      endDate: {
        gte: now, // endDate가 현재 날짜보다 크거나 같은 경우 (아직 종료되지 않음)
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      endDate: true,
    },
    orderBy: {
      cohortOrder: "asc", // 기수 순서대로 정렬
    },
  });

  // BigInt id를 number로 변환 (클라이언트 전달용)
  return cohorts.map((cohort) => ({
    ...cohort,
    id: Number(cohort.id),
  }));
}

// 기수 목록 조회
export async function getAdminCohortList({
  params,
  tableState,
  keyword,
}: {
  params: any;
  tableState: any;
  keyword: string;
}): Promise<{
  data: Array<{
    id: bigint;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    slug: string;
    _count: {
      users: number;
    };
  }>;
  total: number;
  totalPages: number;
}> {
  await requireAdmin();

  const cohorts = await prisma.cohort.findMany({
    take: params.size,
    skip: (params.page - 1) * params.size,
    where: keyword
      ? {
          OR: [
            { title: { contains: keyword } },
            { slug: { contains: keyword } },
          ],
        }
      : undefined,
    include: {
      _count: {
        select: {
          users: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 전체 검색 결과 수
  const total = await prisma.cohort.count({
    where: keyword
      ? {
          OR: [
            { title: { contains: keyword } },
            { slug: { contains: keyword } },
          ],
        }
      : undefined,
  });

  revalidatePath(PATH.ADMIN_COHORT);
  return {
    data: cohorts,
    total,
    totalPages: Math.ceil(total / params.size),
  };
}

// 기수 상세 조회
export async function getAdminCohortDetail(cohortId: string): Promise<{
  id: bigint;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  totalWeek: number;
  startDate: Date;
  endDate: Date;
  cohortOrder: number;
  slug: string;
  misc: any;
  users: Array<{
    id: string;
    name: string;
    nickname: string;
    email: string | null;
    createdAt: Date;
  }>;
  _count: {
    users: number;
  };
} | null> {
  const cohortData = await prisma.cohort.findUnique({
    where: { id: BigInt(cohortId) },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          nickname: true,
          email: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  return cohortData;
}

// 기수 생성
export async function createAdminCohort({
  title,
  slug,
}: {
  title: string;
  slug: string;
}): Promise<{
  id: bigint;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  totalWeek: number;
  startDate: Date;
  endDate: Date;
  cohortOrder: number;
  slug: string;
  misc: any;
}> {
  const cohortData = await prisma.cohort.create({
    data: {
      title,
      slug,
      startDate: new Date(),
      endDate: new Date(),
      cohortOrder: 0,
      misc: {},
    },
  });

  revalidatePath(PATH.ADMIN_COHORT);
  return cohortData;
}

// 기수 수정
export async function updateAdminCohort({
  id,
  title,
  slug,
}: {
  id: string;
  title: string;
  slug: string;
}): Promise<{
  id: bigint;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  totalWeek: number;
  startDate: Date;
  endDate: Date;
  cohortOrder: number;
  slug: string;
  misc: any;
}> {
  const cohortData = await prisma.cohort.update({
    where: { id: BigInt(id) },
    data: {
      title,
      slug,
    },
  });

  revalidatePath(PATH.ADMIN_COHORT);
  return cohortData;
}

// 기수별 주차별 제출률 조회
export async function getCohortWeeklySubmissionRate(cohortId: number): Promise<{
  cohort: {
    id: number;
    title: string;
    totalWeek: number;
    totalUsers: number;
  };
  weeklyData: Array<{
    week: number;
    totalMissions: number;
    completedUsers: number; // 해당 주차의 모든 미션을 제출한 사용자 수
    submissionRate: number; // 제출률 (completedUsers / totalUsers * 100)
    status: "양호" | "독려필요";
  }>;
}> {
  await requireAdmin();

  // Cohort 정보와 전체 사용자 수 조회
  const cohort = await prisma.cohort.findUnique({
    where: { id: BigInt(cohortId) },
    select: {
      id: true,
      title: true,
      totalWeek: true,
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  if (!cohort) {
    throw new Error("Cohort not found");
  }

  const totalUsers = cohort._count.users;

  // 해당 cohort의 모든 미션을 submissions와 함께 조회
  const missions = await prisma.mission.findMany({
    where: {
      cohortId: BigInt(cohortId),
    },
    include: {
      submissions: {
        select: {
          userId: true,
        },
      },
    },
    orderBy: {
      week: "asc",
    },
  });

  // 주차별 데이터 계산
  const weeklyData: Array<{
    week: number;
    totalMissions: number;
    completedUsers: number;
    submissionRate: number;
    status: "양호" | "독려필요";
  }> = [];

  for (let week = 1; week <= cohort.totalWeek; week++) {
    // 해당 주차의 모든 미션
    const weekMissions = missions.filter((m) => m.week === week);
    const totalMissions = weekMissions.length;

    if (totalMissions === 0) {
      // 해당 주차에 미션이 없는 경우
      weeklyData.push({
        week,
        totalMissions: 0,
        completedUsers: 0,
        submissionRate: 0,
        status: "독려필요",
      });
      continue;
    }

    // 각 사용자가 해당 주차의 모든 미션을 제출했는지 확인
    const userSubmissionCount = new Map<string, number>();

    // 각 미션의 제출을 확인
    weekMissions.forEach((mission) => {
      mission.submissions.forEach((submission) => {
        const count = userSubmissionCount.get(submission.userId) || 0;
        userSubmissionCount.set(submission.userId, count + 1);
      });
    });

    // 모든 미션을 제출한 사용자 수 계산 (제출한 미션 수가 totalMissions와 같은 사용자)
    let completedUsers = 0;
    userSubmissionCount.forEach((submissionCount) => {
      if (submissionCount === totalMissions) {
        completedUsers++;
      }
    });

    // 제출률 계산
    const submissionRate =
      totalUsers > 0 ? Math.round((completedUsers / totalUsers) * 100) : 0;

    // 상태 결정 (70% 이상이면 '양호')
    const status = submissionRate >= 70 ? "양호" : "독려필요";

    weeklyData.push({
      week,
      totalMissions,
      completedUsers,
      submissionRate,
      status,
    });
  }

  return {
    cohort: {
      id: Number(cohort.id),
      title: cohort.title,
      totalWeek: cohort.totalWeek,
      totalUsers,
    },
    weeklyData,
  };
}

// 기수별 미션 목록 조회
export async function getCohortMissions(cohortId: number): Promise<
  Array<{
    id: number;
    title: string;
    description: string;
    dueDate: Date;
    week: number;
    createdAt: Date;
    updatedAt: Date;
    misc: any;
  }>
> {
  await requireAdmin();

  const missions = await prisma.mission.findMany({
    where: {
      cohortId: BigInt(cohortId),
    },
    select: {
      id: true,
      title: true,
      description: true,
      dueDate: true,
      week: true,
      createdAt: true,
      updatedAt: true,
      misc: true,
    },
    orderBy: [{ week: "asc" }, { dueDate: "asc" }],
  });

  return missions.map((mission) => ({
    ...mission,
    id: Number(mission.id),
  }));
}
