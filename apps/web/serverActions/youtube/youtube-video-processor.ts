"use server";

import { prisma } from "@repo/database";
import {
  parseDuration,
  isShortsVideo,
  calculateViewsPerHour,
} from "./youtube-common";

/**
 * YouTube 영상 데이터 처리 및 DB 저장 로직
 * 크론잡과 검색 기능에서 공통으로 사용
 */

const RECENT_VIDEOS_AVG_COUNT = 10; // 최근 N개 영상의 평균 VPH 계산

export interface VideoToSave {
  id: string;
  channelId: string;
  channelTitle: string; // 채널 제목 추가!
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: Date;
  duration: string;
  viewCount: number;
  likeCount: number | null;
  commentCount: number | null;
  categoryId: number | null;
  regionCode?: string | null;
}

export interface SavedVideoData {
  id: string;
  channelId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: Date | null;
  duration: string;
  viewCount: number;
  likeCount: number | null;
  commentCount: number | null;
  viewsPerHour: number | null;
  outlierVph: number | null;
  outlierView: number | null;
  outlierSubscriber: number | null;
  categoryId: number | null;
  regionCode: string | null;
  channelTitle?: string;
}

/**
 * 채널의 최근 영상들의 평균 VPH 계산 (크론잡과 동일한 방식)
 */
export async function calculateChannelRecentAvgVph(
  channelId: string,
  limit: number = RECENT_VIDEOS_AVG_COUNT
): Promise<number | null> {
  try {
    const recentVideos = await prisma.youtubeVideo.findMany({
      where: {
        channelId,
        viewsPerHour: { not: null, gt: 0 },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: { viewsPerHour: true },
    });

    if (recentVideos.length === 0) return null;

    const sum = recentVideos.reduce((acc, v) => acc + (v.viewsPerHour || 0), 0);
    const avg = sum / recentVideos.length;

    return Number.isFinite(avg) && avg > 0 ? avg : null;
  } catch (error) {
    console.error("평균 VPH 계산 실패:", error);
    return null;
  }
}

/**
 * Outlier 값들 계산 (키워드 검색용 간소화 버전)
 * outlierVph는 null로 설정 (크론잡에서만 계산)
 * outlierView, outlierSubscriber만 계산
 */
export async function calculateOutliers(
  channelId: string,
  viewCount: number,
  viewsPerHour: number | null
): Promise<{
  outlierVph: number | null;
  outlierView: number | null;
  outlierSubscriber: number | null;
}> {
  try {
    // 채널 정보 가져오기
    const channel = await prisma.youtubeChannel.findUnique({
      where: { id: channelId },
      select: {
        overallAvgView: true,
        subscriberCount: true,
      },
    });

    // outlierView: 채널 평균 조회수 대비
    const outlierView =
      channel?.overallAvgView && channel.overallAvgView > 0
        ? viewCount / channel.overallAvgView
        : null;

    // outlierSubscriber: 구독자 수 대비 (가장 중요한 지표!)
    const outlierSubscriber =
      channel?.subscriberCount && channel.subscriberCount > 0
        ? viewCount / channel.subscriberCount
        : null;

    return {
      outlierVph: null, // 키워드 검색에서는 계산하지 않음 (크론잡 전용)
      outlierView,
      outlierSubscriber,
    };
  } catch (error) {
    console.error("Outlier 계산 실패:", error);
    return {
      outlierVph: null,
      outlierView: null,
      outlierSubscriber: null,
    };
  }
}

/**
 * 채널 정보 upsert (간단 버전 - title만)
 */
export async function upsertChannelBasic(
  channelId: string,
  channelTitle: string,
  thumbnailUrl: string = ""
): Promise<void> {
  await prisma.youtubeChannel.upsert({
    where: { id: channelId },
    create: {
      id: channelId,
      title: channelTitle,
      thumbnailUrl,
    },
    update: {
      title: channelTitle,
    },
  });
}

/**
 * YouTube API로 채널 상세 정보 가져오기
 */
export async function fetchChannelDetailsFromAPI(
  channelId: string,
  apiKey: string
): Promise<{
  subscriberCount: number | null;
  videoCount: number | null;
  thumbnailUrl: string;
  regionCode: string | null;
  uploadsPlaylist: string | null;
  overallAvgView: number | null;
} | null> {
  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/channels");
    url.searchParams.set("part", "statistics,snippet,contentDetails");
    url.searchParams.set("id", channelId);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error(`채널 정보 조회 실패: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const channel = data.items?.[0];

    if (!channel) {
      console.error(`채널을 찾을 수 없음: ${channelId}`);
      return null;
    }

    const statistics = channel.statistics || {};
    const snippet = channel.snippet || {};
    const contentDetails = channel.contentDetails || {};

    const subscriberCount = statistics.subscriberCount
      ? parseInt(statistics.subscriberCount, 10)
      : null;
    const videoCount = statistics.videoCount
      ? parseInt(statistics.videoCount, 10)
      : null;
    const viewCount = statistics.viewCount
      ? parseInt(statistics.viewCount, 10)
      : null;

    // overallAvgView 계산: 전체 조회수 / 영상 개수
    const overallAvgView =
      viewCount && videoCount && videoCount > 0 ? viewCount / videoCount : null;

    return {
      subscriberCount,
      videoCount,
      thumbnailUrl:
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.medium?.url ||
        snippet.thumbnails?.default?.url ||
        "",
      regionCode: snippet.country || null,
      uploadsPlaylist: contentDetails.relatedPlaylists?.uploads || null,
      overallAvgView,
    };
  } catch (error) {
    console.error(`채널 정보 조회 중 에러 (${channelId}):`, error);
    return null;
  }
}

/**
 * 채널 정보 완전 upsert (API 호출 포함)
 * 구독자 수, 영상 개수 등 상세 정보 포함
 * 키워드 검색용: outlierSubscriber 계산에 필요한 정보만 수집
 */
export async function upsertChannelWithDetails(
  channelId: string,
  channelTitle: string,
  apiKey?: string
): Promise<void> {
  // API 키가 있으면 상세 정보 가져오기
  if (apiKey) {
    const details = await fetchChannelDetailsFromAPI(channelId, apiKey);

    if (details) {
      await prisma.youtubeChannel.upsert({
        where: { id: channelId },
        create: {
          id: channelId,
          title: channelTitle,
          thumbnailUrl: details.thumbnailUrl,
          subscriberCount: details.subscriberCount,
          videoCount: details.videoCount,
          regionCode: details.regionCode,
          uploadsPlaylist: details.uploadsPlaylist,
          overallAvgView: details.overallAvgView,
        },
        update: {
          title: channelTitle,
          thumbnailUrl: details.thumbnailUrl,
          subscriberCount: details.subscriberCount,
          videoCount: details.videoCount,
          regionCode: details.regionCode,
          uploadsPlaylist: details.uploadsPlaylist,
          overallAvgView: details.overallAvgView,
        },
      });

      console.log(
        `📊 [${channelTitle}] 구독자: ${details.subscriberCount?.toLocaleString() || "N/A"}, ` +
          `평균 조회수: ${details.overallAvgView?.toLocaleString() || "N/A"}`
      );
      return;
    }
  }

  // API 키가 없거나 실패한 경우 기본 정보만 저장
  await upsertChannelBasic(channelId, channelTitle);
}

/**
 * YouTube 영상 데이터를 처리하고 DB에 저장
 * @returns 저장된 영상 데이터 (채널 정보 포함)
 */
export async function processAndSaveVideo(
  video: VideoToSave,
  apiKey?: string
): Promise<SavedVideoData> {
  // 1. VPH 계산
  const viewsPerHour = calculateViewsPerHour(
    video.viewCount,
    video.publishedAt
  );

  // 2. 채널 정보 확인 및 생성 (API 키가 있으면 상세 정보 포함)
  await upsertChannelWithDetails(video.channelId, video.channelTitle, apiKey);

  // 3. 채널 정보 조회 (regionCode 가져오기)
  const channel = await prisma.youtubeChannel.findUnique({
    where: { id: video.channelId },
    select: { regionCode: true },
  });

  // 영상의 regionCode는 채널의 regionCode 사용
  const videoRegionCode = channel?.regionCode || null;

  // 4. Outlier 값들 계산
  const outliers = await calculateOutliers(
    video.channelId,
    video.viewCount,
    viewsPerHour
  );

  // 5. 비디오 DB에 저장
  const savedVideo = await prisma.youtubeVideo.upsert({
    where: { id: video.id },
    create: {
      id: video.id,
      channelId: video.channelId,
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      publishedAt: video.publishedAt,
      duration: video.duration,
      viewCount: video.viewCount,
      likeCount: video.likeCount,
      commentCount: video.commentCount,
      viewsPerHour,
      outlierVph: outliers.outlierVph,
      outlierView: outliers.outlierView,
      outlierSubscriber: outliers.outlierSubscriber,
      regionCode: videoRegionCode,
      categoryId: video.categoryId,
    },
    update: {
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      viewCount: video.viewCount,
      likeCount: video.likeCount,
      commentCount: video.commentCount,
      viewsPerHour,
      outlierVph: outliers.outlierVph,
      outlierView: outliers.outlierView,
      outlierSubscriber: outliers.outlierSubscriber,
      regionCode: videoRegionCode,
    },
    include: {
      channel: true,
    },
  });

  return {
    id: savedVideo.id,
    channelId: savedVideo.channelId,
    title: savedVideo.title,
    description: savedVideo.description,
    thumbnailUrl: savedVideo.thumbnailUrl,
    publishedAt: savedVideo.publishedAt,
    duration: savedVideo.duration,
    viewCount: savedVideo.viewCount,
    likeCount: savedVideo.likeCount,
    commentCount: savedVideo.commentCount,
    viewsPerHour: savedVideo.viewsPerHour,
    outlierVph: savedVideo.outlierVph,
    outlierView: savedVideo.outlierView,
    outlierSubscriber: savedVideo.outlierSubscriber,
    categoryId: savedVideo.categoryId,
    regionCode: savedVideo.regionCode,
    channelTitle: savedVideo.channel?.title || "",
  };
}

/**
 * 여러 영상을 배치로 처리하고 저장
 * @param videos 저장할 영상 데이터 배열
 * @param apiKey YouTube API 키 (채널 상세 정보 조회용, 선택)
 */
export async function processAndSaveVideos(
  videos: VideoToSave[],
  apiKey?: string
): Promise<SavedVideoData[]> {
  const savedVideos: SavedVideoData[] = [];

  for (const video of videos) {
    try {
      const saved = await processAndSaveVideo(video, apiKey);
      savedVideos.push(saved);
    } catch (error) {
      console.error(`영상 저장 실패 (${video.id}):`, error);
      // 에러가 발생해도 계속 진행
    }
  }

  return savedVideos;
}

/**
 * YouTube API 응답을 VideoToSave 형식으로 변환
 */
export async function convertYouTubeApiResponseToVideo(
  apiVideo: any,
  regionCode?: string | null
): Promise<VideoToSave | null> {
  try {
    const snippet = apiVideo.snippet || {};
    const statistics = apiVideo.statistics || {};
    const contentDetails = apiVideo.contentDetails || {};

    // Shorts 제외 여부 확인
    if (isShortsVideo(contentDetails.duration, snippet.title)) {
      return null;
    }

    const viewCount = parseInt(statistics.viewCount || "0", 10);
    const publishedAt = new Date(snippet.publishedAt);

    // likeCount, commentCount 처리 (크론잡 방식)
    const likeCount = statistics.likeCount
      ? parseInt(statistics.likeCount, 10)
      : null;
    const commentCount = statistics.commentCount
      ? parseInt(statistics.commentCount, 10)
      : null;

    // categoryId 처리 (크론잡 방식)
    const categoryId = snippet.categoryId
      ? parseInt(snippet.categoryId, 10)
      : null;

    return {
      id: apiVideo.id,
      channelId: snippet.channelId,
      channelTitle: snippet.channelTitle || "",
      title: snippet.title || "",
      description: snippet.description || "",
      thumbnailUrl:
        snippet.thumbnails?.maxres?.url ||
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.medium?.url ||
        snippet.thumbnails?.default?.url ||
        "",
      publishedAt,
      duration: contentDetails.duration || "", // ISO 8601 형식 그대로 저장 (크론잡 방식)
      viewCount,
      likeCount: Number.isFinite(likeCount ?? 0) ? likeCount : null,
      commentCount: Number.isFinite(commentCount ?? 0) ? commentCount : null,
      categoryId: Number.isFinite(categoryId ?? 0) ? categoryId : null,
      regionCode,
    };
  } catch (error) {
    console.error("API 응답 변환 실패:", error);
    return null;
  }
}
