// @ts-nocheck - 버전 호환성 문제로 타입 검사 무시
"use server";

import { auth } from "@/lib/auth";
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
    const newAdmin = await prisma.user.create({
      data: {
        accountId: username,
        password: hashedPassword,
        name: "관리자",
        nickname: `관리자_${username}`,
        provider: "CREDENTIALS",
        role: "ADMIN",
        isNewUser: false
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
        provider: "CREDENTIALS",
        role: "ADMIN"
      }
    });

    if (!user) {
      return { success: false, message: "관리자 계정을 찾을 수 없습니다." };
    }

    // 비밀번호 검증 (bcrypt.compare 사용)
    const bcrypt = require("bcryptjs");
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
