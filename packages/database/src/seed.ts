import { prisma } from "./client";
import { ROLE, PROVIDER } from "../generated/client/client";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 시드 데이터 생성 시작...");
  console.log("📡 데이터베이스 연결 확인 중...");

  try {
    // 데이터베이스 연결 테스트
    await prisma.$connect();
    console.log("✅ 데이터베이스 연결 성공");

    // 관리자 계정 생성 (admin/admin)
    console.log("👤 관리자 계정 생성 중...");
    const adminPassword = await bcrypt.hash("admin", 10);
    console.log("🔐 비밀번호 해시 완료");

    // User 생성 또는 조회
    console.log("📝 User 생성/조회 중...");
    const adminUser = await prisma.user.upsert({
      where: {
        email: "admin@admin.com",
      },
      update: {
        name: "관리자",
        role: ROLE.ADMIN,
      },
      create: {
        email: "admin@admin.com",
        name: "관리자",
        role: ROLE.ADMIN,
      },
    });

    // Account 생성 또는 업데이트
    // 기존 Account가 있으면 삭제 후 재생성
    await prisma.account.deleteMany({
      where: {
        accountId: "admin",
        providerId: PROVIDER.CREDENTIALS,
      },
    });

    console.log("✅ User 생성 완료:", adminUser.id);

    console.log("🔑 Account 생성 중...");
    const adminAccount = await prisma.account.create({
      data: {
        userId: adminUser.id,
        accountId: "admin",
        providerId: PROVIDER.CREDENTIALS,
        password: adminPassword,
      },
    });
    console.log("✅ Account 생성 완료:", adminAccount.id);

    const admin = adminUser;

    // 테스트 사용자 생성
    const userPassword = await bcrypt.hash("user123", 10);

    // User 생성 또는 조회
    const testUser = await prisma.user.upsert({
      where: {
        email: "user@example.com",
      },
      update: {},
      create: {
        email: "user@example.com",
        name: "테스트 사용자",
        role: ROLE.STUDENT,
      },
    });

    // Account 생성 또는 업데이트
    // 기존 Account가 있으면 삭제 후 재생성
    await prisma.account.deleteMany({
      where: {
        accountId: "user",
        providerId: PROVIDER.CREDENTIALS,
      },
    });

    await prisma.account.create({
      data: {
        userId: testUser.id,
        accountId: "user",
        providerId: PROVIDER.CREDENTIALS,
        password: userPassword,
      },
    });

    const user = testUser;

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

    // 샘플 제품 생성
    const products = [
      {
        name: "프리미엄 헤드폰",
        description:
          "고음질 무선 헤드폰으로 뛰어난 음질을 제공합니다. 노이즈 캔슬링 기능이 포함되어 있어 어디서나 완벽한 사운드를 즐길 수 있습니다.",
        price: 129000,
        originalPrice: 159000,
        category: "전자제품",
        inStock: true,
        featured: true,
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop",
        ],
        tags: ["인기상품", "무선", "노이즈캔슬링"],
        specifications: {
          연결방식: "블루투스 5.0",
          배터리: "최대 30시간",
          충전시간: "2시간",
          무게: "250g",
        },
      },
      {
        name: "스마트 워치",
        description:
          "건강 관리와 스마트 기능을 동시에 제공하는 차세대 스마트 워치입니다. 심박수, 수면, 운동량을 자동으로 추적합니다.",
        price: 189000,
        originalPrice: 229000,
        category: "웨어러블",
        inStock: true,
        featured: true,
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop",
        ],
        tags: ["건강", "스마트", "운동"],
        specifications: {
          디스플레이: "1.4인치 AMOLED",
          배터리: "최대 7일",
          방수등급: "5ATM",
          센서: "심박수, 가속도, 자이로스코프",
        },
      },
      {
        name: "무선 충전 패드",
        description:
          "편리한 무선 충전을 위한 고속 충전 패드입니다. Qi 호환 기기를 올려놓기만 하면 자동으로 충전이 시작됩니다.",
        price: 45000,
        originalPrice: null,
        category: "액세서리",
        inStock: true,
        featured: false,
        images: [
          "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop",
        ],
        tags: ["편리함", "무선충전", "Qi"],
        specifications: {
          충전속도: "최대 15W",
          호환성: "Qi 호환 기기",
          크기: "10 x 10 x 1.5cm",
          재질: "알루미늄",
        },
      },
      {
        name: "노트북 스탠드",
        description:
          "인체공학적 디자인으로 설계된 알루미늄 노트북 스탠드입니다. 목과 어깨의 피로를 줄여주고 작업 효율성을 높입니다.",
        price: 35000,
        originalPrice: 45000,
        category: "사무용품",
        inStock: false,
        featured: false,
        images: [
          "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
        ],
        tags: ["인체공학", "알루미늄", "사무실"],
        specifications: {
          재질: "알루미늄 합금",
          호환성: "11-17인치 노트북",
          각도조절: "0-20도",
          최대하중: "5kg",
        },
      },
      {
        name: "블루투스 스피커",
        description:
          "컴팩트한 크기에서 나오는 놀라운 사운드! 방수 기능으로 어디서든 음악을 즐길 수 있는 휴대용 블루투스 스피커입니다.",
        price: 79000,
        originalPrice: null,
        category: "전자제품",
        inStock: true,
        featured: false,
        images: [
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
        ],
        tags: ["휴대용", "방수", "컴팩트"],
        specifications: {
          출력: "10W x 2",
          배터리: "최대 12시간",
          방수등급: "IPX7",
          연결: "블루투스 5.0",
        },
      },
    ];

    for (const productData of products) {
      await prisma.product.create({
        data: productData,
      });
    }

    console.log("✅ 시드 데이터 생성 완료");
    console.log("📋 생성된 계정:");
    console.log("  🔑 관리자: admin / admin");
    console.log("  👤 사용자: user / user123");
    console.log("📝 생성된 게시판: 공지사항, 자유게시판");
    console.log("🛒 생성된 제품: 5개 샘플 제품");
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
