"use server";

/**
 * YouTube URL에서 비디오 ID 추출
 */
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * YouTube Data API를 사용하여 자막(대본) 추출
 */
export async function getYouTubeCaptions(youtubeUrl: string) {
  try {
    const videoId = extractVideoId(youtubeUrl);

    if (!videoId) {
      return {
        success: false,
        error: "유효한 YouTube URL이 아닙니다.",
      };
    }

    const apiKey = process.env.YOUTUBE_DATA_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        error: "YouTube Data API 키가 설정되지 않았습니다.",
      };
    }

    // 1. 비디오 정보 가져오기
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`
    );

    if (!videoResponse.ok) {
      return {
        success: false,
        error: "YouTube 비디오 정보를 가져올 수 없습니다.",
      };
    }

    const videoData = await videoResponse.json();

    if (!videoData.items || videoData.items.length === 0) {
      return {
        success: false,
        error: "비디오를 찾을 수 없습니다.",
      };
    }

    // 2. 자막 목록 가져오기
    const captionsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&key=${apiKey}&part=snippet`
    );

    if (!captionsResponse.ok) {
      return {
        success: false,
        error: "자막 목록을 가져올 수 없습니다.",
      };
    }

    const captionsData = await captionsResponse.json();

    // 한국어 자막 우선, 없으면 영어, 없으면 첫 번째 자막
    let captionId: string | null = null;
    let captionLanguage = "";

    if (captionsData.items && captionsData.items.length > 0) {
      // 한국어 자막 찾기
      const koreanCaption = captionsData.items.find(
        (item: any) =>
          item.snippet.language === "ko" || item.snippet.language === "ko-KR"
      );

      if (koreanCaption) {
        captionId = koreanCaption.id;
        captionLanguage = koreanCaption.snippet.language;
      } else {
        // 영어 자막 찾기
        const englishCaption = captionsData.items.find(
          (item: any) =>
            item.snippet.language === "en" || item.snippet.language === "en-US"
        );

        if (englishCaption) {
          captionId = englishCaption.id;
          captionLanguage = englishCaption.snippet.language;
        } else {
          // 첫 번째 자막 사용
          captionId = captionsData.items[0].id;
          captionLanguage = captionsData.items[0].snippet.language;
        }
      }
    }

    if (!captionId) {
      return {
        success: false,
        error: "이 비디오에는 자막이 없습니다.",
        videoTitle: videoData.items[0].snippet.title,
      };
    }

    // 3. 자막 다운로드 (OAuth 2.0이 필요하므로 대안 방법 사용)
    // YouTube Data API v3의 captions.download은 OAuth가 필요합니다.
    // 대신 youtube-transcript 라이브러리를 사용하거나, 클라이언트에서 처리해야 합니다.

    // 여기서는 자막 ID와 언어 정보만 반환하고,
    // 실제 자막 추출은 클라이언트에서 youtube-transcript를 사용하도록 안내합니다.

    return {
      success: true,
      videoId,
      videoTitle: videoData.items[0].snippet.title,
      captionId,
      captionLanguage,
      availableCaptions: captionsData.items.map((item: any) => ({
        id: item.id,
        language: item.snippet.language,
        name: item.snippet.name,
      })),
    };
  } catch (error) {
    console.error("YouTube 자막 추출 오류:", error);
    return {
      success: false,
      error: "자막을 가져오는 중 오류가 발생했습니다.",
    };
  }
}

/**
 * YouTube Transcript API를 사용하여 자막 추출 (서버 사이드)
 * youtube-transcript 라이브러리 대신 직접 API 호출
 */
export async function getYouTubeTranscript(youtubeUrl: string) {
  try {
    const videoId = extractVideoId(youtubeUrl);

    if (!videoId) {
      return {
        success: false,
        error: "유효한 YouTube URL이 아닙니다.",
      };
    }

    // youtube-transcript는 클라이언트에서 사용하는 것이 더 적합합니다.
    // 서버에서는 YouTube Data API를 사용하거나,
    // 클라이언트에서 youtube-transcript 라이브러리를 사용하도록 안내합니다.

    // 대안: 외부 API 서비스를 사용하거나 클라이언트에서 처리
    return {
      success: false,
      error:
        "서버에서 직접 자막을 추출할 수 없습니다. 클라이언트에서 처리해주세요.",
      videoId,
    };
  } catch (error) {
    console.error("YouTube 자막 추출 오류:", error);
    return {
      success: false,
      error: "자막을 가져오는 중 오류가 발생했습니다.",
    };
  }
}
