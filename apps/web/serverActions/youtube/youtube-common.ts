/**
 * YouTube 관련 공통 유틸리티 함수들
 * 크론잡과 검색 기능에서 공통으로 사용
 *
 * Note: 순수 유틸리티 함수이므로 "use server" 불필요
 */

/**
 * ISO 8601 duration을 "MM:SS" 형식으로 변환
 * 예: PT4M13S -> "4:13"
 */
export function parseDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) return "0:00";

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * ISO 8601 duration을 초 단위로 변환
 * 예: "PT1M30S" -> 90, "PT60S" -> 60
 */
export function parseDurationToSeconds(isoDuration: string): number {
  if (!isoDuration) return 0;

  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
  if (!match) return 0;

  const hours = Number.parseInt(match[1] ?? "0", 10);
  const minutes = Number.parseInt(match[2] ?? "0", 10);
  const seconds = Number.parseInt(match[3] ?? "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * 재생시간을 초 단위로 변환 (alias)
 */
export function durationToSeconds(duration: string): number {
  return parseDurationToSeconds(duration);
}

/**
 * YouTube Shorts 여부 판단
 * 1. duration이 60초 이하인 경우
 * 2. 제목에 "#shorts" 또는 "#Shorts"가 포함된 경우
 */
export function isShortsVideo(duration: string, title: string = ""): boolean {
  // 제목에 #shorts 포함 여부 확인
  const hasShortsTag = /#shorts/i.test(title);

  // duration이 60초 이하인지 확인
  const durationSeconds = parseDurationToSeconds(duration);
  const isShortDuration = durationSeconds > 0 && durationSeconds <= 60;

  return hasShortsTag || isShortDuration;
}

/**
 * VPH (Views Per Hour) 계산
 */
export function calculateViewsPerHour(
  viewCount: number,
  publishedAt: Date | null
): number | null {
  if (!publishedAt) return null;

  const now = Date.now();
  const publishedTime = publishedAt.getTime();
  if (Number.isNaN(publishedTime)) return null;

  const hoursSincePublished = Math.max(
    (now - publishedTime) / (1000 * 60 * 60),
    1 / 60 // 최소 1분
  );

  const rawVph = viewCount / hoursSincePublished;
  return Number.isFinite(rawVph) ? rawVph : null;
}
