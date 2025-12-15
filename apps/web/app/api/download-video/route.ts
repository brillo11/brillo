import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get("url");

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Video URL is required" },
        { status: 400 }
      );
    }

    // CloudFront에서 비디오 가져오기
    const response = await fetch(videoUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }

    // 비디오 데이터를 스트리밍으로 전달
    const blob = await response.blob();

    // 다운로드 헤더와 함께 응답
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="veo-generated-${Date.now()}.mp4"`,
      },
    });
  } catch (error) {
    console.error("Video download error:", error);
    return NextResponse.json(
      { error: "Failed to download video" },
      { status: 500 }
    );
  }
}
