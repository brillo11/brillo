"use server";

import { prisma } from "@repo/database";

// Fetch most popular videos with pagination up to targetCount
async function fetchMostPopular(regionCode: string, targetCount: number) {
  const apiKey = process.env.YOUTUBE_DATA_API_KEY!;
  const collected: any[] = [];
  let pageToken: string | undefined = undefined;

  while (collected.length < targetCount) {
    const params = new URLSearchParams({
      part: "snippet",
      chart: "mostPopular",
      regionCode,
      maxResults: "50",
      key: apiKey,
    });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`
    );
    if (!res.ok) break;
    const data = await res.json();
    collected.push(...(data.items || []));
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }

  return collected.slice(0, targetCount);
}

export async function runYoutubePopularCron(
  region: string = "KR",
  targetCount: number = 200
) {
  try {
    const apiKey = process.env.YOUTUBE_DATA_API_KEY;
    if (!apiKey) {
      throw new Error("YOUTUBE_DATA_API_KEY is not set");
    }

    const regionCode = region.toUpperCase();
    const safeCount = Math.min(Math.max(targetCount, 1), 200);

    // 1. 인기 영상 200개 가져오기
    const items = await fetchMostPopular(regionCode, safeCount);

    // 2. 채널 ID 추출 (중복 제거)
    const channelIdSet = new Set<string>();
    for (const it of items) {
      const chId = it?.snippet?.channelId;
      if (chId) channelIdSet.add(chId);
    }
    const channelIds = Array.from(channelIdSet);

    // 3. 채널 정보 조회 (statistics, snippet, contentDetails)
    // YouTube API는 한 번에 최대 50개까지만 조회 가능하므로 50개씩 나눠서 호출
    const channels: any[] = [];
    const BATCH_SIZE = 50;

    for (let i = 0; i < channelIds.length; i += BATCH_SIZE) {
      const batch = channelIds.slice(i, i + BATCH_SIZE);
      const chParams = new URLSearchParams({
        part: "statistics,contentDetails,snippet",
        id: batch.join(","),
        key: apiKey,
      });

      const chRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?${chParams.toString()}`
      );

      if (!chRes.ok) {
        console.error(
          `Failed to fetch channel batch ${i / BATCH_SIZE + 1}: ${chRes.statusText}`
        );
        continue; // 일부 실패해도 계속 진행
      }

      const chData = await chRes.json();
      channels.push(...(chData.items || []));
    }

    // 4. 채널 정보만 DB에 저장
    let savedCount = 0;
    for (const ch of channels) {
      const channelId = ch.id;
      if (!channelId) continue;

      // 전체 평균 조회수 계산
      const totalViews = parseInt(ch.statistics?.viewCount || "0", 10);
      const videoCount = parseInt(ch.statistics?.videoCount || "0", 10);
      const overallAvgView =
        videoCount > 0 && Number.isFinite(totalViews)
          ? totalViews / videoCount
          : null;

      // 썸네일 URL
      const thumbnailUrl =
        ch.snippet?.thumbnails?.high?.url ||
        ch.snippet?.thumbnails?.default?.url ||
        "";

      // 업로드 플레이리스트 ID
      const uploadsPlaylist =
        ch.contentDetails?.relatedPlaylists?.uploads || null;

      await prisma.youtubeChannel.upsert({
        where: { id: channelId },
        update: {
          title: ch.snippet?.title || "",
          thumbnailUrl,
          regionCode: regionCode,
          uploadsPlaylist,
          overallAvgView,
          lastCrawledAt: new Date(),
        },
        create: {
          id: channelId,
          title: ch.snippet?.title || "",
          thumbnailUrl,
          regionCode: regionCode,
          uploadsPlaylist,
          overallAvgView,
          lastCrawledAt: new Date(),
        },
      });
      savedCount++;
    }

    return {
      success: true,
      channelsProcessed: savedCount,
      uniqueChannels: channelIds.length,
      videosAnalyzed: items.length,
      region: regionCode,
    };
  } catch (e: any) {
    throw new Error(e?.message || "cron failed");
  }
}
