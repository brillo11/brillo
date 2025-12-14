"use server";

import { prisma } from "@repo/database";
import OpenAI from "openai";
import {
  processAndSaveVideo,
  convertYouTubeApiResponseToVideo,
  type VideoToSave,
} from "./youtube-video-processor";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type OutlierType = "outlierVph" | "outlierView" | "outlierSubscriber";

export interface PrecomputedVideo {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string;
  channelId: string | null;
  channelTitle: string;
  publishedAt: Date | null;
  viewCount: number;
  likeCount: number | null;
  commentCount: number | null;
  duration: string | null;
  viewsPerHour: number | null;
  outlierVph: number | null;
  outlierView: number | null;
  outlierSubscriber: number | null;
  regionCode: string | null;
  categoryId: number | null;
}

export async function getTopPrecomputedVideos(
  limit = 50,
  regionCode?: string,
  outlierType: OutlierType = "outlierView"
) {
  const videos = await prisma.youtubeVideo.findMany({
    where: {
      ...(regionCode ? { regionCode } : {}),
    },
    orderBy: [
      { [outlierType]: "desc" },
      { viewsPerHour: "desc" },
      { viewCount: "desc" },
    ],
    take: Math.min(Math.max(limit, 1), 100),
    include: {
      channel: true,
    },
  });

  return videos.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    thumbnailUrl: v.thumbnailUrl,
    channelId: v.channelId,
    channelTitle: v.channel?.title || "",
    publishedAt: v.publishedAt,
    viewCount: v.viewCount,
    likeCount: v.likeCount,
    commentCount: v.commentCount,
    duration: v.duration,
    viewsPerHour: v.viewsPerHour,
    outlierVph: v.outlierVph,
    outlierView: v.outlierView,
    outlierSubscriber: v.outlierSubscriber,
    regionCode: v.regionCode,
    categoryId: v.categoryId,
  })) as PrecomputedVideo[];
}

export async function getTopPrecomputedShorts(
  limit = 50,
  regionCode?: string,
  outlierType: OutlierType = "outlierView"
) {
  const shorts = await prisma.youtubeShorts.findMany({
    where: {
      ...(regionCode ? { regionCode } : {}),
    },
    orderBy: [
      { [outlierType]: "desc" },
      { viewsPerHour: "desc" },
      { viewCount: "desc" },
    ],
    take: Math.min(Math.max(limit, 1), 100),
    include: {
      channel: true,
    },
  });

  return shorts.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    thumbnailUrl: s.thumbnailUrl,
    channelId: s.channelId,
    channelTitle: s.channel?.title || "",
    publishedAt: s.publishedAt,
    viewCount: s.viewCount,
    likeCount: s.likeCount,
    commentCount: s.commentCount,
    duration: s.duration,
    viewsPerHour: s.viewsPerHour,
    outlierVph: s.outlierVph,
    outlierView: s.outlierView,
    outlierSubscriber: s.outlierSubscriber,
    regionCode: s.regionCode,
    categoryId: s.categoryId,
  })) as PrecomputedVideo[];
}

// ============================================
// Smart Search Functions
// ============================================

/**
 * ChatGPT를 사용하여 텍스트에서 YouTube 검색 키워드 추출
 */
export async function extractKeywordsWithGPT(
  text: string
): Promise<{ success: boolean; keywords?: string[]; error?: string }> {
  try {
    if (!text.trim()) {
      return {
        success: false,
        error: "텍스트를 입력해주세요.",
      };
    }

    console.log("🔍 ChatGPT로 키워드 추출 시작:", text.substring(0, 100));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `당신은 YouTube 콘텐츠 전략 전문가입니다. 
사용자가 제공한 텍스트를 분석하여 YouTube에서 검색할 수 있는 효과적인 키워드 5개를 추출해주세요.

규칙:
1. 정확히 5개의 키워드를 추출합니다
2. 각 키워드는 YouTube 검색에 최적화되어야 합니다
3. 너무 일반적이거나 너무 구체적이지 않은 중간 수준의 키워드를 선택합니다
4. 영어 키워드는 그대로, 한글은 한글로 유지합니다
5. 각 키워드는 2-5단어로 구성됩니다
6. JSON 배열 형식으로만 응답합니다: ["keyword1", "keyword2", ...]

예시:
입력: "요리 채널을 운영하고 있어요. 빠르고 건강한 아침 식사 레시피를 만들고 싶어요."
출력: ["간편 아침 식사", "건강한 요리", "5분 레시피", "Quick Breakfast", "Meal Prep"]`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const response = completion.choices[0]?.message?.content?.trim();

    if (!response) {
      throw new Error("ChatGPT 응답이 없습니다.");
    }

    console.log("📝 ChatGPT 응답:", response);

    // JSON 파싱 (```json ... ``` 제거)
    const jsonMatch = response.match(/\[.*\]/s);
    if (!jsonMatch) {
      throw new Error("JSON 형식을 찾을 수 없습니다.");
    }

    const keywords = JSON.parse(jsonMatch[0]) as string[];

    if (!Array.isArray(keywords) || keywords.length === 0) {
      throw new Error("키워드 배열이 비어있습니다.");
    }

    console.log("✅ 키워드 추출 완료:", keywords);

    return {
      success: true,
      keywords: keywords.slice(0, 5), // 최대 5개
    };
  } catch (error) {
    console.error("❌ 키워드 추출 에러:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "키워드 추출 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 키워드로 YouTube 영상 검색
 * 1. DB에서 먼저 검색 (title, description)
 * 2. DB에 없거나 부족하면 YouTube API 호출
 * 3. API 결과를 DB에 저장
 * 4. PrecomputedVideo 타입으로 반환
 */
export async function searchYouTubeVideos(
  keyword: string,
  maxResults: number = 6
): Promise<{
  success: boolean;
  videos?: PrecomputedVideo[];
  error?: string;
}> {
  try {
    console.log(`🔎 YouTube 검색: "${keyword}"`);

    // 1. DB에서 먼저 검색
    const dbVideos = await prisma.youtubeVideo.findMany({
      where: {
        OR: [
          { title: { contains: keyword, mode: "insensitive" } },
          { description: { contains: keyword, mode: "insensitive" } },
        ],
      },
      orderBy: [
        { outlierVph: "desc" },
        { viewsPerHour: "desc" },
        { viewCount: "desc" },
      ],
      take: maxResults,
      include: {
        channel: true,
      },
    });

    console.log(`📊 DB에서 ${dbVideos.length}개 영상 발견`);

    // DB에 충분한 결과가 있으면 반환
    if (dbVideos.length >= maxResults) {
      return {
        success: true,
        videos: dbVideos.map((v) => ({
          id: v.id,
          title: v.title,
          description: v.description,
          thumbnailUrl: v.thumbnailUrl,
          channelId: v.channelId,
          channelTitle: v.channel?.title || "",
          publishedAt: v.publishedAt,
          viewCount: v.viewCount,
          likeCount: v.likeCount,
          commentCount: v.commentCount,
          duration: v.duration,
          viewsPerHour: v.viewsPerHour,
          outlierVph: v.outlierVph,
          outlierView: v.outlierView,
          outlierSubscriber: v.outlierSubscriber,
          regionCode: v.regionCode,
          categoryId: v.categoryId,
        })) as PrecomputedVideo[],
      };
    }

    // 2. YouTube API로 추가 검색
    const apiKey = process.env.YOUTUBE_DATA_API_KEY;

    if (!apiKey) {
      // API 키가 없으면 DB 결과만 반환
      console.warn("⚠️ YouTube API 키가 없습니다. DB 결과만 반환합니다.");
      return {
        success: true,
        videos: dbVideos.map((v) => ({
          id: v.id,
          title: v.title,
          description: v.description,
          thumbnailUrl: v.thumbnailUrl,
          channelId: v.channelId,
          channelTitle: v.channel?.title || "",
          publishedAt: v.publishedAt,
          viewCount: v.viewCount,
          likeCount: v.likeCount,
          commentCount: v.commentCount,
          duration: v.duration,
          viewsPerHour: v.viewsPerHour,
          outlierVph: v.outlierVph,
          outlierView: v.outlierView,
          outlierSubscriber: v.outlierSubscriber,
          regionCode: v.regionCode,
          categoryId: v.categoryId,
        })) as PrecomputedVideo[],
      };
    }

    const remainingCount = maxResults - dbVideos.length;
    console.log(`🌐 YouTube API로 ${remainingCount}개 추가 검색 중...`);

    // 검색 API 호출
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", keyword);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("maxResults", String(remainingCount * 2)); // 여유있게
    searchUrl.searchParams.set("order", "relevance");
    searchUrl.searchParams.set("key", apiKey);
    searchUrl.searchParams.set("videoDuration", "medium");
    searchUrl.searchParams.set("videoEmbeddable", "true");
    searchUrl.searchParams.set("videoSyndicated", "true");

    const searchResponse = await fetch(searchUrl.toString());

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      throw new Error(
        `YouTube 검색 실패: ${errorData.error?.message || searchResponse.statusText}`
      );
    }

    const searchData = await searchResponse.json();
    const items = searchData.items || [];

    if (items.length === 0) {
      return {
        success: true,
        videos: dbVideos.map((v) => ({
          id: v.id,
          title: v.title,
          description: v.description,
          thumbnailUrl: v.thumbnailUrl,
          channelId: v.channelId,
          channelTitle: v.channel?.title || "",
          publishedAt: v.publishedAt,
          viewCount: v.viewCount,
          likeCount: v.likeCount,
          commentCount: v.commentCount,
          duration: v.duration,
          viewsPerHour: v.viewsPerHour,
          outlierVph: v.outlierVph,
          outlierView: v.outlierView,
          outlierSubscriber: v.outlierSubscriber,
          regionCode: v.regionCode,
          categoryId: v.categoryId,
        })) as PrecomputedVideo[],
      };
    }

    // 비디오 상세 정보 조회
    const videoIds = items.map((item: any) => item.id.videoId).join(",");

    const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    videosUrl.searchParams.set("part", "statistics,contentDetails,snippet");
    videosUrl.searchParams.set("id", videoIds);
    videosUrl.searchParams.set("key", apiKey);

    const videosResponse = await fetch(videosUrl.toString());

    if (!videosResponse.ok) {
      throw new Error("비디오 상세 정보 조회 실패");
    }

    const videosData = await videosResponse.json();

    // 3. API 응답을 VideoToSave 형식으로 변환
    const videosToSave: VideoToSave[] = [];

    for (const video of videosData.items) {
      // 이미 DB에 있는지 확인
      const existingVideo = dbVideos.find((v) => v.id === video.id);
      if (existingVideo) {
        continue;
      }

      const converted = await convertYouTubeApiResponseToVideo(video, null);
      if (converted) {
        videosToSave.push(converted);
        if (videosToSave.length >= remainingCount) {
          break;
        }
      }
    }

    // 4. 영상 처리 및 DB 저장 (API 키 전달)
    const newVideos: PrecomputedVideo[] = [];

    for (const videoToSave of videosToSave) {
      try {
        const savedVideo = await processAndSaveVideo(videoToSave, apiKey);

        newVideos.push({
          id: savedVideo.id,
          title: savedVideo.title,
          description: savedVideo.description,
          thumbnailUrl: savedVideo.thumbnailUrl,
          channelId: savedVideo.channelId,
          channelTitle: savedVideo.channelTitle || "",
          publishedAt: savedVideo.publishedAt,
          viewCount: savedVideo.viewCount,
          likeCount: savedVideo.likeCount,
          commentCount: savedVideo.commentCount,
          duration: savedVideo.duration,
          viewsPerHour: savedVideo.viewsPerHour,
          outlierVph: savedVideo.outlierVph,
          outlierView: savedVideo.outlierView,
          outlierSubscriber: savedVideo.outlierSubscriber,
          regionCode: savedVideo.regionCode,
          categoryId: savedVideo.categoryId,
        });
      } catch (error) {
        console.error(`영상 저장 실패 (${videoToSave.id}):`, error);
        // 에러가 발생해도 계속 진행
      }
    }

    console.log(`✅ API에서 ${newVideos.length}개 영상 추가 (DB 저장 완료)`);

    // 5. DB 결과 + 새 결과 병합
    const allVideos = [
      ...dbVideos.map((v) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        thumbnailUrl: v.thumbnailUrl,
        channelId: v.channelId,
        channelTitle: v.channel?.title || "",
        publishedAt: v.publishedAt,
        viewCount: v.viewCount,
        likeCount: v.likeCount,
        commentCount: v.commentCount,
        duration: v.duration,
        viewsPerHour: v.viewsPerHour,
        outlierVph: v.outlierVph,
        regionCode: v.regionCode,
        categoryId: v.categoryId,
      })),
      ...newVideos,
    ].slice(0, maxResults);

    return {
      success: true,
      videos: allVideos as PrecomputedVideo[],
    };
  } catch (error) {
    console.error("❌ YouTube 검색 에러:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "YouTube 검색 중 오류가 발생했습니다.",
    };
  }
}
