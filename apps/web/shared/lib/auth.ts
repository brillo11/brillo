import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/database";

// Prisma Client 래퍼 - 로깅 추가
const prismaWithLogging = new Proxy(prisma, {
  get(target, prop) {
    const original = (target as any)[prop];

    if (prop === "user" || prop === "account") {
      return new Proxy(original, {
        get(innerTarget, innerProp) {
          const innerOriginal = innerTarget[innerProp];

          if (innerProp === "create" && typeof innerOriginal === "function") {
            return async function (...args: any[]) {
              if (prop === "user") {
                console.log("👤 새 사용자 생성 시도");
                console.log(
                  "네이버에서 받은 원본 데이터:",
                  JSON.stringify(args[0]?.data, null, 2)
                );

                // 네이버의 mobile을 phoneNumber로 변환
                if (args[0]?.data?.mobile) {
                  console.log("📱 전화번호 감지:", args[0].data.mobile);
                  args[0].data.phoneNumber = args[0].data.mobile;
                  delete args[0].data.mobile;
                  console.log("📝 phoneNumber 필드로 변환 완료");
                }

                console.log(
                  "최종 저장 데이터:",
                  JSON.stringify(args[0]?.data, null, 2)
                );
              }
              if (prop === "account") {
                console.log("🔗 소셜 계정 연결");
                console.log(
                  "계정 데이터:",
                  JSON.stringify(args[0]?.data, null, 2)
                );
              }

              const result = await innerOriginal.apply(innerTarget, args);

              if (prop === "user") {
                console.log(
                  "✅ 사용자 생성 완료:",
                  JSON.stringify(result, null, 2)
                );
              }

              return result;
            };
          }

          return innerOriginal;
        },
      });
    }

    return original;
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth: any = betterAuth({
  database: prismaAdapter(prismaWithLogging as any, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL, // apps/admin 전용 포트
  basePath: "/api/auth",
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://www.youtube-longform-web.vercel.app",
    "https://youtube-longform-web.vercel.app",
  ], // 로컬 및 프로덕션 환경 허용
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
  callbacks: {
    async session({ session, user }: { session: any; user: any }) {
      // 세션에 사용자 role과 status 포함
      if (user) {
        (session.user as any).role = (user as any).role;
        (session.user as any).status = (user as any).status;
      }
      return session;
    },
  },
  socialProviders: {
    // naver: {
    //   clientId: process.env.NAVER_CLIENT_ID || "",
    //   clientSecret: process.env.NAVER_CLIENT_SECRET || "",
    //   scope: ["email", "nickname", "mobile"] as string[], // 필요한 동의 항목
    // },
    kakao: {
      clientId: process.env.KAKAO_CLIENT_ID || "", // REST API 키
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "", // Client Secret (보안 탭에서 생성)
      scope: ["account_email", "profile_nickname"] as string[], // 필요한 동의 항목
      disableDefaultScope: true, // 기본 스코프(profile_image 등) 비활성화
    },
    // google: {
    //   clientId: process.env.GOOGLE_CLIENT_ID || "",
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    //   scope: ["email", "profile"] as string[], // 구글에서 제공하는 기본 정보
    // },
  },
} as const);

export type Session = typeof auth.$Infer.Session;
