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
  maxResults: number = 50
): Promise<string[]> {
  const channelIds: string[] = [];
  let pageToken: string | undefined = undefined;

  while (channelIds.length < maxResults) {
    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "channel",
      maxResults: String(Math.min(maxResults - channelIds.length, 50)),
      regionCode,
      key: apiKey,
    });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params.toString()}`
    );

    if (!res.ok) {
      console.error(`Search failed for query "${query}": ${res.statusText}`);
      break;
    }

    const data = await res.json();
    const items = data.items || [];

    for (const item of items) {
      if (item.id?.channelId) {
        channelIds.push(item.id.channelId);
      }
    }

    pageToken = data.nextPageToken;
    if (!pageToken || channelIds.length >= maxResults) break;
  }

  return channelIds;
}

// 고르게 채널 수집을 위한 검색 쿼리 리스트 (전체)
function getAllSearchQueries(regionCode: string): string[] {
  // 한국 기준 다양한 카테고리 키워드 (YouTube 카테고리 포함)
  const krQueries = [
    // YouTube 카테고리 기반 (& 분리)
    "영화",
    "애니메이션",
    "자동차",
    "차량",
    "음악",
    "반려동물",
    "동물",
    "스포츠",
    "단편 영화",
    "여행",
    "이벤트",
    "게임",
    "비디오 블로그",
    "브이로그",
    "인물",
    "블로그",
    "코미디",
    "엔터테인먼트",
    "뉴스",
    "정치",
    "노하우",
    "스타일",
    "교육",
    "과학",
    "기술",
    "액션",
    "어드벤처",
    "클래식",
    "다큐멘터리",
    "드라마",
    "가족",
    "해외",
    "공포",
    "SF",
    "판타지",
    "스릴러",
    "쇼츠",
    "쇼",
    "예고편",
    // 추가 교육/학습
    "코딩 강의",
    "영어 공부",
    "수학 강의",
    "자격증",
    "온라인 강의",
    // 추가 엔터테인먼트
    "먹방",
    "리액션",
    // 추가 라이프스타일
    "요리",
    "패션",
    "뷰티",
    "운동",
    // 추가 기술/IT
    "프로그래밍",
    "개발",
    "테크 리뷰",
    "앱 리뷰",
    // 추가 뉴스/정보
    "시사",
    "경제",
  ];

  // 다른 지역은 영어 키워드 사용
  const enQueries = [
    // YouTube categories
    "movie",
    "animation",
    "automotive",
    "vehicle",
    "music",
    "pets",
    "animals",
    "sports",
    "short film",
    "travel",
    "events",
    "gaming",
    "vlog",
    "people",
    "blog",
    "comedy",
    "entertainment",
    "news",
    "politics",
    "howto",
    "style",
    "education",
    "science",
    "technology",
    "action",
    "adventure",
    "classic",
    "documentary",
    "drama",
    "family",
    "foreign",
    "horror",
    "sci-fi",
    "fantasy",
    "thriller",
    "shorts",
    "shows",
    "trailer",
    // Additional
    "coding tutorial",
    "cooking",
    "tech review",
    "lifestyle",
  ];

  return regionCode === "KR" ? krQueries : enQueries;
}

// 카테고리 범위별로 검색 쿼리 분배 (각 라우트당 20개씩)
function getSearchQueriesByCategoryRange(
  categoryStart: number,
  categoryEnd: number,
  regionCode: string
): string[] {
  const allQueries = getAllSearchQueries(regionCode);
  const queriesPerRoute = 20; // 각 라우트당 20개 쿼리

  // 현재 범위의 인덱스 계산 (1-20=0, 21-40=1, 41-60=2, ...)
  const rangeIndex = Math.floor((categoryStart - 1) / 20);

  // 해당 범위에 할당된 쿼리 추출 (20개씩)
  const startIndex = rangeIndex * queriesPerRoute;
  const endIndex = Math.min(startIndex + queriesPerRoute, allQueries.length);

  return allQueries.slice(startIndex, endIndex);
}

/**
 * YouTube Popular 크론잡 실행 (카테고리별)
 * Search API에서 특정 카테고리 범위의 채널을 수집
 */
export async function runYoutubePopularCronByCategory(
  categoryStart: number,
  categoryEnd: number,
  region: string = "KR",
  apiKey?: string
) {
  try {
    const key = apiKey || process.env.YOUTUBE_DATA_API_KEY;
    if (!key) {
      throw new Error("API Key is not set");
    }

    const regionCode = region.toUpperCase();

    // Search API로 카테고리별 채널 수집 (해당 범위에 할당된 쿼리만 사용)
    const searchQueries = getSearchQueriesByCategoryRange(
      categoryStart,
      categoryEnd,
      regionCode
    );
    const channelsPerQuery = 200;

    console.log(
      `[Search API] 카테고리 ${categoryStart}-${categoryEnd} 범위, ${searchQueries.length}개 쿼리로 채널 검색 시작...`
    );

    const channelIdSet = new Set<string>();

    for (const query of searchQueries) {
      try {
        const foundChannelIds = await searchChannelsByQuery(
          key,
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
      `[채널 수집 완료] 검색으로 수집한 채널: ${channelIds.length}개`
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
        key: key,
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
      // 영상이 10개 초과인 채널만 필터링
      const validChannels = (chData.items || []).filter((ch: any) => {
        const videoCount = parseInt(ch.statistics?.videoCount || "0", 10);
        return videoCount > 10;
      });
      channels.push(...validChannels);
    }

    // 5. 채널 정보만 DB에 저장
    let savedCount = 0;
    for (const ch of channels) {
      const channelId = ch.id;
      if (!channelId) continue;

      // 전체 평균 조회수 계산
      const totalViews = parseInt(ch.statistics?.viewCount || "0", 10);
      const videoCount = parseInt(ch.statistics?.videoCount || "0", 10);
      const subscriberCount = parseInt(
        ch.statistics?.subscriberCount || "0",
        10
      );
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
          videoCount: videoCount > 0 ? videoCount : null,
          subscriberCount: subscriberCount > 0 ? subscriberCount : null,
          overallAvgView,
          lastCrawledAt: new Date(),
        },
        create: {
          id: channelId,
          title: ch.snippet?.title || "",
          thumbnailUrl,
          regionCode: regionCode,
          uploadsPlaylist,
          videoCount: videoCount > 0 ? videoCount : null,
          subscriberCount: subscriberCount > 0 ? subscriberCount : null,
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
      region: regionCode,
      categoryRange: `${categoryStart}-${categoryEnd}`,
    };
  } catch (e: any) {
    throw new Error(e?.message || "cron failed");
  }
}

/**
 * YouTube Popular 크론잡 실행 (인기 영상 기반)
 * 인기 영상에서 채널을 추출하여 수집
 */
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

    // 1. 인기 영상 가져오기
    const items = await fetchMostPopular(regionCode, safeCount);

    // 2. 채널 ID 추출 (중복 제거)
    const channelIdSet = new Set<string>();
    for (const it of items) {
      const chId = it?.snippet?.channelId;
      if (chId) channelIdSet.add(chId);
    }

    const channelIds = Array.from(channelIdSet);
    console.log(
      `[인기 영상 크론] 영상: ${items.length}개, 고유 채널: ${channelIds.length}개`
    );

    // 3. 채널 정보 조회 (statistics, snippet, contentDetails)
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
        continue;
      }

      const chData = await chRes.json();
      // 영상이 10개 초과인 채널만 필터링
      const validChannels = (chData.items || []).filter((ch: any) => {
        const videoCount = parseInt(ch.statistics?.videoCount || "0", 10);
        return videoCount > 10;
      });
      channels.push(...validChannels);
    }

    // 4. 채널 정보만 DB에 저장
    let savedCount = 0;
    for (const ch of channels) {
      const channelId = ch.id;
      if (!channelId) continue;

      const totalViews = parseInt(ch.statistics?.viewCount || "0", 10);
      const videoCount = parseInt(ch.statistics?.videoCount || "0", 10);
      const subscriberCount = parseInt(
        ch.statistics?.subscriberCount || "0",
        10
      );
      const overallAvgView =
        videoCount > 0 && Number.isFinite(totalViews)
          ? totalViews / videoCount
          : null;

      const thumbnailUrl =
        ch.snippet?.thumbnails?.high?.url ||
        ch.snippet?.thumbnails?.default?.url ||
        "";

      const uploadsPlaylist =
        ch.contentDetails?.relatedPlaylists?.uploads || null;

      await prisma.youtubeChannel.upsert({
        where: { id: channelId },
        update: {
          title: ch.snippet?.title || "",
          thumbnailUrl,
          regionCode: regionCode,
          uploadsPlaylist,
          videoCount: videoCount > 0 ? videoCount : null,
          subscriberCount: subscriberCount > 0 ? subscriberCount : null,
          overallAvgView,
          lastCrawledAt: new Date(),
        },
        create: {
          id: channelId,
          title: ch.snippet?.title || "",
          thumbnailUrl,
          regionCode: regionCode,
          uploadsPlaylist,
          videoCount: videoCount > 0 ? videoCount : null,
          subscriberCount: subscriberCount > 0 ? subscriberCount : null,
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
