"use server";

import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";

export async function getAdminUserList({
  params,
  tableState,
  keyword,
}: {
  params: any;
  tableState: any;
  keyword: string;
}) {
  const users = await prisma.user.findMany({
    take: params.size,
    skip: (params.page - 1) * params.size,
    where: keyword
      ? {
          OR: [{ nickname: { contains: keyword } }],
        }
      : undefined,
    orderBy: {
      createdAt: "desc",
    },
  });

  // 전체 검색 결과 수
  const total = await prisma.user.count({
    where: keyword
      ? {
          OR: [
            { nickname: { contains: keyword } },
            { accountId: { contains: keyword } },
          ],
        }
      : undefined,
  });
  revalidatePath("/admin/user");
  return {
    data: users,
    total,
    totalPages: Math.ceil(total / params.size),
  };
}

export async function getAdminUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: BigInt(userId),
    },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      accountId: true,
      nickname: true,
      name: true,
      mobile: true,
      role: true,
      status: true,
      isNewUser: true,
      adminMemo: true,
    },
  });

  return user;
}

export async function deleteAdminUser(userId: string) {
  await prisma.user.delete({
    where: {
      id: BigInt(userId),
    },
  });
}

export async function updateAdminUser(
  userId: string,
  data: {
    nickname?: string;
    role?: "USER" | "ADMIN";
    isNewUser?: boolean;
  }
) {
  await prisma.user.update({
    where: {
      id: BigInt(userId),
    },
    data: {
      nickname: data.nickname,
      role: data.role,
      isNewUser: data.isNewUser,
    },
  });
  revalidatePath(`/admin/user/edit/${userId}`);
}

export async function updateUserAdminMemo(userId: string, adminMemo: string) {
  try {
    await prisma.user.update({
      where: { id: BigInt(userId) },
      data: { adminMemo },
    });

    revalidatePath(`/admin/user/edit/${userId}`);
    return {
      success: true,
      message: "관리자 메모가 업데이트되었습니다.",
    };
  } catch (error) {
    console.error("관리자 메모 업데이트 오류:", error);
    return {
      success: false,
      message: "관리자 메모 업데이트에 실패했습니다.",
    };
  }
}
