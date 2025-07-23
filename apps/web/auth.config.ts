import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { DefaultSession, User } from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@repo/database";
// import { clearUserSession } from "@/serverActions/session/session.actions";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      provider?: string;
      nickname?: string;
      accountId?: string;
      role?: string;
      enrolledCourseIds?: string[];
    } & DefaultSession["user"];
  }

  interface User {
    nickname?: string;
    accountId?: string;
    role?: string;
    enrollments?: any[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: string;
    nickname?: string;
    enrolledCourseIds?: string[];
  }
}

// 카카오 로그인 처리 함수
async function handleKakaoSignIn(user: User, profile: any) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        accountId_provider: {
          accountId: profile?.id?.toString() || "",
          provider: "KAKAO",
        },
      },
    });

    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          accountId: profile?.id?.toString() || "",
          name: user.name || "",
          nickname: `${user.name || "user"}_${Date.now()}`,
          provider: "KAKAO",
          isNewUser: true,
        },
      });
      user.id = newUser.id.toString();
      user.nickname = newUser.nickname;
      return true;
    }

    user.id = existingUser.id.toString();
    user.nickname = existingUser.nickname;
    return true;
  } catch (error) {
    console.error("Error during Kakao sign in:", error);
    return false;
  }
}

// 구글 로그인 처리 함수
async function handleGoogleSignIn(user: User, profile: any) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        accountId_provider: {
          accountId: profile?.sub?.toString() || "",
          provider: "GOOGLE",
        },
      },
    });
    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          accountId: profile?.sub?.toString() || "",
          name: user.name || "",
          nickname: `${user.name || "user"}_${Date.now()}`,
          provider: "GOOGLE",
          isNewUser: true,
        },
      });
      user.id = newUser.id.toString();
      user.nickname = newUser.nickname;
      return true;
    }

    user.id = existingUser.id.toString();
    user.nickname = existingUser.nickname;
    return true;
  } catch (error) {
    console.error("Error during Google sign in:", error);
    return false;
  }
}

export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24시간
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24시간
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? `__Secure-next-auth.session-token`
          : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "아이디", type: "text" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        try {
          // 입력값 검증
          if (!credentials?.username || !credentials?.password) {
            console.log("🚫 Missing credentials");
            return null;
          }

          if (
            typeof credentials.password !== "string" ||
            typeof credentials.username !== "string"
          ) {
            console.log("🚫 Invalid credential types");
            return null;
          }

          console.log(`🔍 Attempting login for: ${credentials.username}`);

          // 사용자 조회
          const user = await prisma.user.findUnique({
            where: {
              accountId_provider: {
                accountId: credentials.username,
                provider: "CREDENTIALS",
              },
            },
          });

          if (!user) {
            console.log(`🚫 User not found: ${credentials.username}`);
            return null;
          }

          // 관리자 권한 체크
          if (user.role !== "ADMIN") {
            console.log(
              `🚫 Non-admin user attempted login: ${credentials.username} (role: ${user.role})`
            );
            return null;
          }

          // 비밀번호 검증
          const bcrypt = require("bcryptjs");
          const valid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!valid) {
            console.log(`🚫 Invalid password for: ${credentials.username}`);
            return null;
          }

          console.log(`✅ Admin login successful: ${credentials.username}`);

          return {
            id: user.id.toString(),
            name: user.name,
            nickname: user.nickname,
            accountId: user.accountId,
            provider: user.provider,
            role: user.role,
          };
        } catch (error) {
          console.error("🚨 NextAuth authorize error:", error);
          return null;
        }
      },
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
      issuer: "https://kauth.kakao.com",
      token: "https://kauth.kakao.com/oauth/token",
      userinfo: "https://kapi.kakao.com/v2/user/me",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  // events: {
  //   async signOut() {
  //     // 로그아웃 시 UserSession 정리
  //     try {
  //       await clearUserSession();
  //     } catch (error) {
  //       console.error("로그아웃 시 세션 정리 오류:", error);
  //     }
  //   },
  // },
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log(`🔄 NextAuth redirect: ${url} (base: ${baseUrl})`);

      // 관리자 로그인 성공 시 관리자 대시보드로
      if (url.includes("/admin") || url === "/admin") {
        console.log("🎯 Redirecting to admin dashboard");
        return `${baseUrl}/admin`;
      }

      // callbackUrl이 있으면 그곳으로, 없으면 홈으로
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      console.log("🏠 Redirecting to home");
      return baseUrl;
    },
    async signIn({ user, account, profile }) {
      if (!account?.provider) {
        return false;
      }

      switch (account.provider) {
        case "kakao":
          return handleKakaoSignIn(user, profile);
        case "google":
          return handleGoogleSignIn(user, profile);
        case "credentials":
          return true;
        default:
          return false;
      }
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.sub as string;
        session.user.provider = token.provider as string;
        session.user.nickname = token.nickname as string;
        session.user.accountId = token.accountId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user, account, profile, trigger, session }) {
      if (account && profile) {
        token.provider = account.provider;

        if (account.provider === "kakao") {
          token.accountId = profile.id?.toString();
        }
      }

      if (user) {
        if (user.nickname) token.nickname = user.nickname;
        if (user.accountId) token.accountId = user.accountId;
        if (user.role) token.role = user.role;
      }

      if (trigger === "update" && session) {
        Object.assign(token, session.user);
      }
      return token;
    },
  },
};
