"use server";

import { prisma } from "@repo/database";
import { requireAdmin } from "@/shared/lib/auth-guards";
import { revalidatePath } from "next/cache";
import { PATH } from "@/shared/consts/path";

// 미션 생성
export async function createMission({
  title,
  description,
  week,
  dueDate,
  cohortId,
}: {
  title: string;
  description: string;
  week: number;
  dueDate: Date;
  cohortId: number;
}): Promise<{
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  week: number;
  createdAt: Date;
  updatedAt: Date;
}> {
  await requireAdmin();

  // Cohort 존재 확인
  const cohort = await prisma.cohort.findUnique({
    where: { id: BigInt(cohortId) },
  });

  if (!cohort) {
    throw new Error("Cohort not found");
  }

  const mission = await prisma.mission.create({
    data: {
      title,
      description,
      week,
      dueDate: new Date(dueDate),
      cohortId: BigInt(cohortId),
    },
  });

  revalidatePath(PATH.ADMIN_MISSIONS_NOTICE);
  return {
    ...mission,
    id: Number(mission.id),
  };
}

// 미션 수정
export async function updateMission({
  id,
  title,
  description,
  week,
  dueDate,
  cohortId,
}: {
  id: number;
  title: string;
  description: string;
  week: number;
  dueDate: Date;
  cohortId: number;
}): Promise<{
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  week: number;
  createdAt: Date;
  updatedAt: Date;
}> {
  await requireAdmin();

  // Mission 존재 확인
  const existingMission = await prisma.mission.findUnique({
    where: { id: BigInt(id) },
  });

  if (!existingMission) {
    throw new Error("Mission not found");
  }

  // Cohort 존재 확인
  const cohort = await prisma.cohort.findUnique({
    where: { id: BigInt(cohortId) },
  });

  if (!cohort) {
    throw new Error("Cohort not found");
  }

  const mission = await prisma.mission.update({
    where: { id: BigInt(id) },
    data: {
      title,
      description,
      week,
      dueDate: new Date(dueDate),
      cohortId: BigInt(cohortId),
    },
  });

  revalidatePath(PATH.ADMIN_MISSIONS_NOTICE);
  return {
    ...mission,
    id: Number(mission.id),
  };
}
