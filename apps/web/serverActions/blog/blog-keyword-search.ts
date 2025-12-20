'use server'
import { generateText } from 'ai';

/**
 * 네이버 블로그 키워드 검색 - 간단 버전
 * 
 * 사용법:
 * const result = await searchBlogPosts('키워드', 7)
 * console.log(result.posts) // 최상위 7개 포스트
 */

// 네이버 검색 API 응답 타입 (SearchList.naver)
interface SearchListPost {
  domainIdOrBlogId: string;
  logNo: string | number;
  postUrl: string;
  title: string;
  contents: string;
  nickName: string;
  blogName: string;
  profileImgUrl: string;
  addDate: number; // timestamp (ms)
  thumbnails?: Array<{ url: string }>;
  hasThumbnail?: boolean;
}

interface SearchListResponse {
  result: {
    searchList: SearchListPost[];
    totalCount: number;
  }
}

// 반환 타입
export interface BlogPost {
  title: string
  blogName: string
  blogId: string
  logNo: string
  publishDate: string // YYYY.MM.DD 형식
  daysAgo: number
  imageCount: number
  url: string
  nickName: string
  thumbnailCount: number
  likeCount: number
  commentCount: number
  quality: number | null
  profileImage?: string
  fullContent?: string // 본문 전체 내용
  keywords?: string[] // 추출된 핵심 키워드
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blogInfo?: Record<string, any> // 블로그 정보 (구독자 수 등)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw?: Record<string, any> // 디버깅용 원본 데이터
}
  
  export interface BlogSearchResult {
    success: boolean
    posts: BlogPost[]
    totalCount: number
    error?: string
  }
  
  // Rate Limiting을 위한 간단한 딜레이 함수
  async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  // 요청 간격을 위한 전역 변수
  let lastRequestTime = 0
  const MIN_REQUEST_INTERVAL = 500 // 0.5초 간격
  
  // Rate Limiting 함수
  async function ensureRequestInterval(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestTime
  
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest
      await delay(waitTime)
    }
  
    lastRequestTime = Date.now()
  }
  
  // User-Agent 로테이션
  const USER_AGENTS = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  ]
  
  function getRandomUserAgent(): string {
    const randomIndex = Math.floor(Math.random() * USER_AGENTS.length)
    if (randomIndex < 0 || randomIndex >= USER_AGENTS.length) {
      return USER_AGENTS[0]!
    }
    return USER_AGENTS[randomIndex]!
  }
  
  // 안전한 fetch 함수
  async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
    await ensureRequestInterval()
  
    const headers = {
      ...options.headers,
      'User-Agent': getRandomUserAgent(),
    }
  
    const finalOptions = {
      ...options,
      headers,
    }
  
    const response = await fetch(url, finalOptions)
  
    if (response.status === 429) {
      await delay(1000)
      return await fetch(url, finalOptions)
    }
  
    return response
  }
  
  // timestamp에서 날짜 차이 계산 (일 단위)
  function calculateDaysAgo(timestampMs: number): number {
    const postDate = new Date(timestampMs)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    postDate.setHours(0, 0, 0, 0)
  
    const diffTime = today.getTime() - postDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
    return diffDays >= 0 ? diffDays : 0
  }
  
  // timestamp를 YYYY.MM.DD 형식으로 변환
  function formatDate(timestampMs: number): string {
    const date = new Date(timestampMs)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
  }
  
  // 네이버 검색 API 호출 (SearchList.naver)
  async function blogSearchAPI(
    query: string,
    page: number,
  ): Promise<SearchListResponse | null> {
    try {
      const encodedQuery = encodeURIComponent(query)
      const url = `https://section.blog.naver.com/ajax/SearchList.naver?countPerPage=7&currentPage=${page}&endDate=&keyword=${encodedQuery}&orderBy=sim&startDate=&type=post`
  
      const response = await safeFetch(url, {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Referer': `https://section.blog.naver.com/Search/Post.naver?pageNo=${page}&rangeType=ALL&orderBy=sim&keyword=${encodedQuery}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
      })
  
      if (!response.ok) return null
  
      const responseText = await response.text()
      const cleanJson = responseText.replace(/^\)\]\}',\r?\n/, '')
      const jsonData = JSON.parse(cleanJson)
  
      // 응답이 배열 형태인 경우 처리
      if (Array.isArray(jsonData)) {
        return {
          result: {
            searchList: jsonData,
            totalCount: jsonData.length
          }
        }
      }

      // result 자체가 배열인 경우 처리
      if (jsonData && Array.isArray(jsonData.result)) {
        return {
          result: {
            searchList: jsonData.result,
            totalCount: jsonData.result.length
          }
        }
      }
  
      if (jsonData && jsonData.result) {
        return jsonData
      }
  
      return null
    } catch (error) {
      console.error('API 호출 오류:', error)
      return null
    }
  }

  /**
   * 포스트의 상세 정보(본문 전체, 이미지수, 공감수, 댓글수 등)를 가져옵니다.
   */
  async function fetchPostExtraData(blogId: string, logNo: string) {
    try {
      // 1. 공감수 가져오기 API
      const likeApiUrl = `https://apis.naver.com/blogserver/like/v1/search/contents?suppress_response_codes=true&pool=blogid&q=BLOG%5B${blogId}_${logNo}%5D&isDuplication=false&cssIds=MULTI_MOBILE%2CBLOG_MOBILE&displayId=BLOG`
      
      // 2. 댓글수 가져오기 API
      const commentApiUrl = `https://apis.naver.com/comment/v1/pages/count?ticket=blog&pool=blog&objectId=blog_${blogId}_${logNo}`

      // 3. 포스트 본문 및 상세 정보 (HTML)
      const postUrl = `https://blog.naver.com/PostView.naver?blogId=${blogId}&logNo=${logNo}`

      const [likeRes, commentRes, postRes] = await Promise.all([
        safeFetch(likeApiUrl, {
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }),
        safeFetch(commentApiUrl, {
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': `https://blog.naver.com/PostView.naver?blogId=${blogId}&logNo=${logNo}`,
            'Origin': 'https://blog.naver.com'
          }
        }),
        safeFetch(postUrl, {
          headers: {
            'User-Agent': getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9',
            'Referer': `https://blog.naver.com/${blogId}`
          }
        })
      ]);

      // 공감수 처리
      let likeCount = 0;
      if (likeRes.ok && likeRes.headers.get('content-type')?.includes('application/json')) {
        const likeData = await likeRes.json();
        if (likeData.contents?.[0]?.reactions) {
          const reactions = likeData.contents[0].reactions;
          const likeReaction = reactions.find((r: { reactionType: string; count: number }) => r.reactionType === 'like')
          if (likeReaction) likeCount = likeReaction.count;
        }
      }

      // 댓글수 처리 (API 우선)
      let commentCount = 0;
      if (commentRes.ok && commentRes.headers.get('content-type')?.includes('application/json')) {
        const commentData = await commentRes.json();
        // 네이버 댓글 API는 보통 result.count 또는 result.totalCount에 수치를 담습니다.
        commentCount = commentData.result?.count || commentData.result?.totalCount || 0;
      }

      if (!postRes.ok) return { likeCount, commentCount, imageCount: 0, fullContent: '', profileImage: undefined };

      const html = await postRes.text();

      // 댓글수 폴백 (API 실패 시 HTML 전체 텍스트에서 검색)
      if (commentCount === 0) {
        const commentPatterns = [
          /commentCount["']?\s*:\s*(\d+)/,
          /comment_count["']?\s*:\s*(\d+)/,
          /totalCount["']?\s*:\s*(\d+)/,
          /"cnt"\s*:\s*(\d+)/,
          /댓글\s*<em[^>]*>(\d+)/i,
          /댓글\s*(\d+)/i,
          /id="commentCount">(\d+)/i,
        ];
        for (const pattern of commentPatterns) {
          const match = html.match(pattern)
          if (match && match[1]) {
            commentCount = parseInt(match[1], 10)
            break
          }
        }
      }

      // 공감수 폴백
      if (likeCount === 0) {
        const likePatterns = [
          /"sympathyCount"\s*:\s*(\d+)/,
          /sympathyCount\s*:\s*(\d+)/,
          /"likeCount"\s*:\s*(\d+)/,
          /likeCount\s*:\s*(\d+)/,
          /공감\s*<em[^>]*>(\d+)/i,
          /공감\s*(\d+)/i,
        ];
        for (const pattern of likePatterns) {
          const match = html.match(pattern)
          if (match && match[1]) {
            likeCount = parseInt(match[1], 10)
            break
          }
        }
      }

      // 본문 및 이미지 추출 로직 (동일)
      let imageCount = 0;
      let fullContent = '';
      const mainContainerStartIdx = html.indexOf('class="se-main-container"')

      if (mainContainerStartIdx > 0) {
        const divStartIdx = html.lastIndexOf('<div', mainContainerStartIdx)
        let depth = 0
        let contentEndIdx = divStartIdx
        let inContainer = false

        for (let i = divStartIdx; i < html.length; i++) {
          if (html.substring(i, i + 4) === '<div') {
            depth++
            inContainer = true
          } else if (html.substring(i, i + 6) === '</div>') {
            depth--
            if (depth === 0 && inContainer) {
              contentEndIdx = i + 6
              break
            }
          }
        }

        fullContent = html.substring(divStartIdx, contentEndIdx)
        const allImages: string[] = fullContent.match(/<img[^>]+>/g) || []
        imageCount = allImages.filter(img => !img.includes('se-sticker-image') && !img.includes('icon') && !img.includes('emoji')).length;
      } else {
        imageCount = (html.match(/<img[^>]+>/g) || []).length;
      }

      return { likeCount, commentCount, imageCount, fullContent, profileImage: undefined };
    } catch (error) {
      console.error('포스트 상세 정보 가져오기 오류:', error);
      return null;
    }
  }

  /**
   * 블로그의 기본 정보(구독자 수 등)를 가져옵니다.
   */
  async function fetchBlogExtraData(blogId: string) {
    try {
      const blogInfoUrl = `https://m.blog.naver.com/api/blogs/${blogId}`;
      const response = await safeFetch(blogInfoUrl, {
          headers: {
              'Referer': `https://m.blog.naver.com/${blogId}`,
              'Accept': 'application/json, text/plain, */*',
              'X-Requested-With': 'XMLHttpRequest'
          }
      });

      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        const result = data.result || {};
        return {
          ...result,
          blogName: result.blogTitle || result.blogName || '블로그',
        };
      }
      return null;
    } catch (error) {
      console.error('블로그 정보 가져오기 오류:', error);
      return null;
    }
  }
  
  /**
   * 블로그 본문에서 핵심 키워드를 추출합니다.
   */
  async function extractKeywordsFromContent(content: string): Promise<string[]> {
    try {
      if (!content || content.length < 50) return [];
  
      // HTML 태그 제거 및 텍스트 정규화
      const cleanText = content
        .replace(/<[^>]*>?/gm, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 2000); // 토큰 절약을 위해 상위 2000자만 사용
  
      const result = await generateText({
        model: "google/gemini-2.5-flash" as any,
        messages: [
          {
            role: "user",
            content: `다음 블로그 본문 내용을 분석하여 해당 글의 핵심 키워드 5개를 추출해주세요.
  결과는 반드시 쉼표(,)로 구분된 단어들만 출력하세요. 다른 설명이나 수식어는 제외하세요.
  
  본문 내용:
  ${cleanText}`,
          },
        ],
      });
  
      if (result.text) {
        return result.text
          .split(',')
          .map(kw => kw.trim().replace(/^#/, '')) // # 제거 (있을 경우)
          .filter(kw => kw.length > 0 && kw.length < 15)
          .slice(0, 5);
      }
      return [];
    } catch (error) {
      console.error('키워드 추출 오류:', error);
      return [];
    }
  }

  /**
   * 키워드 조합을 기반으로 구체적인 글쓰기 기획(주제, 타겟, 메시지) 세트를 생성합니다.
   */
  export async function generateContentPlansFromKeywords(keywords: string[]): Promise<{
    success: boolean;
    plans: Array<{
      subject: string;
      targetAudience: string;
      keyMessage: string;
      keywords: string[];
    }>;
    error?: string;
  }> {
    try {
      const keywordString = keywords.join(', ');
      const prompt = `다음 5개의 핵심 키워드를 기반으로 네이버 블로그 포스팅 기획안을 3가지 버전으로 작성해주세요.
  각 버전은 서로 다른 관점이나 타겟을 가져야 합니다.
  
  핵심 키워드: ${keywordString}
  
  각 기획안은 다음 항목을 포함해야 하며, 반드시 JSON 형식으로만 응답하세요:
  1. subject (포스팅 주제: 클릭을 유도하는 매력적인 제목 형태)
  2. targetAudience (타겟 독자: 구체적인 페르소나)
  3. keyMessage (핵심 메시지 및 강조점: 글을 통해 전달하고자 하는 핵심 가치)
  4. keywords (핵심 키워드: 제공된 키워드를 적절히 활용하거나 보완한 5개 내외의 키워드)
  
  응답 형식 예시:
  [
    {
      "subject": "주제1",
      "targetAudience": "타겟1",
      "keyMessage": "메시지1",
      "keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"]
    },
    ...
  ]`;
  
      const result = await generateText({
        model: "google/gemini-2.5-flash" as any,
        messages: [{ role: "user", content: prompt }],
      });
  
      if (result.text) {
        // JSON 추출 (코드 블록 제거 등)
        const jsonMatch = result.text.match(/\[[\s\S]*\]/);
        const jsonStr = jsonMatch ? jsonMatch[0] : result.text;
        const plans = JSON.parse(jsonStr);
        
        return {
          success: true,
          plans: plans.slice(0, 3)
        };
      }
      return { success: false, plans: [], error: 'AI 응답이 없습니다.' };
    } catch (error) {
      console.error('기획안 생성 오류:', error);
      return { success: false, plans: [], error: '기획안 생성 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 키워드로 블로그 검색하여 최상위 포스트 n개 가져오기
   * 
   * @param keyword 검색할 키워드
   * @param count 가져올 포스트 개수 (기본값: 7)
   * @returns 검색 결과
   */
  export async function searchBlogPosts(
    keyword: string,
    count: number = 7,
  ): Promise<BlogSearchResult> {
    try {
      const posts: BlogPost[] = []
      const MAX_PAGES = 5 // 최대 5페이지까지 조회
  
      // 중복 포스트 제거를 위한 Set
      const seenPosts = new Set<string>()
  
      for (let page = 1; page <= MAX_PAGES; page++) {
        if (posts.length >= count) break
  
        // 네이버 검색 API 호출 (SearchList.naver)
        const searchResponse = await blogSearchAPI(keyword, page)
  
        // 응답 처리
        if (!searchResponse?.result?.searchList || searchResponse.result.searchList.length === 0) {
          break
        }
  
        for (const post of searchResponse.result.searchList) {
          if (posts.length >= count) break

          try {
            // 중복 포스트 체크
            const postKey = `${post.domainIdOrBlogId}_${post.logNo}`
            if (seenPosts.has(postKey)) continue
            seenPosts.add(postKey)

            // 날짜 정보 처리
            const timestamp = post.addDate || 0
            const daysAgo = timestamp ? calculateDaysAgo(timestamp) : 0
            const publishDate = timestamp ? formatDate(timestamp) : '-'

            posts.push({
              title: post.title.replace(/<[^>]*>?/gm, ''), // HTML 태그 제거
              blogName: post.blogName || post.nickName,
              blogId: post.domainIdOrBlogId,
              logNo: String(post.logNo),
              publishDate,
              daysAgo,
              imageCount: 0, // 기본값, 상세 데이터에서 업데이트됨
              url: post.postUrl,
              nickName: post.nickName,
              thumbnailCount: post.thumbnails?.length || 0,
              likeCount: 0, // 상세 데이터에서 업데이트됨
              commentCount: 0, // 상세 데이터에서 업데이트됨
              quality: null,
              profileImage: post.profileImgUrl,
              raw: post, // 원본 데이터 포함
            })
          } catch (error) {
            console.error('문서 처리 오류:', error)
            continue
          }
        }
  
        // 다음 페이지 조회 전 딜레이
        if (posts.length < count && page < MAX_PAGES) {
          await delay(300)
        }
      }
  
      if (posts.length === 0) {
        return {
          success: false,
          posts: [],
          totalCount: 0,
          error: '검색 결과를 찾을 수 없습니다.',
        }
      }

      // ----------------------------------------------------------------------
      // 상세 데이터 및 블로그 정보 추가 (병렬 처리)
      // ----------------------------------------------------------------------
      const finalPosts = await Promise.all(
        posts.slice(0, count).map(async (post) => {
          const [extraData, blogExtra] = await Promise.all([
            fetchPostExtraData(post.blogId, post.logNo),
            fetchBlogExtraData(post.blogId)
          ]);

          if (extraData) {
            post.likeCount = extraData.likeCount;
            post.commentCount = extraData.commentCount;
            post.imageCount = extraData.imageCount;
            post.fullContent = extraData.fullContent;
            post.profileImage = extraData.profileImage || post.profileImage;

            // 본문이 있으면 키워드 추출 추가
            if (post.fullContent) {
              post.keywords = await extractKeywordsFromContent(post.fullContent);
            }
          }

          if (blogExtra) {
            post.blogInfo = blogExtra;
          }

          return post;
        })
      );
  
      return {
        success: true,
        posts: finalPosts,
        totalCount: posts.length,
      }
    } catch (error) {
      console.error('블로그 키워드 검색 오류:', error)
      return {
        success: false,
        posts: [],
        totalCount: 0,
        error: '블로그 검색 중 오류가 발생했습니다.',
      }
    }
  }
  
  