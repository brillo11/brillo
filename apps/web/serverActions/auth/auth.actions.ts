"use server";

import { auth } from "@/shared/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@repo/database";

export async function isAdmin() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  const user = session?.user as any;
  return user?.role === "ADMIN";
}

/**
 * 닉네임 유효성 검사 함수
 * @param nickname - 검사할 닉네임
 * @throws 유효하지 않은 경우 에러 발생
 */
function validateNickname(nickname: string): void {
  if (!nickname || nickname.trim().length < 2) {
    throw new Error("닉네임은 최소 2자 이상이어야 합니다.");
  }

  if (nickname.trim().length > 10) {
    throw new Error("닉네임은 최대 10자까지 가능합니다.");
  }

  if (!/^[가-힣a-zA-Z0-9]+$/.test(nickname)) {
    throw new Error("닉네임은 한글, 영문, 숫자만 사용 가능합니다.");
  }
}

/**
 * 닉네임 중복 검사 함수
 * @param nickname - 검사할 닉네임
 * @returns 중복 여부 (true: 중복됨, false: 사용 가능)
 */
export async function checkNicknameDuplication(
  nickname: string
): Promise<boolean> {
  // 닉네임 유효성 검사
  validateNickname(nickname);

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        nickname: nickname
      }
    });

    return !!existingUser; // 이미 존재하면 true, 없으면 false 반환
  } catch (error) {
    console.error("닉네임 중복 검사 중 오류 발생:", error);
    throw new Error("닉네임 중복 검사 중 오류가 발생했습니다.");
  }
}

/**
 * 닉네임 변경 함수
 * @param newNickname - 변경할 새 닉네임
 * @returns 변경된 사용자 정보
 */
export async function changeNickname(newNickname: string) {
  // 현재 로그인된 사용자 정보 가져오기
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  // 닉네임 유효성 검사
  validateNickname(newNickname);

  // 닉네임 중복 검사
  const isDuplicate = await checkNicknameDuplication(newNickname);
  if (isDuplicate) {
    throw new Error("이미 사용 중인 닉네임입니다.");
  }

  try {
    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: BigInt(session.user.id) },
      data: {
        nickname: newNickname,
        isNewUser: false
      }
    });
    return updatedUser;
  } catch (error) {
    console.error("닉네임 변경 중 오류 발생:", error);
    throw new Error("닉네임 변경 중 오류가 발생했습니다.");
  }
}

/**
 * 회원 정보 업데이트 함수
 * @param userData - 업데이트할 사용자 정보
 * @returns 업데이트된 사용자 정보
 */
export async function updateUserProfile(userData: {
  nickname?: string;
  name?: string;
  image?: string;
  bio?: string;
}) {
  // 현재 로그인된 사용자 정보 가져오기
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  // 닉네임이 제공된 경우 유효성 검사
  if (userData.nickname) {
    // 닉네임 유효성 검사
    validateNickname(userData.nickname);

    // 닉네임 중복 검사
    const user = session.user as any;
    const isDuplicate = await checkNicknameDuplication(userData.nickname);
    if (isDuplicate && userData.nickname !== user.nickname) {
      throw new Error("이미 사용 중인 닉네임입니다.");
    }
  }

  try {
    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: {
        id: BigInt(session.user.id)
      },
      data: {
        ...userData
      }
    });
    return updatedUser;
  } catch (error) {
    console.error("회원 정보 업데이트 중 오류 발생:", error);
    throw new Error("회원 정보 업데이트 중 오류가 발생했습니다.");
  }
}

/**
 * 사용자 ID 기반으로 회원 정보를 조회하는 함수
 * @param userId - 조회할 사용자 ID
 * @returns 사용자 정보 객체
 */
export async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: BigInt(userId)
      },
      select: {
        id: true,
        name: true,
        nickname: true,
        isNewUser: true
      }
    });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    return {
      ...user,
      id: user.id.toString() // BigInt를 문자열로 변환
    };
  } catch (error) {
    console.error("사용자 정보 조회 중 오류 발생:", error);
    throw new Error("사용자 정보를 불러오는 중 오류가 발생했습니다.");
  }
}

/**
 * 현재 로그인한 사용자의 정보를 ID 기반으로 조회하는 함수
 * @returns 현재 로그인한 사용자 정보
 */
export async function getCurrentUserProfile() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  return getUserProfile(session.user.id);
}
