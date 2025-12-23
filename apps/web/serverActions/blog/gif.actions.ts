'use server'

import { auth } from "@/shared/lib/auth";
import { headers } from "next/headers";

/**
 * 유튜브 URL과 시작 시간 목록을 받아 GIF를 생성합니다.
 */
export async function generateYoutubeGifs(youtubeUrl: string, startTimes: string[]): Promise<{
  success: boolean;
  urls?: string[];
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return { success: false, error: '인증이 필요합니다.' };
    }

    const userId = session.user.id;
    const serverUrl = "http://121.126.124.4:5000/make-gif";

    if (!serverUrl) {
      return { success: false, error: 'GIF 생성 서버 설정이 되어있지 않습니다.' };
    }

    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: youtubeUrl,
        times: startTimes,
        userId: userId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lambda GIF generation failed:', errorText);
      return { success: false, error: 'GIF 생성에 실패했습니다.' };
    }

    const result = await response.json();
    
    if (result.urls && result.urls.length > 0) {
      return {
        success: true,
        urls: result.urls
      };
    }

    return { success: false, error: '생성된 GIF가 없습니다.' };
  } catch (error) {
    console.error('GIF 생성 서버 액션 오류:', error);
    return { success: false, error: '서버 오류가 발생했습니다.' };
  }
}

