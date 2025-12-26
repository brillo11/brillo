"use server";

import { prisma } from "@repo/database";
import { requireStudent } from "@/shared/lib/auth-guards";

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

interface HeyGenVideoResponse {
  success: boolean;
  videoId?: string;
  videoUrl?: string; // Only when checking status
  status?: string;   // "pending", "processing", "completed", "failed"
  error?: string;
}

/**
 * HeyGen 비디오 생성 요청
 * @param script 아바타가 읽을 대본
 * @param aspectRatio 영상 비율 ("16:9" | "9:16")
 */
export async function generateHeyGenVideo(script: string, aspectRatio: "16:9" | "9:16" = "16:9"): Promise<HeyGenVideoResponse> {
  try {
    if (!HEYGEN_API_KEY) {
      return { success: false, error: "HeyGen API 키가 설정되지 않았습니다." };
    }

    const session = await requireStudent();
    const userId = session.user.id;

    // 사용자 정보 조회 (avatarId, voiceId 등을 가져오기 위해)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        heygenAvatarId: true,
        heygenVoiceId: true,
        misc: true 
      },
    });

    if (!user) {
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    const avatarId = user.heygenAvatarId || "Abigail_expressive_2024112501"; // Default Avatar (Example)
    const voiceId = user.heygenVoiceId || "fb8c5c3f02854c57a4da182d4ed59467"; // Default Voice (Korean Female Example)
    
    // HeyGen API 호출 (v2 interface)
    const response = await fetch("https://api.heygen.com/v2/video/generate", {
      method: "POST",
      headers: {
        "X-Api-Key": HEYGEN_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: avatarId,
              avatar_style: "normal",
            },
            voice: {
              type: "text",
              input_text: script,
              voice_id: voiceId,
            },
          },
        ],
        dimension: aspectRatio === "16:9" ? { width: 1280, height: 720 } : { width: 720, height: 1280 },
        aspect_ratio: aspectRatio,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("HeyGen API Error:", data);
      return { success: false, error: data.message || "HeyGen 비디오 생성 요청 실패" };
    }

    // data.data.video_id 반환
    return {
      success: true,
      videoId: data.data.video_id,
      status: "pending",
    };

  } catch (error) {
    console.error("generateHeyGenVideo Error:", error);
    return { success: false, error: "서버 내부 오류 발생" };
  }
}

/**
 * HeyGen 비디오 상태 확인
 * @param videoId 비디오 ID
 */
export async function checkHeyGenVideoStatus(videoId: string): Promise<HeyGenVideoResponse> {
  try {
     if (!HEYGEN_API_KEY) {
      return { success: false, error: "HeyGen API 키가 설정되지 않았습니다." };
    }

    const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      method: "GET",
      headers: {
        "X-Api-Key": HEYGEN_API_KEY,
        "Accept": "application/json",
      },
    });

    const data = await response.json();

    console.log("HeyGen Status API Response:", data);
    
    if (!response.ok) {
        console.error("HeyGen Status API Error:", data);
        return { success: false, error: data.message || "상태 확인 실패" };
    }
    
    // data.data.status, data.data.video_url
    const status = data.data.status;
    const videoUrl = data.data.video_url;
    const error = data.data.error;

    if (status === "failed") {
        return { success: false, status: "failed", error: error || "비디오 생성 실패" };
    }

    return {
        success: true,
        videoId: videoId,
        status: status, // "pending", "processing", "completed"
        videoUrl: videoUrl,
    };

  } catch (error) {
    console.error("checkHeyGenVideoStatus Error:", error);
     return { success: false, error: "상태 확인 중 오류 발생" };
  }
}
