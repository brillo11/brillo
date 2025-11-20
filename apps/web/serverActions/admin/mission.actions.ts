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

