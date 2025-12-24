/**
 * YouTube URL에서 비디오 ID 추출
 */
export function extractVideoId(url: string): string | null {
  if (!url) {
    console.log(`[extractVideoId] URL이 비어있음`);
    return null;
  }

  console.log(`[extractVideoId] 입력 URL:`, url);

  const patterns = [
    // YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID (우선순위 1)
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
    // 일반 YouTube: https://www.youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    // 일반 YouTube (다른 형식)
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]+)/,
    // 일반 YouTube (다른 형식)
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
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
 * YouTube URL 유효성 검사
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}
