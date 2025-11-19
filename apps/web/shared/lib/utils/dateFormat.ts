export function toDateInputValue(
  date: Date | string | null | undefined
): string {
  if (!date) return "";
  if (typeof date === "string") {
    // 이미 YYYY-MM-DD면 그대로 반환
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    // ISO 문자열이면 앞 10글자만 반환
    if (/^\d{4}-\d{2}-\d{2}T/.test(date)) return date.slice(0, 10);
    // 기타 문자열은 Date로 변환
    return new Date(date).toISOString().slice(0, 10);
  }
  // Date 객체면
  return date.toISOString().slice(0, 10);
}
