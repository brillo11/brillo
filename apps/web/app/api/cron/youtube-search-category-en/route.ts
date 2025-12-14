import { NextRequest, NextResponse } from "next/server";
import { runYoutubePopularCronByCategory } from "@/serverActions/youtube/youtube-cron-job";

// 영어 카테고리 전체 (1-50)
const CATEGORY_START = 1;
const CATEGORY_END = 50;
const REGION = "US";

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
    const apiKey = process.env.YOUTUBE_DATA_API_KEY_EN;
    if (!apiKey) {
      throw new Error("YOUTUBE_DATA_API_KEY_EN is not set");
    }

    const result = await runYoutubePopularCronByCategory(
      CATEGORY_START,
      CATEGORY_END,
      REGION,
      apiKey
    );

    return NextResponse.json({
      ...result,
      categoryRange: `${CATEGORY_START}-${CATEGORY_END}`,
      region: REGION,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        success: false,
        error: e?.message || "cron failed",
        categoryRange: `${CATEGORY_START}-${CATEGORY_END}`,
        region: REGION,
      },
      { status: 500 }
    );
  }
}
