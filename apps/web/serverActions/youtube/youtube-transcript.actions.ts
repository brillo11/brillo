"use server";

import { YoutubeTranscript } from "youtube-transcript-plus";

/**
 * YouTube URL에서 비디오 ID 추출
 */
function extractVideoId(url: string): string | null {
  if (!url) {
    console.log(`[extractVideoId] URL이 비어있음`);
    return null;
  }

  console.log(`[extractVideoId] 입력 URL:`, url);

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    if (!pattern) continue;

    const match = url.match(pattern);
    console.log(`[extractVideoId] 패턴 ${i + 1} 시도:`, {
      pattern: pattern.toString(),
      match: match,
      extracted: match?.[1],
    });

    if (match && match[1]) {
      const videoId = match[1];
      console.log(`[extractVideoId] 성공! 추출된 videoId:`, videoId);
      return videoId;
    }
  }

  console.log(`[extractVideoId] 실패: 모든 패턴 매칭 실패`);
  return null;
}

/**
 * YouTube Transcript를 사용하여 자막 추출 (서버 액션)
 * youtube-transcript 라이브러리 사용
 */
export async function getYouTubeTranscript(youtubeUrl: string) {
  console.log(`[getYouTubeTranscript] ========== 시작 ==========`);
  console.log(`[getYouTubeTranscript] 입력 URL:`, youtubeUrl);

  try {
    // 1. videoId 추출
    const videoId = extractVideoId(youtubeUrl);

    if (!videoId) {
      console.error(`[getYouTubeTranscript] videoId 추출 실패`);
      return {
        success: false,
        error: "유효한 YouTube URL이 아닙니다.",
        debug: {
          inputUrl: youtubeUrl,
        },
      };
    }

    console.log(`[getYouTubeTranscript] 추출된 videoId:`, {
      videoId,
      videoIdType: typeof videoId,
      videoIdLength: videoId.length,
    });

    // 2. 한국어 자막 시도
    let transcript;
    let lastError: any = null;
    let attemptLog: Array<{
      language: string;
      success: boolean;
      error?: string;
      length?: number;
    }> = [];

    try {
      console.log(`[getYouTubeTranscript] 한국어 자막 시도 중...`);
      const startTime = Date.now();

      transcript = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: "ko",
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      console.log(`[getYouTubeTranscript] 한국어 자막 응답:`, {
        length: transcript?.length,
        type: typeof transcript,
        isArray: Array.isArray(transcript),
        firstItem: transcript?.[0],
        sample: transcript?.slice(0, 3),
        responseTime: `${responseTime}ms`,
        fullStructure: JSON.stringify(transcript?.slice(0, 2), null, 2),
      });

      attemptLog.push({
        language: "ko",
        success: true,
        length: transcript?.length,
      });

      if (transcript && transcript.length > 0) {
        console.log(
          `[getYouTubeTranscript] 한국어 자막 성공! ${transcript.length}개 항목`
        );
      } else {
        console.warn(
          `[getYouTubeTranscript] ⚠️ 한국어 자막이 빈 배열로 반환됨`
        );
        throw new Error("한국어 자막이 빈 배열입니다");
      }
    } catch (koError: any) {
      console.log(`[getYouTubeTranscript] 한국어 자막 실패:`, {
        message: koError.message,
        name: koError.name,
        error: koError,
      });
      attemptLog.push({
        language: "ko",
        success: false,
        error: koError.message,
      });

      // 한국어 자막이 없으면 에러 반환
      return {
        success: false,
        error: "이 비디오에는 한국어 자막이 없습니다.",
        details: koError.message,
        debug: {
          videoId,
          attemptLog,
          errorMessage: koError.message,
        },
      };
    }

    // 5. 최종 검증
    if (!transcript || transcript.length === 0) {
      console.log(`[getYouTubeTranscript] 자막 배열이 비어있음:`, {
        transcript,
        transcriptType: typeof transcript,
        isArray: Array.isArray(transcript),
        keys: transcript ? Object.keys(transcript) : null,
        stringified: JSON.stringify(transcript, null, 2),
      });

      return {
        success: false,
        error: "이 비디오에는 자막이 없습니다.",
        debug: {
          videoId,
          transcriptType: typeof transcript,
          isArray: Array.isArray(transcript),
          length: transcript?.length,
          rawTranscript: transcript,
          rawTranscriptStringified: JSON.stringify(transcript, null, 2),
          attemptLog,
        },
      };
    }

    // 6. 데이터 매핑
    console.log(
      `[getYouTubeTranscript] 최종 성공: ${transcript.length}개 항목 추출됨`
    );
    console.log(`[getYouTubeTranscript] 첫 번째 항목 구조:`, {
      item: transcript[0],
      keys: Object.keys(transcript[0] || {}),
      hasText: "text" in (transcript[0] || {}),
      hasOffset: "offset" in (transcript[0] || {}),
      fullItem: JSON.stringify(transcript[0], null, 2),
    });

    const mappedTranscript = transcript.map((item: any, index: number) => {
      if (index < 3) {
        console.log(`[getYouTubeTranscript] 매핑 중 [${index}]:`, {
          item,
          text: item.text,
          offset: item.offset,
          duration: item.duration,
          keys: Object.keys(item),
          fullItem: JSON.stringify(item, null, 2),
        });
      }
      return {
        text: item.text || item.utf8 || String(item),
        start: item.offset ? item.offset / 1000 : item.start || 0,
      };
    });

    console.log(
      `[getYouTubeTranscript] 매핑된 결과 샘플:`,
      mappedTranscript.slice(0, 3)
    );

    return {
      success: true,
      transcript: mappedTranscript,
      debug: {
        videoId,
        originalLength: transcript.length,
        mappedLength: mappedTranscript.length,
        attemptLog,
        rawResponse: transcript,
        rawResponseStringified: JSON.stringify(transcript.slice(0, 5), null, 2),
      },
    };
  } catch (error: any) {
    console.error("[getYouTubeTranscript] 전체 오류:", {
      message: error?.message,
      name: error?.name,
      error: error,
    });

    const errorMessage = error?.message || "";

    // 구체적인 에러 메시지
    if (
      errorMessage.includes("Transcript is disabled") ||
      errorMessage.includes("transcript is disabled")
    ) {
      return {
        success: false,
        error: "이 비디오는 자막이 비활성화되어 있습니다.",
        details: errorMessage,
        debug: {
          errorMessage,
        },
      };
    }

    if (
      errorMessage.includes("Video unavailable") ||
      errorMessage.includes("video unavailable") ||
      errorMessage.includes("Could not retrieve a transcript")
    ) {
      return {
        success: false,
        error: "비디오를 찾을 수 없거나 자막에 접근할 수 없습니다.",
        details: errorMessage,
        debug: {
          errorMessage,
        },
      };
    }

    if (
      errorMessage.includes("No captions found") ||
      errorMessage.includes("no captions")
    ) {
      return {
        success: false,
        error: "이 비디오에는 사용 가능한 자막이 없습니다.",
        details: errorMessage,
        debug: {
          errorMessage,
        },
      };
    }

    return {
      success: false,
      error: errorMessage || "자막을 추출할 수 없습니다.",
      details: error?.toString(),
      debug: {
        errorMessage,
        errorName: error?.name,
      },
    };
  }
}
