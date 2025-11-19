"use server";

import { prisma } from "@repo/database";
import { requireStudent } from "@/shared/lib/auth-guards";
import { Prisma } from "@repo/database";

export type MissionWithSubmissions = Prisma.MissionGetPayload<{
  include: { submissions: true };
}>;

type StudentMissionData = {
  cohort: Prisma.CohortGetPayload<{ include: { missions: true } }> | null;
  missions: MissionWithSubmissions[];
};

export async function getStudentMissionData(): Promise<StudentMissionData> {
  const session = await requireStudent();
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      cohort: {
        include: {
          missions: {
            orderBy: { week: "asc" },
            include: {
              submissions: {
                where: { userId },
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    cohort: user.cohort as any, // Type assertion to avoid complex nested type issues for now, or refine types
    missions: user.cohort?.missions || [],
  };
}

export async function submitMission(missionId: number, content: string) {
  const session = await requireStudent();
  const userId = session.user.id;

  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
  });

  if (!mission) {
    throw new Error("Mission not found");
  }

  // Check if due date has passed
  if (new Date() > mission.dueDate) {
    throw new Error("Submission deadline has passed");
  }

  // Check for existing submission
  const existingSubmission = await prisma.submission.findFirst({
    where: {
      missionId,
      userId,
    },
  });

  if (existingSubmission) {
    return await prisma.submission.update({
      where: { id: existingSubmission.id },
      data: { content },
    });
  } else {
    return await prisma.submission.create({
      data: {
        missionId,
        userId,
        content,
      },
    });
  }
}
