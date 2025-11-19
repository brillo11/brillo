import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // apps/admin 전용 포트
  basePath: "/api/auth",
});

export const { signIn, signUp, signOut, useSession } = authClient;
