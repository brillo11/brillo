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

// Search API로 채널 검색 (다양한 키워드로 고르게 수집)
async function searchChannelsByQuery(
  apiKey: string,
  query: string,
  regionCode: string,
  maxResults: number = 10
): Promise<string[]> {
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "channel", // 채널만 검색
    maxResults: String(Math.min(maxResults, 50)),
    regionCode,
    key: apiKey,
  });

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params.toString()}`
  );

  if (!res.ok) {
    console.error(`Search failed for query "${query}": ${res.statusText}`);
    return [];
  }

  const data = await res.json();
  const channelIds: string[] = [];

  for (const item of data.items || []) {
    if (item.id?.channelId) {
      channelIds.push(item.id.channelId);
    }
  }

  return channelIds;
}

// 고르게 채널 수집을 위한 검색 쿼리 리스트
function getSearchQueries(regionCode: string): string[] {
  // 한국 기준 다양한 카테고리 키워드
  const krQueries = [
    // 교육/학습
    "코딩 강의",
    "영어 공부",
    "수학 강의",
    "자격증",
    "온라인 강의",
    // 엔터테인먼트
    "음악",
    "게임",
    "먹방",
    "브이로그",
    "리액션",
    // 라이프스타일
    "요리",
    "여행",
    "패션",
    "뷰티",
    "운동",
    // 기술/IT
    "프로그래밍",
    "개발",
    "테크 리뷰",
    "앱 리뷰",
    // 뉴스/정보
    "뉴스",
    "시사",
    "경제",
    "정치",
  ];

  // 다른 지역은 영어 키워드 사용
  const enQueries = [
    "coding tutorial",
    "music",
    "gaming",
    "cooking",
    "travel",
    "tech review",
    "education",
    "lifestyle",
    "news",
    "entertainment",
  ];

  return regionCode === "KR" ? krQueries : enQueries;
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

    // 3. Search API로 다양한 키워드로 채널 추가 수집
    const searchQueries = getSearchQueries(regionCode);
    const channelsPerQuery = Math.max(5, Math.floor(50 / searchQueries.length)); // 쿼리당 5개씩

    console.log(
      `[Search API] ${searchQueries.length}개 쿼리로 채널 검색 시작...`
    );

    for (const query of searchQueries) {
      try {
        const foundChannelIds = await searchChannelsByQuery(
          apiKey,
          query,
          regionCode,
          channelsPerQuery
        );
        for (const chId of foundChannelIds) {
          channelIdSet.add(chId);
        }
        // API 쿼터 고려하여 약간의 딜레이
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Search failed for query "${query}":`, error);
        // 개별 쿼리 실패는 무시하고 계속 진행
      }
    }

    const channelIds = Array.from(channelIdSet);
    console.log(
      `[채널 수집 완료] 인기 영상: ${items.length}개, 검색 추가: ${channelIds.length - items.length}개, 총 고유 채널: ${channelIds.length}개`
    );

    // 4. 채널 정보 조회 (statistics, snippet, contentDetails)
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

    // 5. 채널 정보만 DB에 저장
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
