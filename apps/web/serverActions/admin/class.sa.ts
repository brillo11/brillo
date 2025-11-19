"use server";

import { prisma } from "@repo/database";
import { requireAdmin } from "@/shared/lib/auth-guards";
import { revalidatePath } from "next/cache";

// 기수 목록 조회
export async function getAdminClassList({
  params,
  tableState,
  keyword,
}: {
  params: any;
  tableState: any;
  keyword: string;
}) {
  await requireAdmin();

  const classes = await prisma.class.findMany({
    take: params.size,
    skip: (params.page - 1) * params.size,
    where: keyword
      ? {
          OR: [{ title: { contains: keyword } }, { slug: { contains: keyword } }],
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
  const total = await prisma.class.count({
    where: keyword
      ? {
          OR: [
            { title: { contains: keyword } },
            { slug: { contains: keyword } },
          ],
        }
      : undefined,
  });

  revalidatePath("/admin/class");
  return {
    data: classes,
    total,
    totalPages: Math.ceil(total / params.size),
  };
}

// 기수 상세 조회
export async function getAdminClassDetail(classId: string) {
  await requireAdmin();

  const classData = await prisma.class.findUnique({
    where: { id: BigInt(classId) },
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

  return classData;
}

// 기수 생성
export async function createAdminClass({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  await requireAdmin();

  const classData = await prisma.class.create({
    data: {
      title,
      slug,
    },
  });

  revalidatePath("/admin/class");
  return classData;
}

// 기수 수정
export async function updateAdminClass({
  id,
  title,
  slug,
}: {
  id: string;
  title: string;
  slug: string;
}) {
  await requireAdmin();

  const classData = await prisma.class.update({
    where: { id: BigInt(id) },
    data: {
      title,
      slug,
    },
  });

  revalidatePath("/admin/class");
  return classData;
}

// 기수 삭제
export async function deleteAdminClass(classId: string) {
  await requireAdmin();

  await prisma.class.delete({
    where: { id: BigInt(classId) },
  });

  revalidatePath("/admin/class");
}

