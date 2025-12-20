"use server";

import { prisma } from "@repo/database";

export type OutlierType = "outlierVph" | "outlierView" | "outlierSubscriber";

export interface PrecomputedVideo {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string;
  channelId: string | null;
  channelTitle: string;
  channelSubscriberCount: number | null;
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
  limit = 500,
  regionCode?: string,
  outlierType: OutlierType = "outlierView",
  minOutlierValue: number = 1.4,
  minViewsPerHour: number = 10
) {
  // const videos = await prisma.youtubeVideo.findMany({
  //   where: {
  //     ...(regionCode ? { regionCode } : {}),
  //     // outlierType에 해당하는 값이 minOutlierValue 이상인 경우만 필터링
  //     [outlierType]: { gte: minOutlierValue },
  //     // viewsPerHour가 minViewsPerHour 이상인 경우만 필터링 (DB 레벨에서 처리)
  //     viewsPerHour: { gte: minViewsPerHour },
  //   } as any,
  //   orderBy: [
  //     { [outlierType]: "desc" },
  //     { viewsPerHour: "desc" },
  //     { viewCount: "desc" },
  //   ],
  //   take: Math.max(limit, 1),
  //   include: {
  //     channel: true,
  //   },
  // });

  // return videos.map((v) => ({
  //   id: v.id,
  //   title: v.title,
  //   description: v.description,
  //   thumbnailUrl: v.thumbnailUrl,
  //   channelId: v.channelId,
  //   channelTitle: v.channel?.title || "",
  //   channelSubscriberCount: v.channel?.subscriberCount || null,
  //   publishedAt: v.publishedAt,
  //   viewCount: v.viewCount,
  //   likeCount: v.likeCount,
  //   commentCount: v.commentCount,
  //   duration: v.duration,
  //   viewsPerHour: v.viewsPerHour,
  //   outlierVph: v.outlierVph,
  //   outlierView: v.outlierView,
  //   outlierSubscriber: v.outlierSubscriber,
  //   regionCode: v.regionCode,
  //   categoryId: v.categoryId,
  // })) as PrecomputedVideo[];
}

export async function getTopPrecomputedShorts(
  limit = 500,
  regionCode?: string,
  outlierType: OutlierType = "outlierView",
  minOutlierValue: number = 1.4,
  minViewsPerHour: number = 10
) {
  // const shorts = await prisma.youtubeShorts.findMany({
  //   where: {
  //     ...(regionCode ? { regionCode } : {}),
  //     [outlierType]: { gte: minOutlierValue },
  //     viewsPerHour: { gte: minViewsPerHour },
  //   },
  //   orderBy: [
  //     { [outlierType]: "desc" },
  //     { viewsPerHour: "desc" },
  //     { viewCount: "desc" },
  //   ],
  //   take: Math.max(limit, 1),
  //   include: {
  //     channel: true,
  //   },
  // });

  // return shorts.map((s) => ({
  //   id: s.id,
  //   title: s.title,
  //   description: s.description,
  //   thumbnailUrl: s.thumbnailUrl,
  //   channelId: s.channelId,
  //   channelTitle: s.channel?.title || "",
  //   channelSubscriberCount: s.channel?.subscriberCount || null,
  //   publishedAt: s.publishedAt,
  //   viewCount: s.viewCount,
  //   likeCount: s.likeCount,
  //   commentCount: s.commentCount,
  //   duration: s.duration,
  //   viewsPerHour: s.viewsPerHour,
  //   outlierVph: s.outlierVph,
  //   outlierView: s.outlierView,
  //   outlierSubscriber: s.outlierSubscriber,
  //   regionCode: s.regionCode,
  //   categoryId: s.categoryId,
  // })) as PrecomputedVideo[];
}
