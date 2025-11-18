// betterAuth로 마이그레이션됨
// 이 파일은 하위 호환성을 위해 유지하되, 실제 구현은 lib/auth.ts를 사용
export { auth } from "@/lib/auth";

// betterAuth의 클라이언트 헬퍼 함수들
import { createAuthClient } from "better-auth/react";

export const clientAuth = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// 하위 호환성을 위한 래퍼 함수들
export const signIn = async (provider: string, options?: any) => {
  if (provider === "credentials") {
    return await clientAuth.signIn.email({
      email: options?.username || options?.email,
      password: options?.password,
    });
  }
  return await clientAuth.signIn.social({
    provider: provider as any,
    callbackURL: options?.callbackUrl || "/",
  });
};

export const signOut = async () => {
  return await clientAuth.signOut();
};

export const update = async (data: any) => {
  return await clientAuth.user.update(data);
};
