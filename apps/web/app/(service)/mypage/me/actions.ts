"use server";

import { prisma } from "@repo/database";
import { auth } from "@/shared/lib/auth";
import { headers } from "next/headers";

export async function getLoginProvider() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id },
  });

  return account?.providerId || "email";
}
