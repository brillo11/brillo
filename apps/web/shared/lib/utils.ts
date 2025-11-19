import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const koreanToGradeEnum = (koreanGrade: string) => {
  const gradeMap: Record<string, string> = {
    실버: "SILVER",
    골드: "GOLD",
    플래티넘: "PLATINUM",
    다이아: "DIAMOND"
  };

  return gradeMap[koreanGrade] || koreanGrade.toUpperCase();
};

export const koreanToFeedbackTypeEnum = (koreanType: string) => {
  const typeMap: Record<string, string> = {
    트레이너: "TRAINER",
    대표원장: "MASTER"
  };

  return typeMap[koreanType] || koreanType.toUpperCase();
};

export const gradeToKorean = (grade: string) => {
  const gradeMap: Record<string, string> = {
    SILVER: "실버",
    GOLD: "골드",
    PLATINUM: "플래티넘",
    DIAMOND: "다이아"
  };
  return gradeMap[grade] || grade;
};

/**
 * 이름/닉네임을 마스킹 처리합니다.
 * 2글자: 첫 글자 + *
 * 3글자: 앞 2글자 + *
 * 4글자: 앞 2글자 + **
 * 5글자 이상: 앞 3글자 + 나머지 *
 * 그 외: 그대로 반환
 */
export function maskName(name: string): string {
  if (!name) return "";
  if (name.length === 2) return name[0] + "*";
  if (name.length === 3) return name.slice(0, 2) + "*";
  if (name.length === 4) return name.slice(0, 2) + "**";
  if (name.length > 4) return name.slice(0, 3) + "*".repeat(name.length - 3);
  return name;
}
