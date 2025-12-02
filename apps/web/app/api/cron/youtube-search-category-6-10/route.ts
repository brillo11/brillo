import { NextRequest, NextResponse } from "next/server";
import { runYoutubePopularCronByCategory } from "@/serverActions/youtube/youtube-cron-job";

// 카테고리 범위 정의
const CATEGORY_START = 6;
const CATEGORY_END = 10;

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

    const result = await runYoutubePopularCronByCategory(
      CATEGORY_START,
      CATEGORY_END,
      region
    );

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "cron failed" },
      { status: 500 }
    );
  }
}
