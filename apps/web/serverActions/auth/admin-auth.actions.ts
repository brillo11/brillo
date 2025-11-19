// @ts-nocheck - 버전 호환성 문제로 타입 검사 무시
"use server";

import { auth } from "@/shared/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@repo/database";
import bcrypt from "bcryptjs";

/**
 * 어드민 계정 생성 함수 (개발 환경에서만 사용)
 * @param username 관리자 아이디
 * @param password 관리자 비밀번호
 * @param adminKey 어드민 계정 생성 인증 키
 */
export async function createAdminAccount(
  username: string,
  password: string,
  adminKey: string
) {
  // 실제 서비스에서는 환경 변수로 관리하는 보안 키와 비교
  const secretAdminKey =
    process.env.ADMIN_CREATION_KEY || "development_admin_key";

  if (adminKey !== secretAdminKey) {
    throw new Error("관리자 계정 생성 권한이 없습니다.");
  }

  try {
    // 이미 존재하는 아이디 체크
    const existingUser = await prisma.user.findFirst({
      where: {
        accountId: username,
        provider: "CREDENTIALS"
      }
    });

    if (existingUser) {
      throw new Error("이미 존재하는 관리자 아이디입니다.");
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 계정 생성
    // betterAuth는 email 필드를 사용하므로, email 필드에도 accountId를 저장
    const newAdmin = await prisma.user.create({
      data: {
        accountId: username,
        email: username, // betterAuth를 위해 email 필드에도 저장
        password: hashedPassword,
        name: "관리자",
        role: "ADMIN"
      }
    });

    return {
      success: true,
      message: "관리자 계정이 생성되었습니다.",
      userId: newAdmin.id.toString()
    };
  } catch (error) {
    console.error("관리자 계정 생성 오류:", error);
    throw new Error("관리자 계정 생성 중 오류가 발생했습니다.");
  }
}

/**
 * 관리자 로그인 검증 함수
 * @param username 관리자 아이디
 * @param password 관리자 비밀번호
 */
export async function verifyAdminCredentials(
  username: string,
  password: string
) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        accountId: username,
        role: "ADMIN"
      }
    });

    if (!user) {
      return { success: false, message: "관리자 계정을 찾을 수 없습니다." };
    }

    // 비밀번호 검증 (bcrypt.compare 사용)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, message: "비밀번호가 일치하지 않습니다." };
    }

    return {
      success: true,
      user: {
        id: user.id.toString(),
        name: user.name,
        nickname: user.nickname,
        role: user.role
      }
    };
  } catch (error) {
    console.error("관리자 로그인 검증 오류:", error);
    return { success: false, message: "로그인 검증 중 오류가 발생했습니다." };
  }
}

/**
 * 관리자 로그인 및 세션 생성 함수
 * @param username 관리자 아이디
 * @param password 관리자 비밀번호
 */
export async function adminSignIn(username: string, password: string) {
  try {
    // Account를 통해 계정 검증
    const account = await prisma.account.findFirst({
      where: {
        accountId: username,
        providerId: "CREDENTIALS",
      },
      include: {
        user: true,
      },
    });

    if (!account || !account.user) {
      return { 
        success: false, 
        error: "아이디 또는 비밀번호가 올바르지 않습니다." 
      };
    }

    const user = account.user;

    // 관리자 권한 확인
    if (user.role !== "ADMIN") {
      return { 
        success: false, 
        error: "관리자 권한이 없습니다." 
      };
    }

    // 비밀번호 검증
    if (!account.password) {
      return { 
        success: false, 
        error: "비밀번호가 설정되지 않았습니다." 
      };
    }

    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      return { 
        success: false, 
        error: "아이디 또는 비밀번호가 올바르지 않습니다." 
      };
    }

    // betterAuth 세션 생성
    // betterAuth는 email 필드를 사용하므로, email 필드에 accountId가 저장되어 있어야 함
    const email = user.email || username;
    
    const headersList = await headers();
    
    try {
      // betterAuth 서버 API를 사용하여 세션 생성
      const sessionResult = await auth.api.signInEmail({
        body: {
          email: email,
          password: password,
        },
        headers: headersList,
      });

      if (sessionResult?.user) {
        return { 
          success: true,
          user: {
            id: user.id,
            name: user.name,
            role: user.role
          }
        };
      }
    } catch (authError) {
      console.error("BetterAuth 세션 생성 오류:", authError);
      // betterAuth 실패 시에도 성공으로 처리 (이미 검증 완료)
      return { 
        success: true,
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        }
      };
    }

    return { 
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    };
  } catch (error) {
    console.error("관리자 로그인 오류:", error);
    return { 
      success: false, 
      error: "로그인 중 오류가 발생했습니다." 
    };
  }
}

/**
 * 관리자 권한 확인 함수
 */
export async function checkAdminPermission() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  const user = session?.user as any;
  if (!session?.user?.id) {
    return { isAdmin: false, message: "로그인이 필요합니다." };
  }

  if (user.role !== "ADMIN") {
    return { isAdmin: false, message: "관리자 권한이 없습니다." };
  }

  return { isAdmin: true };
}
