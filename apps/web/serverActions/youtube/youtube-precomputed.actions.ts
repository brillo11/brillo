"use server";

import { prisma } from "@repo/database";
import OpenAI from "openai";

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
    take: Math.min(Math.max(limit, 1), 500),
    include: {
      channel: true,
    },
  });

  const filteredVideos = videos.filter(
    (v) => v.viewsPerHour && v.viewsPerHour >= 10
  );
  return filteredVideos.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    thumbnailUrl: v.thumbnailUrl,
    channelId: v.channelId,
    channelTitle: v.channel?.title || "",
    channelSubscriberCount: v.channel?.subscriberCount || null,
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
  limit = 200,
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
    take: Math.min(Math.max(limit, 1), 200),
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
    channelSubscriberCount: s.channel?.subscriberCount || null,
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
