import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // baseURL 생략 시 자동으로 현재 origin 사용 (로컬: localhost:3000, 배포: yourdomain.com)
  basePath: "/api/auth",
});

export const { signIn, signUp, signOut, useSession } = authClient;
