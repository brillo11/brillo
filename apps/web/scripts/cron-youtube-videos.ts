#!/usr/bin/env tsx

/**
 * 로컬에서 YouTube 영상 크론 작업을 실행하는 스크립트
 *
 * 사용법:
 *   pnpm cron:youtube:videos
 *   pnpm cron:youtube:videos --region=KR --maxChannels=30
 */

import { runYoutubeVideosCron } from "../serverActions/youtube/youtube-videos-cron-job";

const args = process.argv.slice(2);
let region: string | undefined = undefined;
let maxChannels = 50;

// 간단한 인자 파싱
for (const arg of args) {
  if (arg.startsWith("--region=")) {
    region = arg.split("=")[1] || undefined;
  } else if (arg.startsWith("--maxChannels=")) {
    maxChannels = parseInt(arg.split("=")[1] || "50", 10);
  }
}

async function main() {
  console.log(
    `[크론 시작] 지역: ${region || "전체"}, 최대 채널 수: ${maxChannels}`
  );
  console.log("=".repeat(50));

  try {
    const result = await runYoutubeVideosCron(maxChannels, region);

    console.log("=".repeat(50));
    console.log("[크론 완료]");
    console.log(`- 성공: ${result.success}`);
    console.log(
      `- 처리한 채널: ${result.channelsProcessed}개 / ${result.totalChannels}개`
    );
    console.log(`- 조회한 영상: ${result.videosProcessed}개`);
    console.log(`- 저장한 영상: ${result.videosSaved}개`);
    console.log(`- 지역: ${result.regionCode}`);
  } catch (error: any) {
    console.error("=".repeat(50));
    console.error("[크론 실패]");
    console.error(error?.message || error);
    process.exit(1);
  }
}

main();
