"use server";

const RECENT_VIDEOS_AVG_COUNT = 10;

interface YouTubeVideoItem {
  id: string;
  snippet?: {
    title?: string;
    description?: string;
    channelId?: string;
    channelTitle?: string;
    publishedAt?: string;
    thumbnails?: {
      default?: { url?: string };
      medium?: { url?: string };
      high?: { url?: string };
      standard?: { url?: string };
      maxres?: { url?: string };
    };
  };
  contentDetails?: {
    duration?: string;
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

export interface PopularVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number | null;
  commentCount: number | null;
  duration: string;
  channelId: string | null;
  viewsPerHour: number | null;
  outlierMultiplierRecent: number | null;
  outlierMultiplierOverall: number | null;
}

interface GetPopularVideosResult {
  success: boolean;
  videos?: PopularVideo[];
  error?: string;
}

export async function getPopularVideos(
  regionCode: string = "KR",
  maxResults: number = 12
): Promise<GetPopularVideosResult> {
  try {
    const apiKey = process.env.YOUTUBE_DATA_API_KEY;

    if (!apiKey) {
      console.error("[getPopularVideos] YOUTUBE_DATA_API_KEY is not set");
      return {
        success: false,
        error: "YouTube Data API 키가 설정되지 않았습니다.",
      };
    }

    const safeMaxResults = Math.min(Math.max(maxResults, 1), 50);

    const params = new URLSearchParams({
      part: "snippet,contentDetails,statistics",
      chart: "mostPopular",
      regionCode,
      maxResults: String(safeMaxResults),
      key: apiKey,
    });

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[getPopularVideos] API response not ok", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      return {
        success: false,
        error: "YouTube 인기 영상을 가져오는 중 오류가 발생했습니다.",
      };
    }

    const data = (await response.json()) as { items?: YouTubeVideoItem[] };
    const items = data.items ?? [];

    // 채널별 평균 조회수(전체/최근 N개) 계산을 위한 채널 통계 조회
    const channelIds = Array.from(
      new Set(
        items
          .map((item) => item.snippet?.channelId)
          .filter((id): id is string => Boolean(id))
      )
    );

    let channelOverallAverageMap: Record<string, number> = {};
    let channelUploadsPlaylistIdMap: Record<string, string> = {};

    if (channelIds.length > 0) {
      const channelParams = new URLSearchParams({
        part: "statistics,contentDetails",
        id: channelIds.join(","),
        key: apiKey,
      });

      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?${channelParams.toString()}`
      );

      if (channelResponse.ok) {
        const channelData = (await channelResponse.json()) as {
          items?: Array<{
            id: string;
            statistics?: {
              viewCount?: string;
              videoCount?: string;
            };
            contentDetails?: {
              relatedPlaylists?: {
                uploads?: string;
              };
            };
          }>;
        };

        const channelItems = channelData.items ?? [];
        const overallMap: Record<string, number> = {};
        const uploadsMap: Record<string, string> = {};

        channelItems.forEach((channel) => {
          const stats = channel.statistics ?? {};
          const totalViews = Number.parseInt(stats.viewCount ?? "0", 10);
          const videoCount = Number.parseInt(stats.videoCount ?? "0", 10);

          if (!Number.isNaN(totalViews) && videoCount > 0) {
            overallMap[channel.id] = totalViews / videoCount;
          }
          const uploads = channel.contentDetails?.relatedPlaylists?.uploads;
          if (uploads) uploadsMap[channel.id] = uploads;
        });

        channelOverallAverageMap = overallMap;
        channelUploadsPlaylistIdMap = uploadsMap;
      } else {
        console.error("[getPopularVideos] channels API response not ok", {
          status: channelResponse.status,
          statusText: channelResponse.statusText,
        });
      }
    }

    // 채널별 최근 N개 영상 평균 VPH(views per hour) 계산
    const now = Date.now();
    const recentAvgVphMap: Record<string, number> = {};
    await Promise.all(
      Object.entries(channelUploadsPlaylistIdMap).map(
        async ([channelId, uploadsPlaylistId]) => {
          try {
            const playlistParams = new URLSearchParams({
              part: "contentDetails",
              playlistId: uploadsPlaylistId,
              maxResults: String(RECENT_VIDEOS_AVG_COUNT),
              key: apiKey,
            });
            const plRes = await fetch(
              `https://www.googleapis.com/youtube/v3/playlistItems?${playlistParams.toString()}`
            );
            if (!plRes.ok) return;
            const plData = (await plRes.json()) as {
              items?: Array<{ contentDetails?: { videoId?: string } }>;
            };
            const videoIds = (plData.items ?? [])
              .map((i) => i.contentDetails?.videoId)
              .filter((vId): vId is string => Boolean(vId));
            if (videoIds.length === 0) return;

            // 영상 상세로 조회수 및 업로드 시간 가져오기
            const videoParams = new URLSearchParams({
              part: "snippet,statistics",
              id: videoIds.join(","),
              key: apiKey,
            });
            const vdRes = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?${videoParams.toString()}`
            );
            if (!vdRes.ok) return;
            const vdData = (await vdRes.json()) as {
              items?: Array<{
                snippet?: { publishedAt?: string };
                statistics?: { viewCount?: string };
              }>;
            };
            const vphValues: number[] = [];
            (vdData.items ?? []).forEach((v) => {
              const views = Number.parseInt(v.statistics?.viewCount ?? "0", 10);
              const publishedAt = v.snippet?.publishedAt;
              if (!publishedAt || Number.isNaN(views)) return;

              const publishedTime = new Date(publishedAt).getTime();
              if (Number.isNaN(publishedTime)) return;

              const hoursSincePublished = Math.max(
                (now - publishedTime) / (1000 * 60 * 60),
                1 / 60
              );
              const vph = views / hoursSincePublished;
              if (Number.isFinite(vph)) {
                vphValues.push(vph);
              }
            });

            if (vphValues.length === 0) return;
            const sum = vphValues.reduce((a, b) => a + b, 0);
            recentAvgVphMap[channelId] = sum / vphValues.length;
          } catch (e) {
            // 개별 채널 실패는 무시 (다른 채널 계속)
          }
        }
      )
    );

    const videos: PopularVideo[] = items.map((item) => {
      const snippet = item.snippet ?? {};
      const statistics = item.statistics ?? {};
      const contentDetails = item.contentDetails ?? {};
      const channelId = snippet.channelId ?? null;

      const thumbnailUrl =
        snippet.thumbnails?.maxres?.url ??
        snippet.thumbnails?.high?.url ??
        snippet.thumbnails?.medium?.url ??
        snippet.thumbnails?.default?.url ??
        "";

      const viewCount = Number.parseInt(statistics.viewCount ?? "0", 10);
      const likeCountRaw = statistics.likeCount;
      const commentCountRaw = statistics.commentCount;

      const likeCount =
        typeof likeCountRaw === "string"
          ? Number.parseInt(likeCountRaw, 10)
          : null;
      const commentCount =
        typeof commentCountRaw === "string"
          ? Number.parseInt(commentCountRaw, 10)
          : null;

      // vph (views per hour)
      let viewsPerHour: number | null = null;
      if (snippet.publishedAt) {
        const publishedTime = new Date(snippet.publishedAt).getTime();
        if (!Number.isNaN(publishedTime)) {
          const hoursSincePublished = Math.max(
            (now - publishedTime) / (1000 * 60 * 60),
            1 / 60 // 최소 1분
          );
          const rawVph = viewCount / hoursSincePublished;
          viewsPerHour = Number.isFinite(rawVph) ? rawVph : null;
        }
      }

      // outliers: 채널 평균 대비 배수
      let outlierMultiplierRecent: number | null = null;
      let outlierMultiplierOverall: number | null = null;
      if (channelId) {
        const recentAvgVph = recentAvgVphMap[channelId];
        if (recentAvgVph && recentAvgVph > 0 && viewsPerHour !== null) {
          const raw = viewsPerHour / recentAvgVph;
          outlierMultiplierRecent = Number.isFinite(raw) ? raw : null;
        }
        const overallAvg = channelOverallAverageMap[channelId];
        if (overallAvg && overallAvg > 0) {
          const raw = viewCount / overallAvg;
          outlierMultiplierOverall = Number.isFinite(raw) ? raw : null;
        }
      }

      return {
        id: item.id,
        title: snippet.title ?? "제목 없는 영상",
        description: snippet.description ?? "",
        channelTitle: snippet.channelTitle ?? "",
        publishedAt: snippet.publishedAt ?? "",
        thumbnailUrl,
        viewCount: Number.isNaN(viewCount) ? 0 : viewCount,
        likeCount: Number.isNaN(likeCount ?? 0) ? null : likeCount,
        commentCount: Number.isNaN(commentCount ?? 0) ? null : commentCount,
        duration: contentDetails.duration ?? "",
        channelId,
        viewsPerHour,
        outlierMultiplierRecent,
        outlierMultiplierOverall,
      };
    });

    return {
      success: true,
      videos,
    };
  } catch (error) {
    console.error("[getPopularVideos] Unexpected error", error);
    return {
      success: false,
      error: "YouTube 인기 영상을 가져오는 중 예기치 못한 오류가 발생했습니다.",
    };
  }
}
