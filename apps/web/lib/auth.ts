import { betterAuth } from "better-auth";
import { prisma } from "@repo/database";
import { kakao, google } from "better-auth/providers";
import type { Adapter } from "better-auth/types";

// 커스텀 어댑터 - 기존 User 모델 사용
const customAdapter: Adapter = {
  async createUser(data) {
    const user = await prisma.user.create({
      data: {
        accountId: data.email || data.name || `user_${Date.now()}`,
        name: data.name || "",
        email: data.email || "",
        nickname: data.name ? `${data.name}_${Date.now()}` : `user_${Date.now()}`,
        password: data.password || "",
        provider: "CREDENTIALS",
        role: "USER",
        isNewUser: true,
      },
    });
    return {
      id: user.id.toString(),
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      image: null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
  async getUser(id) {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(id) },
    });
    if (!user) return null;
    return {
      id: user.id.toString(),
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      image: null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
  async getUserByEmail(email) {
    const user = await prisma.user.findFirst({
      where: { email },
    });
    if (!user) return null;
    return {
      id: user.id.toString(),
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      image: null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
  async updateUser(data) {
    const user = await prisma.user.update({
      where: { id: BigInt(data.id) },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.name && { name: data.name }),
        ...(data.emailVerified && { emailVerified: data.emailVerified }),
        updatedAt: new Date(),
      },
    });
    return {
      id: user.id.toString(),
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      image: null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
  async deleteUser(id) {
    await prisma.user.delete({
      where: { id: BigInt(id) },
    });
  },
  async linkAccount(data) {
    // 기존 User 모델의 accountId와 provider를 사용
    const user = await prisma.user.findUnique({
      where: { id: BigInt(data.userId) },
    });
    if (!user) throw new Error("User not found");
    
    // accountId와 provider 업데이트
    await prisma.user.update({
      where: { id: BigInt(data.userId) },
      data: {
        accountId: data.providerAccountId,
        provider: data.provider.toUpperCase() as any,
      },
    });
    return data;
  },
  async unlinkAccount(data) {
    // 구현 필요시 추가
    return;
  },
  async createSession(data) {
    // betterAuth는 세션을 쿠키로 관리하므로 별도 세션 테이블이 필요 없을 수 있음
    // 필요시 세션 테이블 추가 또는 메모리 기반 세션 사용
    return data;
  },
  async getSession(sessionToken) {
    // 세션 조회 로직
    return null;
  },
  async updateSession(data) {
    return data;
  },
  async deleteSession(sessionToken) {
    return;
  },
  async createVerificationToken(data) {
    await prisma.verificationToken.create({
      data: {
        userId: BigInt(data.userId),
        token: data.token,
        expires: data.expires,
      },
    });
    return data;
  },
  async useVerificationToken(data) {
    const token = await prisma.verificationToken.findUnique({
      where: {
        userId_token: {
          userId: BigInt(data.userId),
          token: data.token,
        },
      },
    });
    if (!token || token.expires < new Date()) {
      return null;
    }
    await prisma.verificationToken.delete({
      where: {
        userId_token: {
          userId: BigInt(data.userId),
          token: data.token,
        },
      },
    });
    return {
      userId: token.userId.toString(),
      token: token.token,
      expires: token.expires,
    };
  },
};

// betterAuth 인스턴스 생성
export const auth = betterAuth({
  database: customAdapter,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    kakao: kakao({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
    google: google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  },
  session: {
    expiresIn: 60 * 60 * 24, // 24시간
    updateAge: 60 * 60 * 24, // 24시간마다 업데이트
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ],
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
});

export type Session = typeof auth.$Infer.Session;

