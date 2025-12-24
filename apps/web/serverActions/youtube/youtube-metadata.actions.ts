"use server";

import { extractVideoId } from "@/lib/utils/youtube";

/**
 * YouTube 영상의 메타데이터(길이 등)를 가져옵니다.
 */
export async function getYouTubeVideoMetadata(url: string): Promise<{
  success: boolean;
  durationSeconds?: number;
  title?: string;
  error?: string;
}> {
  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      return { success: false, error: "유효한 유튜브 ID를 찾을 수 없습니다." };
    }

    const apiKey = process.env.YOUTUBE_DATA_API_STEP4_KEY;
    if (!apiKey) {
      return { success: false, error: "YouTube API 키가 설정되지 않았습니다." };
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoId}&key=${apiKey}`
    );

    if (!response.ok) {
      return { success: false, error: "YouTube API 호출에 실패했습니다." };
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      return { success: false, error: "영상을 찾을 수 없습니다." };
    }

    const item = data.items[0];
    const isoDuration = item.contentDetails.duration; // 예: PT7M29S
    const title = item.snippet.title;

    // ISO 8601 duration을 초 단위로 변환
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
    if (!match) {
      return { success: false, error: "영상 길이를 파싱할 수 없습니다." };
    }

    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    return {
      success: true,
      durationSeconds: totalSeconds,
      title,
    };
  } catch (error) {
    console.error("YouTube 메타데이터 조회 오류:", error);
    return { success: false, error: "메타데이터를 가져오는 중 오류가 발생했습니다." };
  }
}

