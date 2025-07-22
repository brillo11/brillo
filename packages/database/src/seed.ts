import { prisma } from "./client";
import { ROLE, PROVIDER } from "../generated/client";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 시드 데이터 생성 시작...");

  try {
    // 관리자 계정 생성
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
      where: {
        accountId_provider: {
          accountId: "admin",
          provider: PROVIDER.CREDENTIALS,
        },
      },
      update: {},
      create: {
        accountId: "admin",
        nickname: "관리자",
        name: "관리자",
        email: "admin@example.com",
        password: adminPassword,
        role: ROLE.ADMIN,
        provider: PROVIDER.CREDENTIALS,
        isNewUser: false,
      },
    });

    // 테스트 사용자 생성
    const userPassword = await bcrypt.hash("user123", 10);
    const user = await prisma.user.upsert({
      where: {
        accountId_provider: {
          accountId: "user",
          provider: PROVIDER.CREDENTIALS,
        },
      },
      update: {},
      create: {
        accountId: "user",
        nickname: "테스트사용자",
        name: "테스트 사용자",
        email: "user@example.com",
        password: userPassword,
        role: ROLE.USER,
        provider: PROVIDER.CREDENTIALS,
        isNewUser: false,
      },
    });

    // 게시판 생성
    const noticeBoard = await prisma.board.upsert({
      where: { slug: "notice" },
      update: {},
      create: {
        title: "공지사항",
        slug: "notice",
      },
    });

    const freeBoard = await prisma.board.upsert({
      where: { slug: "free" },
      update: {},
      create: {
        title: "자유게시판",
        slug: "free",
      },
    });

    // 샘플 게시글 생성
    await prisma.post.upsert({
      where: { slug: "welcome-notice" },
      update: {},
      create: {
        title: "사이트 오픈을 알려드립니다",
        content:
          "안녕하세요! 새로운 사이트가 오픈되었습니다.\n\n이곳에서 다양한 정보를 공유하고 소통해보세요!",
        slug: "welcome-notice",
        authorId: admin.id,
        boardId: noticeBoard.id,
        tags: ["공지", "오픈"],
      },
    });

    await prisma.post.upsert({
      where: { slug: "hello-world" },
      update: {},
      create: {
        title: "안녕하세요!",
        content: "첫 번째 게시글입니다.\n\n자유롭게 이용해주세요!",
        slug: "hello-world",
        authorId: user.id,
        boardId: freeBoard.id,
        tags: ["인사", "첫글"],
      },
    });

    console.log("✅ 시드 데이터 생성 완료");
    console.log("📋 생성된 계정:");
    console.log("  🔑 관리자: admin / admin123");
    console.log("  👤 사용자: user / user123");
    console.log("📝 생성된 게시판: 공지사항, 자유게시판");
  } catch (error) {
    console.error("❌ 시드 데이터 생성 실패:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log("🎉 시드 프로세스 완료");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 시드 프로세스 실패:", error);
    process.exit(1);
  });
