import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // apps/web 전용 포트
  basePath: "/api/auth",
});

