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
export async function getAdminCohortDetail(
  cohortId: string
): Promise<{
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
