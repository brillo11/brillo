'use server'

import { searchBlogPosts } from './keyword-search';

export interface CompetitorStats {
  success: boolean;
  averageCharacterCount: number; // 공백 제외 평균 글자수
  recommendedLength: "500자" | "1000자" | "2000자"; // 추천 목표 길이
  averageImageCount: number;
  averageDaysAgo: number;
  postCount: number;
  keyword: string;
  error?: string;
}

export async function getCompetitorStats(
  keyword: string,
): Promise<CompetitorStats> {
  if (!keyword) {
    return {
      success: false,
      averageCharacterCount: 0,
      recommendedLength: "1000자",
      averageImageCount: 0,
      averageDaysAgo: 0,
      postCount: 0,
      keyword: "",
      error: "키워드가 없습니다.",
    };
  }

  try {
    const result = await searchBlogPosts(keyword, 5); // 상위 5개 분석

    if (!result.success || result.posts.length === 0) {
      return {
        success: false,
        averageCharacterCount: 0,
        recommendedLength: "1000자",
        averageImageCount: 0,
        averageDaysAgo: 0,
        postCount: 0,
        keyword,
        error: result.error || "검색 결과를 찾을 수 없습니다.",
      };
    }

    const posts = result.posts;
    let totalCharsNoSpaces = 0;
    let totalImages = 0;
    let totalDays = 0;
    let validCharPosts = 0;

    posts.forEach((post) => {
      // 본문 글자수 계산 (HTML 태그 제거 및 공백 완전 제거)
      if (post.fullContent) {
        const textOnlyNoSpaces = post.fullContent
          .replace(/<[^>]+>/g, "")
          .replace(/\s+/g, "")
          .trim();
        totalCharsNoSpaces += textOnlyNoSpaces.length;
        validCharPosts++;
      }
      totalImages += post.imageCount || 0;
      totalDays += post.daysAgo || 0;
    });

    const postCount = posts.length;
    const avgChars = Math.round(totalCharsNoSpaces / (validCharPosts || 1));

    // 500, 1000, 2000 중 가장 가까운 숫자 선택
    const lengths = [500, 1000, 2000];
    const closest = lengths.reduce((prev, curr) =>
      Math.abs(curr - avgChars) < Math.abs(prev - avgChars) ? curr : prev,
    );

    return {
      success: true,
      keyword,
      postCount,
      averageCharacterCount: avgChars,
      recommendedLength: `${closest}자` as any,
      averageImageCount: Math.round(totalImages / postCount),
      averageDaysAgo: Math.round(totalDays / postCount),
    };
  } catch (error) {
    console.error("Competitor stats error:", error);
    return {
      success: false,
      averageCharacterCount: 0,
      recommendedLength: "1000자",
      averageImageCount: 0,
      averageDaysAgo: 0,
      postCount: 0,
      keyword,
      error: "분석 중 오류가 발생했습니다.",
    };
  }
}

