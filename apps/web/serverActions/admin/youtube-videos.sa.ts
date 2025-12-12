"use server";

import { prisma } from "@repo/database";

export interface YoutubeVideoListItem {
  id: string;
  channelId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: Date | null;
  viewCount: number;
  likeCount: number | null;
  commentCount: number | null;
  viewsPerHour: number | null;
  outlierVph: number | null;
  outlierView: number | null;
  outlierSubscriber: number | null;
  categoryId: number | null;
  regionCode: string | null;
  crawledAt: Date;
  channel: {
    id: string;
    title: string;
    thumbnailUrl: string;
  };
}

export interface GetYoutubeVideosParams {
  page?: number;
  size?: number;
  search?: string;
  regionCode?: string;
  channelId?: string;
  categoryId?: number;
  minOutlierVph?: number;
  minOutlierSubscriber?: number;
}

export interface GetYoutubeVideosResult {
  data: YoutubeVideoListItem[];
  total: number;
  totalPages: number;
  page: number;
  size: number;
}

export async function getYoutubeVideosList({
  page = 1,
  size = 30,
  search,
  regionCode,
  channelId,
  categoryId,
  minOutlierVph,
  minOutlierSubscriber,
}: GetYoutubeVideosParams = {}): Promise<GetYoutubeVideosResult> {
  try {
    const skip = (page - 1) * size;

    // 검색 조건 구성
    const where: any = {};

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (regionCode) {
      where.regionCode = regionCode;
    }

    if (channelId) {
      where.channelId = channelId;
    }

    if (minOutlierVph !== undefined) {
      where.outlierVph = {
        gte: minOutlierVph,
      };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minOutlierSubscriber !== undefined) {
      where.outlierSubscriber = {
        gte: minOutlierSubscriber,
      };
    }

    // 총 개수 조회
    const total = await prisma.youtubeVideo.count({ where });

    // 데이터 조회
    const data = await prisma.youtubeVideo.findMany({
      where,
      skip,
      take: size,
      orderBy: {
        crawledAt: "desc",
      },
      include: {
        channel: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / size);

    return {
      data: data.map((video) => ({
        id: video.id,
        channelId: video.channelId,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        publishedAt: video.publishedAt,
        viewCount: video.viewCount,
        likeCount: video.likeCount,
        commentCount: video.commentCount,
        viewsPerHour: video.viewsPerHour,
        outlierVph: video.outlierVph,
        outlierView: video.outlierView,
        outlierSubscriber: video.outlierSubscriber,
        categoryId: video.categoryId,
        regionCode: video.regionCode,
        crawledAt: video.crawledAt,
        channel: {
          id: video.channel.id,
          title: video.channel.title,
          thumbnailUrl: video.channel.thumbnailUrl,
        },
      })),
      total,
      totalPages,
      page,
      size,
    };
  } catch (error: any) {
    console.error("[getYoutubeVideosList] Error:", error);
    throw new Error(
      error?.message || "영상 목록을 가져오는 중 오류가 발생했습니다."
    );
  }
}
