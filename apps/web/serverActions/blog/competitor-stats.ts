'use server'

import { searchBlogPosts } from './keyword-search';

export interface CompetitorStats {
  success: boolean;
  averageCharacterCount: number;
  averageImageCount: number;
  averageDaysAgo: number;
  postCount: number;
  keyword: string;
  error?: string;
}

export async function getCompetitorStats(keyword: string): Promise<CompetitorStats> {
  if (!keyword) {
    return { success: false, averageCharacterCount: 0, averageImageCount: 0, averageDaysAgo: 0, postCount: 0, keyword: '', error: '키워드가 없습니다.' };
  }

  try {
    const result = await searchBlogPosts(keyword, 5); // 상위 5개 분석

    if (!result.success || result.posts.length === 0) {
      return { success: false, averageCharacterCount: 0, averageImageCount: 0, averageDaysAgo: 0, postCount: 0, keyword, error: result.error || '검색 결과를 찾을 수 없습니다.' };
    }

    const posts = result.posts;
    let totalChars = 0;
    let totalImages = 0;
    let totalDays = 0;
    let validCharPosts = 0;

    posts.forEach(post => {
      // 본문 글자수 계산
      if (post.fullContent) {
        const textOnly = post.fullContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        totalChars += textOnly.length;
        validCharPosts++;
      }
      totalImages += post.imageCount || 0;
      totalDays += post.daysAgo || 0;
    });

    const postCount = posts.length;

    return {
      success: true,
      keyword,
      postCount,
      averageCharacterCount: Math.round(totalChars / (validCharPosts || 1)),
      averageImageCount: Math.round(totalImages / postCount),
      averageDaysAgo: Math.round(totalDays / postCount),
    };
  } catch (error) {
    console.error('Competitor stats error:', error);
    return { success: false, averageCharacterCount: 0, averageImageCount: 0, averageDaysAgo: 0, postCount: 0, keyword, error: '분석 중 오류가 발생했습니다.' };
  }
}

