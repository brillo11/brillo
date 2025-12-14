/**
 * YouTube 카테고리 ID를 한글 이름으로 매핑
 * YouTube Data API v3의 videoCategories 리소스 기반
 */

export const YOUTUBE_CATEGORY_MAP: Record<string, string> = {
  "1": "영화 & 애니메이션",
  "2": "자동차 & 차량",
  "10": "음악",
  "15": "반려동물 & 동물",
  "17": "스포츠",
  "18": "단편 영화",
  "19": "여행 & 이벤트",
  "20": "게임",
  "21": "비디오 블로그",
  "22": "인물 & 블로그",
  "23": "코미디",
  "24": "엔터테인먼트",
  "25": "뉴스 & 정치",
  "26": "노하우 & 스타일",
  "27": "교육",
  "28": "과학 & 기술",
  "30": "영화",
  "31": "애니메이션",
  "32": "액션/어드벤처",
  "33": "클래식",
  "34": "코미디",
  "35": "다큐멘터리",
  "36": "드라마",
  "37": "가족",
  "38": "해외",
  "39": "공포",
  "40": "SF/판타지",
  "41": "스릴러",
  "42": "쇼츠",
  "43": "쇼",
  "44": "예고편",
};

/**
 * 실제 존재하는 YouTube 카테고리 ID 목록
 */
export const YOUTUBE_CATEGORY_IDS = Object.keys(YOUTUBE_CATEGORY_MAP);

/**
 * 카테고리 ID를 그룹으로 분할
 * Group 1: 초반 카테고리 (1-20 범위)
 * Group 2: 후반 카테고리 (21-44 범위)
 */
export const YOUTUBE_CATEGORY_GROUPS = {
  GROUP_1: YOUTUBE_CATEGORY_IDS.filter((id) => parseInt(id) <= 20),
  GROUP_2: YOUTUBE_CATEGORY_IDS.filter((id) => parseInt(id) >= 21),
} as const;

/**
 * 카테고리 ID를 한글 이름으로 변환
 * @param categoryId - YouTube 카테고리 ID
 * @returns 한글 카테고리 이름 또는 "기타"
 */
export function getCategoryName(categoryId: string | null | undefined): string {
  if (!categoryId) return "기타";
  return YOUTUBE_CATEGORY_MAP[categoryId] || "기타";
}
