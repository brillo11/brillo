import { NextRequest, NextResponse } from "next/server";
import { runYoutubePopularCronByCategory } from "@/serverActions/youtube/youtube-cron-job";

// 카테고리 범위 정의
const CATEGORY_START = 21;
const CATEGORY_END = 25;

// Vercel Cron Job 인증: Authorization Bearer 토큰
function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("Authorization");
  const expectedToken = process.env.CRON_SECRET || "";

  if (!authHeader || !expectedToken) {
    return false;
  }

  const token = authHeader.replace(/^Bearer\s+/i, "");
  return token === expectedToken;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const region = req.nextUrl.searchParams.get("region") || "KR";
    const targetCount = Math.min(
      Math.max(parseInt(req.nextUrl.searchParams.get("count") || "200", 10), 1),
      200
    );

    const result = await runYoutubePopularCronByCategory(
      CATEGORY_START,
      CATEGORY_END,
      region,
      targetCount
    );

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "cron failed" },
      { status: 500 }
    );
  }
}
