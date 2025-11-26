"use server";

import { prisma } from "@repo/database";
import { requireStudent, requireAuth } from "@/shared/lib/auth-guards";
import { revalidatePath } from "next/cache";
import { PATH } from "@/shared/consts/path";

/**
 * 공통 프로필 조회 (admin/student 모두 사용 가능)
 */
export async function getUserProfile(): Promise<{
  id: string;
  name: string;
  email: string | null;
  nickname: string;
  phoneNumber: string | null;
  image: string | null;
  learningLevel: string | null;
  learningGoals: string | null;
  learningHistory: any;
}> {
  const session = await requireAuth();
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      nickname: true,
      phoneNumber: true,
      image: true,
      learningLevel: true,
      learningGoals: true,
      learningHistory: true,
    },
  });

  if (!user) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  return user;
}

/**
 * 수강생 프로필 조회 (기존 호환성 유지)
 */
export async function getStudentProfile(): Promise<{
  id: string;
  name: string;
  email: string | null;
  nickname: string;
  phoneNumber: string | null;
  image: string | null;
  learningLevel: string | null;
  learningGoals: string | null;
  learningHistory: any;
}> {
  const session = await requireStudent();
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      nickname: true,
      phoneNumber: true,
      image: true,
      learningLevel: true,
      learningGoals: true,
      learningHistory: true,
    },
  });

  if (!user) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  return user;
}

/**
 * 수강생 프로필 업데이트
 */
export async function updateStudentProfile({
  learningLevel,
  learningGoals,
}: {
  learningLevel?: string;
  learningGoals?: string;
}) {
  const session = await requireStudent();
  const userId = session.user.id;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      learningLevel: learningLevel || null,
      learningGoals: learningGoals || null,
    },
    select: {
      id: true,
      learningLevel: true,
      learningGoals: true,
    },
  });

  revalidatePath(PATH.STUDENT_PROFILE);
  return user;
}
