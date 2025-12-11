import { NextRequest, NextResponse } from "next/server";
import { runYoutubeVideosCron } from "@/serverActions/youtube/youtube-videos-cron-job";

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
    const region = req.nextUrl.searchParams.get("region") || undefined;
    // Batch 21: 4000-4199 (200개)
    const result = await runYoutubeVideosCron(undefined, region, 4000, 200);

    return NextResponse.json({
      ...result,
      batch: 21,
      range: "4000-4199",
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "cron failed", batch: 21 },
      { status: 500 }
    );
  }
}
