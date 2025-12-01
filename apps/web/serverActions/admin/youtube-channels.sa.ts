"use server";

import { prisma } from "@repo/database";

export interface YoutubeChannelListItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  regionCode: string | null;
  videoCount: number | null;
  overallAvgView: number | null;
  uploadsPlaylist: string | null;
  lastCrawledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    videos: number;
  };
}

export interface GetYoutubeChannelsParams {
  page?: number;
  size?: number;
  search?: string;
  regionCode?: string;
}

export interface GetYoutubeChannelsResult {
  data: YoutubeChannelListItem[];
  total: number;
  totalPages: number;
  page: number;
  size: number;
}

export async function getYoutubeChannelsList({
  page = 1,
  size = 30,
  search,
  regionCode,
}: GetYoutubeChannelsParams = {}): Promise<GetYoutubeChannelsResult> {
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

    // 총 개수 조회
    const total = await prisma.youtubeChannel.count({ where });

    // 데이터 조회
    const data = await prisma.youtubeChannel.findMany({
      where,
      skip,
      take: size,
      orderBy: {
        lastCrawledAt: "desc",
      },
      include: {
        _count: {
          select: {
            videos: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / size);

    return {
      data: data.map((ch) => ({
        id: ch.id,
        title: ch.title,
        thumbnailUrl: ch.thumbnailUrl,
        regionCode: ch.regionCode,
        videoCount: ch.videoCount,
        overallAvgView: ch.overallAvgView,
        uploadsPlaylist: ch.uploadsPlaylist,
        lastCrawledAt: ch.lastCrawledAt,
        createdAt: ch.createdAt,
        updatedAt: ch.updatedAt,
        _count: {
          videos: ch._count.videos,
        },
      })),
      total,
      totalPages,
      page,
      size,
    };
  } catch (error: any) {
    console.error("[getYoutubeChannelsList] Error:", error);
    throw new Error(
      error?.message || "채널 목록을 가져오는 중 오류가 발생했습니다."
    );
  }
}
