import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth: any = betterAuth({
  database: prismaAdapter(prisma as any, {
    provider: "postgresql",
  }),
  baseURL: "http://localhost:3000", // apps/web 전용 포트
  basePath: "/api/auth",
  user: {
    modelName: "user",
    fields: {
      id: "id",
      email: "email",
      name: "name",
      role: "role",
      status: "status",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
  account: {
    modelName: "account",
    fields: {
      id: "id",
      userId: "userId",
      accountId: "accountId",
      providerId: "providerId",
      accessToken: "accessToken",
      refreshToken: "refreshToken",
      idToken: "idToken",
      accessTokenExpiresAt: "accessTokenExpiresAt",
      refreshTokenExpiresAt: "refreshTokenExpiresAt",
      scope: "scope",
      password: "password",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
  session: {
    modelName: "session",
    fields: {
      id: "id",
      userId: "userId",
      token: "token",
      expiresAt: "expiresAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      ipAddress: "ipAddress",
      userAgent: "userAgent",
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    kakao: {
      clientId: process.env.KAKAO_CLIENT_ID || "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
      scope: ["account_email", "profile_nickname", "phone_number"] as string[],
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      scope: ["email", "profile"] as string[],
    },
  },
} as const);

export type Session = typeof auth.$Infer.Session;

