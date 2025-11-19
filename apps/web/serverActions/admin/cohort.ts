"use server";

import { prisma } from "@repo/database";
import { requireAdmin } from "@/shared/lib/auth-guards";
import { revalidatePath } from "next/cache";
import { PATH } from "@/shared/consts/path";

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
  await requireAdmin();

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
  await requireAdmin();

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
  await requireAdmin();

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

// 기수 삭제
export async function deleteAdminCohort(
  cohortId: string
): Promise<void> {
  await requireAdmin();

  await prisma.cohort.delete({
    where: { id: BigInt(cohortId) },
  });

  revalidatePath(PATH.ADMIN_COHORT);
}
