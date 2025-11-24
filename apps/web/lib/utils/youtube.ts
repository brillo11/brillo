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
 * YouTube URL 유효성 검사
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}
