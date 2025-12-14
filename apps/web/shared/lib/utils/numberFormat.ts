
/**
 * 숫자를 k, m 단위로 포맷팅합니다.
 * 1000 미만: 그대로 표시
 * 1000 이상: k (1.1k)
 * 1,000,000 이상: m (1.1m)
 */
export function formatCount(count: number | null | undefined): string {
  if (count === null || count === undefined) return "-";
  if (count < 1000) return count.toLocaleString();

  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}m`;
  }

  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }

  return count.toLocaleString();
}
