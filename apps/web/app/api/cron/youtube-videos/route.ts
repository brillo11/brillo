import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { runYoutubeVideosCron } from "@/serverActions/youtube/youtube-videos-cron-job";
import { isApiKeyBanned } from "@/lib/utils/api-key-ban";

const CRON_NAME = "youtube-videos";
const BATCH_SIZE = 200;

// Vercel Cron Job 인증: Authorization Bearer 토큰
function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("Authorization");
  const expectedToken = process.env.CRON_SECRET || "";

  if (!authHeader || !expectedToken) {
    return false;
  }

  const token = authHeader.replace(/^Bearer\s+/i, "");
  return token === expectedToken;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // key2 밴 상태 확인
  const API_KEY_IDENTIFIER = "key2";
  const banInfo = await isApiKeyBanned(API_KEY_IDENTIFIER);
  if (banInfo) {
    console.log(
      `[YouTube Videos Cron] API Key 2 is temporarily banned. Remaining: ${banInfo.remainingMinutes} minutes. Skipping cron.`
    );

    // CronState 업데이트 (SKIPPED 상태)
    try {
      await prisma.cronState.update({
        where: { name: CRON_NAME },
        data: {
          lastRunStatus: "SKIPPED",
          lastRunAt: new Date(),
          lastRunError: `API Key 2 temporarily banned. Remaining: ${banInfo.remainingMinutes} minutes`,
        },
      });
    } catch (updateError) {
      console.error(
        "[YouTube Videos Cron] Failed to update skipped state:",
        updateError
      );
    }

    return NextResponse.json({
      success: false,
      message: "API Key 2 is temporarily banned",
      skipped: true,
      banInfo: {
        bannedUntil: banInfo.bannedUntil.toISOString(),
        remainingMinutes: banInfo.remainingMinutes,
        statusCode: banInfo.statusCode,
        errorMessage: banInfo.errorMessage,
      },
    });
  }

  try {
    // 1. CronState 조회 또는 생성
    let cronState = await prisma.cronState.findUnique({
      where: { name: CRON_NAME },
    });

    if (!cronState) {
      cronState = await prisma.cronState.create({
        data: {
          name: CRON_NAME,
          currentOffset: 0,
          batchSize: BATCH_SIZE,
          totalProcessed: 0,
          lastRunStatus: "RUNNING",
        },
      });
    } else {
      // 실행 중 상태로 업데이트
      await prisma.cronState.update({
        where: { name: CRON_NAME },
        data: {
          lastRunStatus: "RUNNING",
          lastRunAt: new Date(),
          lastRunError: null,
        },
      });
    }

    const region = req.nextUrl.searchParams.get("region") || undefined;
    const currentOffset = cronState.currentOffset;

    // 2. 오늘 크롤링이 필요한 채널 확인 (24시간 이내 크롤링 제외)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const totalChannels = await prisma.youtubeChannel.count({
      where: {
        ...(region ? { regionCode: region } : {}),
        OR: [
          { lastCrawledAt: null },
          { lastCrawledAt: { lt: twentyFourHoursAgo } },
        ],
      },
    });

    // 모든 채널이 24시간 이내에 크롤링되었으면 종료
    if (totalChannels === 0) {
      console.log(
        `[YouTube Videos Cron] All channels crawled within last 24 hours. Skipping.`
      );

      await prisma.cronState.update({
        where: { name: CRON_NAME },
        data: {
          lastRunStatus: "SKIPPED",
          lastRunAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "All channels already crawled today",
        channelsProcessed: 0,
        skipped: true,
      });
    }

    // offset이 전체 필요한 채널 수를 초과하면 리셋
    const adjustedOffset = currentOffset >= totalChannels ? 0 : currentOffset;

    console.log(
      `[YouTube Videos Cron] Starting batch: offset=${adjustedOffset}, batchSize=${BATCH_SIZE}, totalNeeded=${totalChannels}`
    );

    // 3. 현재 offset으로 크롤링 실행
    const result = await runYoutubeVideosCron(
      undefined, // maxChannels
      region,
      adjustedOffset,
      BATCH_SIZE
    );

    // 4. 다음 offset 계산
    const nextOffset =
      adjustedOffset + BATCH_SIZE >= totalChannels
        ? 0
        : adjustedOffset + BATCH_SIZE;

    const isFullCycleComplete = nextOffset === 0 && adjustedOffset > 0;

    // 5. CronState 업데이트
    await prisma.cronState.update({
      where: { name: CRON_NAME },
      data: {
        currentOffset: nextOffset,
        totalProcessed:
          cronState.totalProcessed + (result.channelsProcessed || 0),
        lastRunStatus: "SUCCESS",
        lastRunAt: new Date(),
      },
    });

    console.log(
      `[YouTube Videos Cron] Completed: offset=${adjustedOffset}-${adjustedOffset + BATCH_SIZE - 1}, nextOffset=${nextOffset}${isFullCycleComplete ? " (Cycle Complete)" : ""}`
    );

    return NextResponse.json({
      ...result,
      cronInfo: {
        currentBatch: `${adjustedOffset}-${adjustedOffset + BATCH_SIZE - 1}`,
        nextOffset,
        totalChannelsNeedingCrawl: totalChannels,
        isFullCycleComplete,
        totalProcessed:
          cronState.totalProcessed + (result.channelsProcessed || 0),
        note: isFullCycleComplete
          ? "Full cycle complete. Next run will check for channels needing crawl."
          : undefined,
      },
    });
  } catch (e: any) {
    console.error("[YouTube Videos Cron] Error:", e);

    // 에러 상태 저장
    try {
      await prisma.cronState.update({
        where: { name: CRON_NAME },
        data: {
          lastRunStatus: "FAILED",
          lastRunError: e?.message || "Unknown error",
          lastRunAt: new Date(),
        },
      });
    } catch (updateError) {
      console.error(
        "[YouTube Videos Cron] Failed to update error state:",
        updateError
      );
    }

    return NextResponse.json(
      { success: false, error: e?.message || "cron failed" },
      { status: 500 }
    );
  }
}
