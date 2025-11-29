"use server";

import { prisma, ROLE } from "@repo/database";
import { revalidatePath } from "next/cache";
import { Prisma } from "@repo/database";

export async function getAdminUserList({
  params,
  tableState,
  keyword,
  role,
  status,
}: {
  params: any;
  tableState: any;
  keyword?: string;
  role?: string;
  status?: string;
}): Promise<{
  data: Prisma.UserGetPayload<{}>[];
  total: number;
  totalPages: number;
}> {
  const where: any = {};

  // 검색어 필터
  if (keyword) {
    where.OR = [
      { nickname: { contains: keyword } },
      { name: { contains: keyword } },
    ];
  }

  // 역할 필터
  if (role) {
    // ROLE enum으로 변환 (USER는 STUDENT로 매핑)
    const roleMap: Record<string, ROLE> = {
      USER: ROLE.STUDENT,
      STUDENT: ROLE.STUDENT,
      ADMIN: ROLE.ADMIN,
      SUPER_ADMIN: ROLE.SUPER_ADMIN,
    };
    const mappedRole = roleMap[role.toUpperCase()];
    if (mappedRole) {
      where.role = mappedRole;
    }
  }

  // 상태 필터
  if (status) {
    where.status = status;
  }

  const users = await prisma.user.findMany({
    take: params.size,
    skip: (params.page - 1) * params.size,
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy: {
      createdAt: "desc",
    },
  });

  // 전체 검색 결과 수
  const total = await prisma.user.count({
    where: Object.keys(where).length > 0 ? where : undefined,
  });
  revalidatePath("/admin/students");
  return {
    data: users,
    total,
    totalPages: Math.ceil(total / params.size),
  };
}

export async function getAdminUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      nickname: true,
      name: true,
      phoneNumber: true,
      role: true,
      status: true,
      email: true,
      memo: true,
      accounts: {
        select: {
          accountId: true,
          providerId: true,
        },
      },
    },
  });

  return user;
}

export async function deleteAdminUser(userId: string) {
  // Account와 User 모두 삭제 (CASCADE로 자동 삭제되지만 명시적으로 처리)
  await prisma.account.deleteMany({
    where: {
      userId: userId,
    },
  });
  await prisma.user.delete({
    where: {
      id: userId,
    },
  });
  revalidatePath("/admin/user");
}

export async function updateAdminUser(
  userId: string,
  data: {
    nickname?: string;
    role?: "USER" | "ADMIN" | "STUDENT";
    status?: "PENDING" | "ACTIVE" | "INACTIVE" | "UNKNOWN";
  }
) {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      nickname: data.nickname,
      role: data.role as ROLE,
      status: data.status,
    },
  });
  revalidatePath(`/admin/user/edit/${userId}`);
  revalidatePath("/admin/user");
}

export async function updateUserAdminMemo(userId: string, adminMemo: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { memo: adminMemo },
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
