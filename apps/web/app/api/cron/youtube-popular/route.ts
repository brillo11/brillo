"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";

// Simple auth via header token
function isAuthorized(req: NextRequest): boolean {
  const token = req.headers.get("x-cron-token");
  const expected = process.env.CRON_AUTH_TOKEN || "";
  return expected.length > 0 && token === expected;
}

// Fetch most popular videos with pagination up to targetCount
async function fetchMostPopular(regionCode: string, targetCount: number) {
  const apiKey = process.env.YOUTUBE_DATA_API_KEY!;
  const collected: any[] = [];
  let pageToken: string | undefined = undefined;

  while (collected.length < targetCount) {
    const params = new URLSearchParams({
      part: "snippet,contentDetails,statistics",
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

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const region = (
      req.nextUrl.searchParams.get("region") || "KR"
    ).toUpperCase();
    const targetCount = Math.min(
      Math.max(parseInt(req.nextUrl.searchParams.get("count") || "200", 10), 1),
      200
    );

    const apiKey = process.env.YOUTUBE_DATA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "YOUTUBE_DATA_API_KEY is not set" },
        { status: 500 }
      );
    }

    const items = await fetchMostPopular(region, targetCount);
    const now = Date.now();

    // Group by channelId
    const channelIdSet = new Set<string>();
    for (const it of items) {
      const chId = it?.snippet?.channelId;
      if (chId) channelIdSet.add(chId);
    }
    const channelIds = Array.from(channelIdSet);

    // Fetch channels (stats + uploads)
    const chParams = new URLSearchParams({
      part: "statistics,contentDetails,snippet",
      id: channelIds.join(","),
      key: apiKey!,
    });
    const chRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?${chParams.toString()}`
    );
    const chData = chRes.ok ? await chRes.json() : { items: [] };
    const chUploadsMap: Record<string, string> = {};
    const chMeta: Record<
      string,
      { title: string; thumb: string; overallAvg?: number }
    > = {};
    for (const ch of chData.items || []) {
      const totalViews = parseInt(ch.statistics?.viewCount || "0", 10);
      const videoCount = parseInt(ch.statistics?.videoCount || "0", 10);
      const overallAvg =
        videoCount > 0 && Number.isFinite(totalViews)
          ? totalViews / videoCount
          : undefined;
      chUploadsMap[ch.id] = ch.contentDetails?.relatedPlaylists?.uploads || "";
      chMeta[ch.id] = {
        title: ch.snippet?.title || "",
        thumb:
          ch.snippet?.thumbnails?.high?.url ||
          ch.snippet?.thumbnails?.default?.url ||
          "",
        overallAvg,
      };
    }

    // Compute recent avg VPH per channel
    const recentAvgVph: Record<string, number> = {};
    const RECENT_COUNT = 10;
    await Promise.all(
      Object.entries(chUploadsMap).map(async ([channelId, uploads]) => {
        if (!uploads) return;
        const plParams = new URLSearchParams({
          part: "contentDetails",
          playlistId: uploads,
          maxResults: String(RECENT_COUNT),
          key: apiKey!,
        });
        const plRes = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?${plParams.toString()}`
        );
        if (!plRes.ok) return;
        const plData = await plRes.json();
        const vIds = (plData.items || [])
          .map((i: any) => i?.contentDetails?.videoId)
          .filter(Boolean);
        if (vIds.length === 0) return;
        const vdParams = new URLSearchParams({
          part: "snippet,statistics",
          id: vIds.join(","),
          key: apiKey!,
        });
        const vdRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?${vdParams.toString()}`
        );
        if (!vdRes.ok) return;
        const vdData = await vdRes.json();
        const vphs: number[] = [];
        for (const v of vdData.items || []) {
          const views = parseInt(v.statistics?.viewCount || "0", 10);
          const pub = v.snippet?.publishedAt;
          if (!pub || Number.isNaN(views)) continue;
          const t = new Date(pub).getTime();
          if (Number.isNaN(t)) continue;
          const hours = Math.max((now - t) / (1000 * 60 * 60), 1 / 60);
          const vph = views / hours;
          if (Number.isFinite(vph)) vphs.push(vph);
        }
        if (vphs.length === 0) return;
        recentAvgVph[channelId] = vphs.reduce((a, b) => a + b, 0) / vphs.length;
      })
    );

    // Upsert channels
    for (const channelId of channelIds) {
      const meta = chMeta[channelId] || {
        title: "",
        thumb: "",
        overallAvg: undefined,
      };
      await prisma.youtubeChannel.upsert({
        where: { id: channelId },
        update: {
          title: meta.title,
          thumbnailUrl: meta.thumb,
          regionCode: region,
          overallAvgView: meta.overallAvg,
          recentAvgVph: recentAvgVph[channelId],
          lastCrawledAt: new Date(),
        },
        create: {
          id: channelId,
          title: meta.title,
          thumbnailUrl: meta.thumb,
          regionCode: region,
          overallAvgView: meta.overallAvg,
          recentAvgVph: recentAvgVph[channelId],
          lastCrawledAt: new Date(),
        },
      });
    }

    // Upsert videos with computed vph/outliers
    for (const it of items) {
      const snippet = it.snippet || {};
      const stats = it.statistics || {};
      const details = it.contentDetails || {};
      const channelId = snippet.channelId || "";
      const videoId = it.id;
      if (!channelId || !videoId) continue;

      const viewCount = parseInt(stats.viewCount || "0", 10);
      let viewsPerHour: number | null = null;
      if (snippet.publishedAt) {
        const t = new Date(snippet.publishedAt).getTime();
        if (!Number.isNaN(t)) {
          const hours = Math.max((now - t) / (1000 * 60 * 60), 1 / 60);
          const vph = viewCount / hours;
          viewsPerHour = Number.isFinite(vph) ? vph : null;
        }
      }
      const avgVph = recentAvgVph[channelId];
      const outlierVph =
        viewsPerHour !== null && avgVph && avgVph > 0
          ? viewsPerHour / avgVph
          : null;

      const overallAvg = chMeta[channelId]?.overallAvg;
      const outlierView =
        overallAvg && overallAvg > 0 ? viewCount / overallAvg : null;

      const thumbnailUrl =
        snippet?.thumbnails?.maxres?.url ||
        snippet?.thumbnails?.high?.url ||
        snippet?.thumbnails?.medium?.url ||
        snippet?.thumbnails?.default?.url ||
        "";

      await prisma.youtubeVideo.upsert({
        where: { id: videoId },
        update: {
          channelId,
          title: snippet.title || "",
          description: snippet.description || "",
          thumbnailUrl,
          publishedAt: snippet.publishedAt
            ? new Date(snippet.publishedAt)
            : null,
          duration: details.duration || "",
          viewCount: Number.isNaN(viewCount) ? 0 : viewCount,
          likeCount: stats.likeCount ? parseInt(stats.likeCount, 10) : null,
          commentCount: stats.commentCount
            ? parseInt(stats.commentCount, 10)
            : null,
          viewsPerHour,
          outlierVph,
          outlierView,
          regionCode: region,
          crawledAt: new Date(),
        },
        create: {
          id: videoId,
          channelId,
          title: snippet.title || "",
          description: snippet.description || "",
          thumbnailUrl,
          publishedAt: snippet.publishedAt
            ? new Date(snippet.publishedAt)
            : null,
          duration: details.duration || "",
          viewCount: Number.isNaN(viewCount) ? 0 : viewCount,
          likeCount: stats.likeCount ? parseInt(stats.likeCount, 10) : null,
          commentCount: stats.commentCount
            ? parseInt(stats.commentCount, 10)
            : null,
          viewsPerHour,
          outlierVph,
          outlierView,
          regionCode: region,
        },
      });
    }

    return NextResponse.json({
      success: true,
      channels: channelIds.length,
      videosProcessed: items.length,
      region,
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "cron failed" },
      { status: 500 }
    );
  }
}
