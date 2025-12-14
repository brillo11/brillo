import { NextRequest, NextResponse } from "next/server";
import { runYoutubePopularCronByCategory } from "@/serverActions/youtube/youtube-cron-job";

// 한국 카테고리 전체 (1-56)
const CATEGORY_START = 1;
const CATEGORY_END = 56;
const REGION = "KR";

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
    const result = await runYoutubePopularCronByCategory(
      CATEGORY_START,
      CATEGORY_END,
      REGION
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
