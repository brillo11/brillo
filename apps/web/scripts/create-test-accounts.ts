import { createTestAccounts } from "../serverActions/auth/create-test-accounts.actions";

async function main() {
  console.log("🌱 테스트 계정 생성 시작...");

  try {
    const result = await createTestAccounts();

    if (result.success) {
      console.log("✅ 테스트 계정 생성 완료");
      console.log("📋 생성된 계정:");
      console.log("  🔑 관리자: admin.test@gmail.com / test1234");
      console.log("  👤 학생: student.test@gmail.com / test1234");
    } else {
      throw new Error(result.message || "계정 생성 실패");
    }
  } catch (error) {
    console.error("❌ 테스트 계정 생성 실패:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("🎉 계정 생성 프로세스 완료");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 계정 생성 프로세스 실패:", error);
    process.exit(1);
  });
