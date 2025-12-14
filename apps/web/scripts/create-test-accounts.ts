import { PrismaClient } from "../../../packages/database/generated/client/index.js";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// Prisma 클라이언트 초기화
const prisma = new PrismaClient();

// Better Auth 초기화 (스크립트용 간소화 버전)
const auth = betterAuth({
  database: prismaAdapter(prisma as any, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
});

async function createTestUsers() {
  console.log("🚀 Creating test users with Better Auth...");

  const users = [
    {
      email: "student.test@gmail.com",
      password: "test1234",
      name: "Test Student",
      nickname: "student_test",
      role: "STUDENT" as const,
      status: "ACTIVE" as const,
    },
    {
      email: "admin.test@gmail.com",
      password: "test1234",
      name: "Test Admin",
      nickname: "admin_test",
      role: "ADMIN" as const,
      status: "ACTIVE" as const,
    },
  ];

  for (const userData of users) {
    try {
      // 이미 존재하는지 확인
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
        include: {
          accounts: true,
          sessions: true,
        },
      });

      if (existingUser) {
        console.log(
          `⚠️  User ${userData.email} already exists, recreating with Better Auth...`
        );

        // 관련된 모든 데이터 삭제 (cascade로 account, session도 함께 삭제됨)
        // 순서: sessions → accounts → user
        if (existingUser.sessions.length > 0) {
          await prisma.session.deleteMany({
            where: { userId: existingUser.id },
          });
        }

        if (existingUser.accounts.length > 0) {
          await prisma.account.deleteMany({
            where: { userId: existingUser.id },
          });
        }

        await prisma.user.delete({
          where: { id: existingUser.id },
        });

        console.log(`🗑️  Deleted existing user and related data`);
      }

      console.log(`📝 Creating user with Better Auth: ${userData.email}...`);

      // Better Auth의 signUpEmail API 사용
      const signUpResult = await auth.api.signUpEmail({
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
        },
      });

      if (!signUpResult || "error" in signUpResult) {
        throw new Error("Better Auth signup failed");
      }

      // 생성된 사용자 가져오기
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (!user) {
        throw new Error("User created but not found in database");
      }

      // role, status, nickname, emailVerified 업데이트 (Better Auth가 기본 지원하지 않는 필드)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: userData.role,
          status: userData.status,
          nickname: userData.nickname,
          emailVerified: true, // 테스트 계정이므로 이메일 인증 완료로 설정
        },
      });

      console.log(
        `✅ Created user with Better Auth: ${userData.email} (${userData.role})`
      );
    } catch (error: any) {
      console.error(`❌ Failed to process user ${userData.email}:`, error);
      console.error("Error details:", error.message);
    }
  }

  console.log("✨ Done!");
}

createTestUsers()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
