"use server";

import { prisma } from "@repo/database";
import bcrypt from "bcryptjs";
import { auth } from "@/shared/lib/auth";
import { headers } from "next/headers";

// 어드민 로그인 액션
export async function adminLogin({ id, pw }: { id: string; pw: string }) {
  // Account를 통해 계정 검증
  const account = await prisma.account.findFirst({
    where: {
      accountId: id,
      providerId: "CREDENTIALS",
    },
    include: {
      user: true,
    },
  });

  if (!account || !account.user) {
    return { success: false, error: "존재하지 않는 계정입니다." };
  }

  const user = account.user;

  if (user.role !== "ADMIN") {
    return { success: false, error: "어드민 권한이 없습니다." };
  }

  // 비밀번호 검증
  if (!account.password) {
    return { success: false, error: "비밀번호가 설정되지 않았습니다." };
  }

  const valid = await bcrypt.compare(pw, account.password);
  if (!valid) {
    return { success: false, error: "비밀번호가 일치하지 않습니다." };
  }

  // 세션 발급 (signIn 활용)
  // Auth.js의 signIn은 클라이언트에서만 동작하므로, 서버 액션에서는 별도 세션 발급 필요
  // 여기서는 간단히 성공만 반환 (실제 세션 발급은 NextAuth 커스텀 signIn 필요)
  // TODO: 서버에서 세션 발급하려면 커스텀 구현 필요
  return { success: true };
}

// 현재 세션의 어드민 여부 반환
export async function getAdminSession() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  if (!session?.user) return { role: null };
  return { role: session.user.role };
}
