"use server";

import { prisma } from "@repo/database";
import { isShortsVideo, calculateViewsPerHour } from "./youtube-common";
import { banCron, isCronBanned } from "@/lib/utils/cron-ban";

const CRON_NAME = "youtube-videos";

// 상수 정의
const RECENT_VIDEOS_AVG_COUNT = 10; // 최근 N개 영상의 평균 VPH 계산
const MIN_OUTLIER_VIEW = 3; // outlierView가 이 값 이상인 영상만 저장 (채널 평균의 3배)
// const MIN_VIEWS_PER_HOUR = 100; // VPH가 이 값 이상인 영상만 저장
const MAX_VIDEOS_PER_CHANNEL = 50; // 채널당 최대 수집 영상 수

interface VideoData {
  id: string;
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
}

/**
 * 채널의 최근 영상 목록 가져오기
 * @throws API 에러 발생 시 에러를 throw (Forbidden 등)
 */
async function fetchChannelVideos(
  apiKey: string,
  uploadsPlaylistId: string,
  maxResults: number = 50
): Promise<string[]> {
  const videoIds: string[] = [];
  let pageToken: string | undefined = undefined;
  let hasApiError = false;

  while (videoIds.length < maxResults) {
    const params = new URLSearchParams({
      part: "contentDetails",
      playlistId: uploadsPlaylistId,
      maxResults: "50",
      key: apiKey,
    });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`
    );

    if (!res.ok) {
      console.error(`Failed to fetch playlist items: ${res.statusText}`);
      // API 에러 발생 - 에러를 throw하여 호출자가 처리하도록
      hasApiError = true;
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const items = data.items || [];

    for (const item of items) {
      const videoId = item.contentDetails?.videoId;
      if (videoId) {
        videoIds.push(videoId);
        if (videoIds.length >= maxResults) break;
      }
    }

    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }

  return videoIds;
}

/**
 * 영상 상세 정보 가져오기
 */
async function fetchVideoDetails(
  apiKey: string,
  videoIds: string[]
): Promise<any[]> {
  if (videoIds.length === 0) return [];

  // YouTube API는 한 번에 최대 50개까지만 조회 가능
  const BATCH_SIZE = 50;
  const allVideos: any[] = [];

  for (let i = 0; i < videoIds.length; i += BATCH_SIZE) {
    const batch = videoIds.slice(i, i + BATCH_SIZE);
    const params = new URLSearchParams({
      part: "snippet,statistics,contentDetails",
      id: batch.join(","),
      key: apiKey,
    });

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`
    );

    if (!res.ok) {
      console.error(`Failed to fetch video batch: ${res.statusText}`);
      continue;
    }

    const data = await res.json();
    allVideos.push(...(data.items || []));

    // API 쿼터 고려하여 딜레이
    if (i + BATCH_SIZE < videoIds.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return allVideos;
}

// 공통 함수들은 youtube-common.ts로 이동

/**
 * 채널의 최근 영상들의 평균 VPH 계산
 */
function calculateRecentAvgVph(videos: VideoData[]): number | null {
  const recentVideos = videos
    .filter((v) => v.viewsPerHour !== null && v.viewsPerHour > 0)
    .slice(0, RECENT_VIDEOS_AVG_COUNT);

  if (recentVideos.length === 0) return null;

  const sum = recentVideos.reduce((acc, v) => acc + (v.viewsPerHour || 0), 0);
  const avg = sum / recentVideos.length;

  return Number.isFinite(avg) && avg > 0 ? avg : null;
}

/**
 * 영상 데이터 처리 및 outlier 계산
 */
function processVideos(
  apiVideos: any[],
  channelId: string,
  regionCode: string | null,
  overallAvgView: number | null,
  subscriberCount: number | null
): VideoData[] {
  const now = Date.now();
  const processed: VideoData[] = [];

  for (const item of apiVideos) {
    const snippet = item.snippet || {};
    const statistics = item.statistics || {};
    const contentDetails = item.contentDetails || {};

    const publishedAt = snippet.publishedAt
      ? new Date(snippet.publishedAt)
      : null;

    const viewCount = parseInt(statistics.viewCount || "0", 10);
    const likeCount = statistics.likeCount
      ? parseInt(statistics.likeCount, 10)
      : null;
    const commentCount = statistics.commentCount
      ? parseInt(statistics.commentCount, 10)
      : null;

    const thumbnailUrl =
      snippet.thumbnails?.maxres?.url ||
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url ||
      "";

    // categoryId 추출 (YouTube 비디오 카테고리 ID)
    const categoryId = snippet.categoryId
      ? parseInt(snippet.categoryId, 10)
      : null;

    // VPH 계산
    const viewsPerHour = calculateViewsPerHour(viewCount, publishedAt);

    processed.push({
      id: item.id,
      title: snippet.title || "",
      description: snippet.description || "",
      thumbnailUrl,
      publishedAt,
      duration: contentDetails.duration || "",
      viewCount,
      likeCount: Number.isFinite(likeCount ?? 0) ? likeCount : null,
      commentCount: Number.isFinite(commentCount ?? 0) ? commentCount : null,
      viewsPerHour,
      outlierVph: null, // 나중에 계산
      outlierView:
        overallAvgView && overallAvgView > 0
          ? viewCount / overallAvgView
          : null,
      outlierSubscriber:
        subscriberCount && subscriberCount > 0
          ? viewCount / subscriberCount
          : null,
      categoryId: Number.isFinite(categoryId ?? 0) ? categoryId : null,
    });
  }

  // 최근 평균 VPH 계산
  const recentAvgVph = calculateRecentAvgVph(processed);

  // outlierVph 계산
  if (recentAvgVph && recentAvgVph > 0) {
    for (const video of processed) {
      if (video.viewsPerHour !== null && video.viewsPerHour > 0) {
        const raw = video.viewsPerHour / recentAvgVph;
        video.outlierVph = Number.isFinite(raw) ? raw : null;
      }
    }
  }

  return processed;
}

/**
 * YouTube 영상 크론잡 실행
 * DB에 저장된 채널들의 영상 중 outlier가 높은 영상들을 수집하여 저장
 */
export async function runYoutubeVideosCron(
  maxChannels?: number,
  regionCode?: string,
  skip?: number,
  take?: number
) {
  try {
    // 크론 밴 상태 확인
    const banInfo = await isCronBanned(CRON_NAME);
    if (banInfo) {
      throw new Error(
        `Cron is temporarily banned. Remaining: ${banInfo.remainingMinutes} minutes`
      );
    }

    const apiKey = process.env.YOUTUBE_DATA_API_KEY2;
    if (!apiKey) {
      throw new Error("YOUTUBE_DATA_API_KEY2 is not set");
    }

    // 1. DB에서 채널 목록 가져오기 (uploadsPlaylist가 있는 것들)
    // 24시간 이내에 크롤링된 채널은 제외
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const where: any = {
      uploadsPlaylist: { not: null },
      OR: [
        { lastCrawledAt: null },
        { lastCrawledAt: { lt: twentyFourHoursAgo } },
      ],
    };
    if (regionCode) {
      where.regionCode = regionCode;
    }

    const channels = await prisma.youtubeChannel.findMany({
      where,
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
      ...(maxChannels && !take && { take: maxChannels }),
      orderBy: {
        lastCrawledAt: "asc", // 가장 오래된 것부터
      },
    });

    console.log(`[YouTube Videos Cron] ${channels.length}개 채널 처리 시작...`);

    let totalVideosProcessed = 0;
    let totalVideosSaved = 0;
    let totalShortsSaved = 0;
    let channelsProcessed = 0;

    // 2. 각 채널의 영상 수집 및 처리
    for (const channel of channels) {
      if (!channel.uploadsPlaylist) continue;

      try {
        // 채널의 최근 영상 목록 가져오기
        let videoIds: string[];
        try {
          videoIds = await fetchChannelVideos(
            apiKey,
            channel.uploadsPlaylist,
            MAX_VIDEOS_PER_CHANNEL
          );
        } catch (apiError: any) {
          // API 에러 처리
          const statusCode = apiError.statusCode || 0;

          // 밴이 필요한 에러(400, 403)인 경우 크론 밴 처리
          if (statusCode === 400 || statusCode === 403) {
            await banCron(CRON_NAME);
            console.error(
              `[YouTube Videos Cron] Cron banned due to ${statusCode} error. Cron will be paused for 3 hours.`
            );
            throw new Error(
              `Cron temporarily banned due to ${statusCode} error. Will retry after 3 hours.`
            );
          }

          // 그 외 에러는 채널은 유지하고 건너뛰기
          console.log(
            `[${channel.title}] API 에러로 영상 목록 가져오기 실패: ${apiError.message} - 건너뛰기. 상태코드: ${statusCode}`
          );
          continue;
        }

        if (videoIds.length === 0) {
          console.log(`[${channel.title}] 영상 없음 (정상 응답) - 채널 삭제`);
          // API는 정상 응답했지만 영상이 없는 경우 → 채널 삭제
          await prisma.youtubeChannel.delete({
            where: { id: channel.id },
          });
          continue;
        }

        // 영상 상세 정보 가져오기
        let apiVideos: any[];
        try {
          apiVideos = await fetchVideoDetails(apiKey, videoIds);
        } catch (apiError: any) {
          // fetchVideoDetails에서 밴이 필요한 에러가 발생한 경우
          const statusCode = apiError.statusCode || 0;
          if (statusCode === 400 || statusCode === 403) {
            await banCron(CRON_NAME);
            console.error(
              `[YouTube Videos Cron] Cron banned due to ${statusCode} error. Cron will be paused for 3 hours.`
            );
            throw new Error(
              `Cron temporarily banned due to ${statusCode} error. Will retry after 3 hours.`
            );
          }
          // 그 외 에러는 빈 배열로 처리
          apiVideos = [];
        }
        totalVideosProcessed += apiVideos.length;

        // 영상 데이터 처리 및 outlier 계산
        const processedVideos = processVideos(
          apiVideos,
          channel.id,
          channel.regionCode,
          channel.overallAvgView,
          channel.subscriberCount
        );

        // 쇼츠와 일반 영상 분리
        const shortsVideos: VideoData[] = [];
        const regularVideos: VideoData[] = [];

        for (const video of processedVideos) {
          if (isShortsVideo(video.duration, video.title)) {
            shortsVideos.push(video);
          } else {
            regularVideos.push(video);
          }
        }

        // outlier가 높은 영상들만 필터링 (outlierView 기준)
        const highOutlierRegularVideos = regularVideos.filter((video) => {
          return (
            video.outlierView !== null && video.outlierView >= MIN_OUTLIER_VIEW
          );
        });

        const highOutlierShortsVideos = shortsVideos.filter((video) => {
          return (
            video.outlierView !== null && video.outlierView >= MIN_OUTLIER_VIEW
          );
        });

        // 일반 영상을 YoutubeVideo 테이블에 저장
        for (const video of highOutlierRegularVideos) {
          try {
            await prisma.youtubeVideo.upsert({
              where: { id: video.id },
              update: {
                title: video.title,
                description: video.description,
                thumbnailUrl: video.thumbnailUrl,
                publishedAt: video.publishedAt,
                duration: video.duration,
                viewCount: video.viewCount,
                likeCount: video.likeCount,
                commentCount: video.commentCount,
                viewsPerHour: video.viewsPerHour,
                outlierVph: video.outlierVph,
                outlierView: video.outlierView,
                regionCode: channel.regionCode,
                categoryId: video.categoryId,
                crawledAt: new Date(),
              },
              create: {
                id: video.id,
                channelId: channel.id,
                title: video.title,
                description: video.description,
                thumbnailUrl: video.thumbnailUrl,
                publishedAt: video.publishedAt,
                duration: video.duration,
                viewCount: video.viewCount,
                likeCount: video.likeCount,
                commentCount: video.commentCount,
                viewsPerHour: video.viewsPerHour,
                outlierVph: video.outlierVph,
                outlierView: video.outlierView,
                regionCode: channel.regionCode,
                categoryId: video.categoryId,
                crawledAt: new Date(),
              },
            });
            totalVideosSaved++;
          } catch (error) {
            console.error(
              `[${channel.title}] 영상 저장 실패 (${video.id}):`,
              error
            );
          }
        }

        // 쇼츠를 YoutubeShorts 테이블에 저장
        for (const video of highOutlierShortsVideos) {
          try {
            await prisma.youtubeShorts.upsert({
              where: { id: video.id },
              update: {
                title: video.title,
                description: video.description,
                thumbnailUrl: video.thumbnailUrl,
                publishedAt: video.publishedAt,
                duration: video.duration,
                viewCount: video.viewCount,
                likeCount: video.likeCount,
                commentCount: video.commentCount,
                viewsPerHour: video.viewsPerHour,
                outlierVph: video.outlierVph,
                outlierView: video.outlierView,
                regionCode: channel.regionCode,
                categoryId: video.categoryId,
                crawledAt: new Date(),
              },
              create: {
                id: video.id,
                channelId: channel.id,
                title: video.title,
                description: video.description,
                thumbnailUrl: video.thumbnailUrl,
                publishedAt: video.publishedAt,
                duration: video.duration,
                viewCount: video.viewCount,
                likeCount: video.likeCount,
                commentCount: video.commentCount,
                viewsPerHour: video.viewsPerHour,
                outlierVph: video.outlierVph,
                outlierView: video.outlierView,
                regionCode: channel.regionCode,
                categoryId: video.categoryId,
                crawledAt: new Date(),
              },
            });
            totalVideosSaved++;
            totalShortsSaved++;
          } catch (error) {
            console.error(
              `[${channel.title}] 쇼츠 저장 실패 (${video.id}):`,
              error
            );
          }
        }

        console.log(
          `[${channel.title}] 처리 완료: ${apiVideos.length}개 조회, 일반 영상 ${highOutlierRegularVideos.length}개, 쇼츠 ${highOutlierShortsVideos.length}개 저장`
        );

        channelsProcessed++;

        // API 쿼터 고려하여 딜레이
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`[${channel.title}] 처리 실패:`, error);
        // 개별 채널 실패는 무시하고 계속 진행
      }
    }

    return {
      success: true,
      channelsProcessed,
      totalChannels: channels.length,
      videosProcessed: totalVideosProcessed,
      videosSaved: totalVideosSaved - totalShortsSaved, // 일반 영상 개수
      shortsSaved: totalShortsSaved, // 쇼츠 개수
      regionCode: regionCode || "all",
    };
  } catch (e: any) {
    throw new Error(e?.message || "cron failed");
  }
}
