#!/usr/bin/env tsx

/**
 * 로컬에서 YouTube 인기 영상 크론 작업을 실행하는 스크립트
 *
 * 사용법:
 *   pnpm cron:youtube
 *   pnpm cron:youtube --region=US --count=100
 */

import { runYoutubePopularCron } from "../serverActions/youtube/youtube-cron-job";

const args = process.argv.slice(2);
let region = "KR";
let count = 200;

// 간단한 인자 파싱
for (const arg of args) {
  if (arg.startsWith("--region=")) {
    region = arg.split("=")[1] || "KR";
  } else if (arg.startsWith("--count=")) {
    count = parseInt(arg.split("=")[1] || "200", 10);
  }
}

async function main() {
  console.log(`[크론 시작] 지역: ${region}, 목표 개수: ${count}`);
  console.log("=".repeat(50));

  try {
    const result = await runYoutubePopularCron(region, count);

    console.log("=".repeat(50));
    console.log("[크론 완료]");
    console.log(`- 성공: ${result.success}`);
    console.log(`- 저장된 채널: ${result.channelsProcessed}개`);
    console.log(`- 고유 채널: ${result.uniqueChannels}개`);
    console.log(`- 분석한 영상: ${result.videosAnalyzed}개`);
    console.log(`- 지역: ${result.region}`);
  } catch (error: any) {
    console.error("=".repeat(50));
    console.error("[크론 실패]");
    console.error(error?.message || error);
    process.exit(1);
  }
}

main();
