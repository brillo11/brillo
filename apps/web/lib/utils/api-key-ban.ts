/**
 * API 키 임시 밴 관리 유틸리티 (DB 기반)
 * API 키가 400/403 에러를 받으면 3시간 동안 사용 중지
 */

import { prisma } from "@repo/database";

/**
 * API 키 밴 상태 확인 및 시간 경과시 자동 해제
 * @param keyIdentifier API 키 식별자 (예: "key2")
 * @returns 밴 정보 (밴 상태면 정보 반환, 밴이 아니거나 만료되었으면 null)
 */
export async function isApiKeyBanned(keyIdentifier: string): Promise<{
  bannedUntil: Date;
  remainingMinutes: number;
  statusCode: number | null;
  errorMessage: string | null;
} | null> {
  const ban = await prisma.apiKeyBan.findUnique({
    where: { keyIdentifier },
  });

  if (!ban) return null;

  // 밴 시간이 지났으면 DB에서 삭제하고 null 반환
  if (new Date() > ban.bannedUntil) {
    await prisma.apiKeyBan.delete({
      where: { keyIdentifier },
    });
    return null;
  }

  const remainingMinutes = Math.ceil(
    (ban.bannedUntil.getTime() - Date.now()) / 1000 / 60
  );

  return {
    bannedUntil: ban.bannedUntil,
    remainingMinutes,
    statusCode: ban.statusCode,
    errorMessage: ban.errorMessage,
  };
}

/**
 * API 키를 임시 밴 처리
 * @param keyIdentifier API 키 식별자 (예: "key2")
 * @param durationHours 밴 지속 시간 (시간 단위, 기본 3시간)
 * @param statusCode 밴을 유발한 HTTP 상태 코드 (선택)
 * @param errorMessage 에러 메시지 (선택)
 */
export async function banApiKey(
  keyIdentifier: string,
  durationHours: number = 3,
  statusCode?: number,
  errorMessage?: string
): Promise<void> {
  const bannedUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000);

  await prisma.apiKeyBan.upsert({
    where: { keyIdentifier },
    update: {
      bannedUntil,
      statusCode: statusCode ?? null,
      errorMessage: errorMessage ?? null,
      updatedAt: new Date(),
    },
    create: {
      keyIdentifier,
      bannedUntil,
      statusCode: statusCode ?? null,
      errorMessage: errorMessage ?? null,
    },
  });

  console.warn(
    `🚫 API 키 밴 처리: ${keyIdentifier} (${durationHours}시간, 만료: ${bannedUntil.toISOString()})`
  );
}

/**
 * API 키 밴 해제 (수동)
 * @param keyIdentifier API 키 식별자 (예: "key2")
 */
export async function unbanApiKey(keyIdentifier: string): Promise<void> {
  await prisma.apiKeyBan.delete({
    where: { keyIdentifier },
  });
  console.log(`✅ API 키 밴 해제: ${keyIdentifier}`);
}

/**
 * API 키 에러가 밴 처리가 필요한 에러인지 확인
 * @param statusCode HTTP 상태 코드
 * @param errorCode API 에러 코드
 * @returns 밴 처리가 필요하면 true
 */
export function shouldBanApiKey(
  statusCode: number,
  errorCode?: number
): boolean {
  // 400 (Bad Request) - API key not valid
  // 403 (Forbidden) - Quota exceeded, API key disabled
  return (
    statusCode === 400 ||
    statusCode === 403 ||
    errorCode === 400 ||
    errorCode === 403
  );
}
