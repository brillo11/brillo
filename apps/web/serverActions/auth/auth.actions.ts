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
  nickname: string,
): Promise<boolean> {
  // 닉네임 유효성 검사
  validateNickname(nickname);

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        nickname: nickname,
      },
    });

    return !!existingUser; // 이미 존재하면 true, 없으면 false 반환
  } catch (error) {
    console.error("닉네임 중복 검사 중 오류 발생:", error);
    throw new Error("닉네임 중복 검사 중 오류가 발생했습니다.");
  }
}
