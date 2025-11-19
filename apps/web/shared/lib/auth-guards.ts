import { auth } from "@/shared/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PATH } from "../consts/path";

/**
 * 🛡️ 서버 사이드 관리자 권한 검증
 * 미들웨어 통과 후 서버 액션/페이지에서 사용하는 2차 방어선
 */
export async function requireAdmin() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  // 로그인만 확인 (role 검증 제거)
  if (!session || !session.user) {
    redirect(PATH.AUTH_LOGIN);
  }

  return session;
}

export async function requireStudent() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  return session;
  if (!session || !session.user) {
    redirect(PATH.AUTH_LOGIN);
  }

  return session;
}

/**
 * 🛡️ 서버 사이드 사용자 인증 검증
 */
export async function requireAuth() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session || !session.user) {
    redirect(PATH.AUTH_LOGIN);
  }

  return session;
}

/**
 * 🛡️ 서버 사이드 권한 검증 (특정 권한 확인)
 */
export async function requireRole(requiredRole: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  const user = session?.user as any;
  if (!session || !user || user.role !== requiredRole) {
    console.warn(`🚨 Insufficient permissions:`, {
      userId: user?.id || "anonymous",
      userRole: user?.role || "none",
      requiredRole,
      timestamp: new Date().toISOString(),
    });

    redirect("/");
  }

  return session;
}

/**
 * 🔍 권한 체크만 (리다이렉트 없음)
 * 조건부 렌더링에 사용
 */
export async function checkAdmin() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  const user = session?.user as any;
  return user?.role === "ADMIN";
}

/**
 * 📋 사용자 권한 정보 반환
 */
export async function getCurrentUser() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  return session?.user || null;
}
