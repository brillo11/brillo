/**
 * 크론 작업 밴 관리 유틸리티 (CronState 기반)
 * API 키가 400/403 에러를 받으면 3시간 동안 크론 중지
 */

import { prisma } from "@repo/database";

const BAN_DURATION_HOURS = 3;

/**
 * 크론 작업이 밴 상태인지 확인 및 시간 경과시 자동 해제
 * @param cronName 크론 작업 이름 (예: "youtube-videos")
 * @returns 밴 정보 (밴 상태면 정보 반환, 밴이 아니거나 만료되었으면 null)
 */
export async function isCronBanned(cronName: string): Promise<{
  bannedUntil: Date;
  remainingMinutes: number;
} | null> {
  const cronState = await prisma.cronState.findUnique({
    where: { name: cronName },
  });

  if (!cronState || !cronState.lastBanned) return null;

  const bannedUntil = new Date(
    cronState.lastBanned.getTime() + BAN_DURATION_HOURS * 60 * 60 * 1000
  );

  console.log("bannedUntil", bannedUntil);
  console.log("new Date()", new Date());
  console.log("new Date() > bannedUntil", new Date() > bannedUntil);

  // 밴 시간이 지났으면 해제하고 null 반환
  if (new Date() > bannedUntil) {
    await prisma.cronState.update({
      where: { name: cronName },
      data: { lastBanned: null },
    });
    return null;
  }

  const remainingMinutes = Math.ceil(
    (bannedUntil.getTime() - Date.now()) / 1000 / 60
  );

  return {
    bannedUntil,
    remainingMinutes,
  };
}

/**
 * 크론 작업을 임시 밴 처리
 * @param cronName 크론 작업 이름 (예: "youtube-videos")
 */
export async function banCron(cronName: string): Promise<void> {
  await prisma.cronState.upsert({
    where: { name: cronName },
    update: {
      lastBanned: new Date(),
    },
    create: {
      name: cronName,
      lastBanned: new Date(),
      currentOffset: 0,
      batchSize: 200,
      totalProcessed: 0,
    },
  });

  const bannedUntil = new Date(
    Date.now() + BAN_DURATION_HOURS * 60 * 60 * 1000
  );

  console.warn(
    `🚫 크론 작업 밴 처리: ${cronName} (${BAN_DURATION_HOURS}시간, 만료: ${bannedUntil.toISOString()})`
  );
}
