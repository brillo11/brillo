"use server";

import { requireStudent } from "@/shared/lib/auth-guards";
import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";

export async function getProfileSettings() {
  const session = await requireStudent();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      nickname: true,
      email: true,
      role: true,
      image: true,
      heygenAvatarId: true,
      heygenVoiceId: true,
    } as any,
  });

  return user;
}

export async function updateProfileSettings(data: {
  heygenAvatarId?: string;
  heygenVoiceId?: string;
}) {
  const session = await requireStudent();

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      heygenAvatarId: data.heygenAvatarId,
      heygenVoiceId: data.heygenVoiceId,
    } as any,
  });

  revalidatePath("/service/profile");
}
