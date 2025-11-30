import { NextRequest, NextResponse } from "next/server";
import { runYoutubePopularCron } from "@/serverActions/youtube/youtube-cron-job";

// Simple auth via header token
function isAuthorized(req: NextRequest): boolean {
  const token = req.headers.get("x-cron-token");
  const expected = process.env.CRON_AUTH_TOKEN || "";
  return expected.length > 0 && token === expected;
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

    const result = await runYoutubePopularCron(region, targetCount);

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "cron failed" },
      { status: 500 }
    );
  }
}
