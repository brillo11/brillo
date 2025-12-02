"use server";

import { prisma } from "@repo/database";

export interface PrecomputedVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
  publishedAt: Date | null;
  viewCount: number;
  likeCount: number | null;
  commentCount: number | null;
  duration: string;
  viewsPerHour: number | null;
  outlierVph: number | null;
  regionCode: string | null;
}

export async function getTopPrecomputedVideos(limit = 50, regionCode?: string) {
  const videos = await prisma.youtubeVideo.findMany({
    where: {
      ...(regionCode ? { regionCode } : {}),
    },
    orderBy: [
      { outlierVph: "desc" },
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
    regionCode: v.regionCode,
  })) as PrecomputedVideo[];
}

export async function getTopPrecomputedShorts(limit = 50, regionCode?: string) {
  const shorts = await prisma.youtubeShorts.findMany({
    where: {
      ...(regionCode ? { regionCode } : {}),
    },
    orderBy: [
      { outlierVph: "desc" },
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
    regionCode: s.regionCode,
  })) as PrecomputedVideo[];
}
