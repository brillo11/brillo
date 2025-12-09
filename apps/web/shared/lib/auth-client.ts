import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL, // apps/admin 전용 포트
  basePath: "/api/auth",
});

export const { signIn, signUp, signOut, useSession } = authClient;
