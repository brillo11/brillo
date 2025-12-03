"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@repo/database";
import { ROLE } from "@repo/database";

/**
 * 테스트 계정 생성 (개발 환경에서만 사용)
 */
export async function createTestAccounts() {
  const password = "test1234";

  try {
    // 1. 관리자 계정 생성
    console.log("👤 관리자 계정 생성 중...");

    // 기존 계정이 있으면 삭제
    const existingAdminUser = await prisma.user.findUnique({
      where: { email: "admin.test@gmail.com" },
    });
    if (existingAdminUser) {
      await prisma.account.deleteMany({
        where: { userId: existingAdminUser.id },
      });
      await prisma.user.delete({
        where: { id: existingAdminUser.id },
      });
    }

    // Better Auth의 signUp API 사용
    // 스크립트에서는 headers()를 사용할 수 없으므로 빈 Headers 객체 사용
    let headersList: Headers;
    try {
      headersList = await headers();
    } catch {
      // 스크립트 환경에서는 빈 Headers 객체 사용
      headersList = new Headers();
    }

    const adminResult = await auth.api.signUpEmail({
      body: {
        email: "admin.test@gmail.com",
        password: password,
        name: "테스트 관리자",
      },
      headers: headersList,
    });

    if (adminResult instanceof Response) {
      const data = await adminResult.json();
      if (data.error) {
        throw new Error(`관리자 계정 생성 실패: ${data.error.message}`);
      }
    }

    // 역할 업데이트 및 Account 확인
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin.test@gmail.com" },
      include: { accounts: true },
    });
    if (adminUser) {
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { role: ROLE.ADMIN, nickname: "admin_test" },
      });

      // Account 확인 및 수정 (필요시)
      const credentialAccount = adminUser.accounts.find(
        (acc) =>
          acc.providerId.toLowerCase() === "credential" ||
          acc.providerId === "CREDENTIALS"
      );
      if (credentialAccount) {
        console.log("📋 관리자 Account 정보:", {
          accountId: credentialAccount.accountId,
          providerId: credentialAccount.providerId,
          hasPassword: !!credentialAccount.password,
        });

        // accountId를 email로 업데이트 (Better Auth가 email을 accountId로 사용할 수 있음)
        if (credentialAccount.accountId !== adminUser.email) {
          await prisma.account.update({
            where: { id: credentialAccount.id },
            data: { accountId: adminUser.email },
          });
          console.log(
            "✅ 관리자 Account accountId를 email로 업데이트:",
            adminUser.email
          );
        }
      }
    }

    console.log("✅ 관리자 계정 생성 완료:", adminUser?.id);

    // 2. 학생 계정 생성
    console.log("👤 학생 계정 생성 중...");

    // 기존 계정이 있으면 삭제
    const existingStudentUser = await prisma.user.findUnique({
      where: { email: "student.test@gmail.com" },
    });
    if (existingStudentUser) {
      await prisma.account.deleteMany({
        where: { userId: existingStudentUser.id },
      });
      await prisma.user.delete({
        where: { id: existingStudentUser.id },
      });
    }

    // Better Auth의 signUp API 사용
    const studentResult = await auth.api.signUpEmail({
      body: {
        email: "student.test@gmail.com",
        password: password,
        name: "테스트 학생",
      },
      headers: headersList, // 위에서 생성한 headersList 재사용
    });

    if (studentResult instanceof Response) {
      const data = await studentResult.json();
      if (data.error) {
        throw new Error(`학생 계정 생성 실패: ${data.error.message}`);
      }
    }

    // 역할 업데이트 및 Account 확인
    const studentUser = await prisma.user.findUnique({
      where: { email: "student.test@gmail.com" },
      include: { accounts: true },
    });
    if (studentUser) {
      await prisma.user.update({
        where: { id: studentUser.id },
        data: { role: ROLE.STUDENT, nickname: "student_test" },
      });

      // Account 확인 및 수정 (필요시)
      const credentialAccount = studentUser.accounts.find(
        (acc) =>
          acc.providerId.toLowerCase() === "credential" ||
          acc.providerId === "CREDENTIALS"
      );
      if (credentialAccount) {
        console.log("📋 학생 Account 정보:", {
          accountId: credentialAccount.accountId,
          providerId: credentialAccount.providerId,
          hasPassword: !!credentialAccount.password,
        });

        // accountId를 email로 업데이트 (Better Auth가 email을 accountId로 사용할 수 있음)
        if (credentialAccount.accountId !== studentUser.email) {
          await prisma.account.update({
            where: { id: credentialAccount.id },
            data: { accountId: studentUser.email },
          });
          console.log(
            "✅ 학생 Account accountId를 email로 업데이트:",
            studentUser.email
          );
        }
      }
    }

    console.log("✅ 학생 계정 생성 완료:", studentUser?.id);

    return {
      success: true,
      message: "테스트 계정이 생성되었습니다.",
      accounts: {
        admin: adminUser?.id,
        student: studentUser?.id,
      },
    };
  } catch (error: any) {
    console.error("테스트 계정 생성 실패:", error);
    throw new Error(
      `테스트 계정 생성 중 오류가 발생했습니다: ${error.message}`
    );
  }
}
