'use server'
import { generateText } from 'ai';
import { analyzePost } from './blog-post-analysis.actions';
import { getYouTubeTranscript } from '../youtube/youtube-transcript.actions';

/**
 * HTML 태그를 제거하고 순수 텍스트만 추출하는 헬퍼 함수
 */
function cleanHtmlContent(html: string, maxLength: number = 3000): string {
  if (!html) return "";
  return html
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, "") // 스크립트 제거
    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gmi, "") // 스타일 제거
    .replace(/<[^>]*>?/gm, " ") // 태그 제거
    .replace(/\s+/g, " ") // 연속 공백 제거
    .trim()
    .substring(0, maxLength);
}

/**
 * YouTube URL을 분석하여 해당 자막을 기반으로 글쓰기 기획안을 생성합니다.
 */
export async function generateContentPlanFromYoutube(
  url: string,
  initialContext?: { subject?: string; targetAudience?: string; keyMessage?: string }
): Promise<{
  success: boolean;
  plan?: {
    subject: string;
    targetAudience: string;
    keyMessage: string;
    keywords: string[];
    tone: string;
    styleAnalysis: string;
  };
  error?: string;
}> {
  try {
    const transcriptResult = await getYouTubeTranscript(url);
    if (!transcriptResult.success || !transcriptResult.transcript) {
      return { success: false, error: transcriptResult.error || 'YouTube 자막을 가져오는데 실패했습니다.' };
    }

    const fullText = transcriptResult.transcript
      .map(item => item.text)
      .join(' ')
      .substring(0, 3000);

    const contextPrompt = initialContext ? `
[사용자의 초기 기획 의도]
- 초기 주제: ${initialContext.subject || '없음'}
- 초기 타겟: ${initialContext.targetAudience || '없음'}
- 초기 핵심 메시지: ${initialContext.keyMessage || '없음'}

위 사용자의 초기 의도를 바탕으로 YouTube 영상의 내용을 분석하여 기획안을 작성해주세요. 사용자의 의도가 영상의 정보와 자연스럽게 융합되도록 하고, 특히 타겟 독자와 핵심 메시지가 사용자의 의도를 반영하면서도 영상의 구체적인 근거를 통해 강화되도록 작성하세요.` : '';

    const prompt = `다음 YouTube 영상의 자막 내용을 분석하여 네이버 블로그 포스팅 기획안을 작성해주세요.
${contextPrompt}

영상 자막 내용: ${fullText}

[말투(tone) 분석 지침]
본문의 전체적인 문체를 분석하여 다음 중 하나를 선택하세요:
- 정중형: '~습니다', '~입니다' 등 격식 있는 문어체가 지배적인 경우
- 친절형: '~해요', '~예요', '~인가요?' 등 부드러운 구어체가 지배적인 경우
- 친근형: '~해', '~이야', '~다' 등 반말이나 평어가 지배적인 경우
반드시 가장 많이 사용된 종결 어미 형식을 기준으로 '친절형', '정중형', '친근형' 중 키워드 하나만 선택하세요.

[스타일 분석 지침]
분석 항목:
1. 문체 (말투, 종결 어미의 특징 - 예: ~해요, ~입니다, ~다 등)
2. 단어 선택의 특징 (자주 사용하는 단어, 전문 용어 사용 수준, 이모지 활용도 등)
3. 문장 구조 (문장의 평균 길이, 호흡, 줄바꿈 습관 등)
4. 글의 구성 방식 (서론-본론-결론의 특징, 가독성을 위한 장치 등)
5. 독자를 대하는 태도 및 분위기 (친근함, 전문적임, 단호함 등)

[응답 규칙]
- "제시된 포스트를 바탕으로~", "분석 결과입니다"와 같은 서술형 도입 문구를 절대 포함하지 마세요.
- "[작성 팁]", "성공입니다"와 같은 마무리 문구나 조언을 절대 포함하지 마세요.
- 오직 스타일 가이드의 핵심 내용(지침)만 불렛 포인트나 구조화된 형태로 출력하세요.
- 다른 설명 없이 스타일 가이드 본문만 바로 시작하세요.

반드시 JSON 형식으로만 응답하세요:
{
  "subject": "포스팅 주제 (영상의 핵심을 잘 보여주는 매력적인 제목)",
  "targetAudience": "타겟 독자 (이 글을 읽을 구체적인 페르소나)",
  "keyMessage": "핵심 메시지 및 강조점 (영상에서 전달하려는 핵심 가치와 강조해야 할 부분)",
  "keywords": ["핵심 키워드 5개"],
  "tone": "친절형" | "정중형" | "친근형",
  "styleAnalysis": "스타일 분석 지침에 따라 분석한 스타일 가이드"
}`;

    const result = await generateText({
      model: "google/gemini-3-flash" as any,
      messages: [{ role: "user", content: prompt }],
    });

    if (result.text) {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : result.text;
      const plan = JSON.parse(jsonStr);
      
      return {
        success: true,
        plan
      };
    }
    return { success: false, error: 'AI 응답이 없습니다.' };
  } catch (error) {
    console.error('YouTube 기반 기획안 생성 오류:', error);
    return { success: false, error: '기획안 생성 중 오류가 발생했습니다.' };
  }
}

/**
 * 블로그 URL을 분석하여 해당 글을 기반으로 글쓰기 기획안을 생성합니다.
 */
export async function generateContentPlanFromUrl(
  url: string,
  initialContext?: { subject?: string; targetAudience?: string; keyMessage?: string }
): Promise<{
    success: boolean;
    plan?: {
      subject: string;
      targetAudience: string;
      keyMessage: string;
      keywords: string[];
      tone: string;
      styleAnalysis: string;
    };
    error?: string;
  }> {
    try {
      const analysisResult = await analyzePost(url);
      if (!analysisResult.success || !analysisResult.data) {
        return { success: false, error: analysisResult.error || '블로그 내용을 가져오는데 실패했습니다.' };
      }
  
      const { title, content } = analysisResult.data;
      const cleanedContent = cleanHtmlContent(content, 3000);
  
      const contextPrompt = initialContext ? `
[사용자의 초기 기획 의도]
- 초기 주제: ${initialContext.subject || '없음'}
- 초기 타겟: ${initialContext.targetAudience || '없음'}
- 초기 핵심 메시지: ${initialContext.keyMessage || '없음'}

위 사용자의 초기 의도를 바탕으로 분석된 블로그 내용을 재구성하여 기획안을 작성해주세요. 사용자의 의도가 분석된 내용과 자연스럽게 융합되도록 하고, 특히 타겟 독자와 핵심 메시지가 사용자의 의도를 반영하면서도 분석된 내용의 강점을 취하도록 작성하세요.` : '';

      const prompt = `다음 네이버 블로그 포스트를 분석하여 최적화된 기획안을 작성해주세요.
  ${contextPrompt}

  원래 글 제목: ${title}
  원래 글 본문 요약: ${cleanedContent}
  
  [말투(tone) 분석 지침]
  본문의 전체적인 문체를 분석하여 다음 중 하나를 선택하세요:
  - 정중형: '~습니다', '~입니다' 등 격식 있는 문어체가 지배적인 경우
  - 친절형: '~해요', '~예요', '~인가요?' 등 부드러운 구어체가 지배적인 경우
  - 친근형: '~해', '~이야', '~다' 등 반말이나 평어가 지배적인 경우
  반드시 가장 많이 사용된 종결 어미 형식을 기준으로 '친절형', '정중형', '친근형' 중 키워드 하나만 선택하세요.

  반드시 JSON 형식으로만 응답하세요:
  {
    "subject": "포스팅 주제 (원래 글을 바탕으로 더 매력적으로 다듬은 제목)",
    "targetAudience": "타겟 독자 (이 글을 읽을 구체적인 페르소나)",
    "keyMessage": "핵심 메시지 및 강조점 (글에서 전달하려는 핵심 가치와 강조해야 할 부분)",
    "keywords": ["핵심 키워드 5개"],
    "tone": "친절형" | "정중형" | "친근형",
    "styleAnalysis": "원래 글의 문체, 단어 선택, 문장 구조 등을 바탕으로 한 상세 스타일 가이드"
  }`;
  
      const result = await generateText({
        model: "google/gemini-3-flash" as any,
        messages: [{ role: "user", content: prompt }],
      });
  
      if (result.text) {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : result.text;
        const plan = JSON.parse(jsonStr);
        
        return {
          success: true,
          plan
        };
      }
      return { success: false, error: 'AI 응답이 없습니다.' };
    } catch (error) {
      console.error('URL 기반 기획안 생성 오류:', error);
      return { success: false, error: '기획안 생성 중 오류가 발생했습니다.' };
    }
  }

/**
 * 네이버 블로그 키워드 검색 - 간단 버전
 */

// 네이버 검색 API 응답 타입
interface SearchListPost {
  domainIdOrBlogId: string;
  logNo: string | number;
  postUrl: string;
  title: string;
  contents: string;
  nickName: string;
  blogName: string;
  profileImgUrl: string;
  addDate: number;
  thumbnails?: Array<{ url: string }>;
  hasThumbnail?: boolean;
}

interface SearchListResponse {
  result: {
    searchList: SearchListPost[];
    totalCount: number;
  }
}

export interface BlogPost {
  title: string
  blogName: string
  blogId: string
  logNo: string
  publishDate: string
  daysAgo: number
  imageCount: number
  url: string
  nickName: string
  thumbnailCount: number
  likeCount: number
  commentCount: number
  quality: number | null
  profileImage?: string
  fullContent?: string
  keywords?: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blogInfo?: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw?: Record<string, any>
}
  
export interface BlogSearchResult {
  success: boolean
  posts: BlogPost[]
  totalCount: number
  error?: string
}



/**
 * 키워드 조합을 기반으로 구체적인 글쓰기 기획(주제, 타겟, 메시지) 세트를 생성합니다.
 */
export async function generateContentPlansFromKeywords(
  keywords: string[],
  initialContext?: { subject?: string; targetAudience?: string; keyMessage?: string }
): Promise<{
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
    const contextPrompt = initialContext ? `
[사용자의 초기 기획 의도]
- 초기 주제: ${initialContext.subject || '없음'}
- 초기 타겟: ${initialContext.targetAudience || '없음'}
- 초기 핵심 메시지: ${initialContext.keyMessage || '없음'}

위 사용자의 초기 의도를 적극 반영하여 기획안을 작성해주세요. 각 버전은 핵심 키워드들을 활용하면서도 사용자가 처음에 가졌던 기획 의도와 타겟, 메시지를 구체화하고 발전시킨 형태여야 합니다.` : '';

    const prompt = `다음 5개의 핵심 키워드를 기반으로 네이버 블로그 포스팅 기획안을 3가지 버전으로 작성해주세요.
${contextPrompt}
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
      model: "google/gemini-3-flash" as any,
      messages: [{ role: "user", content: prompt }],
    });

    if (result.text) {
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
 * 블로그 본문 내용을 분석하여 말투(tone)와 스타일 가이드를 추출합니다.
 */
export async function analyzeToneAndStyleFromContent(content: string): Promise<{
  success: boolean;
  tone?: string;
  styleAnalysis?: string;
  error?: string;
}> {
  try {
    const cleanedContent = cleanHtmlContent(content, 3000);
    const prompt = `다음 블로그 본문의 전체적인 문체와 종결 어미를 정밀하게 분석하여 말투 유형을 결정해주세요. 그리고 

[분석 지침]
1. 본문의 모든 문장 종결 어미를 전수 조사하세요.
2. '~습니다', '~입니다', '~보입니다' 등 격식 있는 표현이 지배적이라면 반드시 '정중형'을 선택하세요.
3. '~해요', '~예요', '~인가요?' 등 부드러운 구어체가 지배적이라면 반드시 '친절형'을 선택하세요.
4. '~해', '~이야', '~다' (일기체/평어)가 지배적이라면 반드시 '친근형'을 선택하세요.
5. 도입부의 한두 문장에 현혹되지 말고, 본문의 80% 이상을 차지하는 지배적인 말투를 기준으로 선택하세요.

[스타일 분석 지침]
분석 항목:
1. 문체 (말투, 종결 어미의 특징 - 예: ~해요, ~입니다, ~다 등)
2. 단어 선택의 특징 (자주 사용하는 단어, 전문 용어 사용 수준, 이모지 활용도 등)
3. 문장 구조 (문장의 평균 길이, 호흡, 줄바꿈 습관 등)
4. 글의 구성 방식 (서론-본론-결론의 특징, 가독성을 위한 장치 등)
5. 독자를 대하는 태도 및 분위기 (친근함, 전문적임, 단호함 등)

[응답 규칙]
- "제시된 포스트를 바탕으로~", "분석 결과입니다"와 같은 서술형 도입 문구를 절대 포함하지 마세요.
- "[작성 팁]", "성공입니다"와 같은 마무리 문구나 조언을 절대 포함하지 마세요.
- 오직 스타일 가이드의 핵심 내용(지침)만 불렛 포인트나 구조화된 형태로 출력하세요.
- 다른 설명 없이 스타일 가이드 본문만 바로 시작하세요.;

본문 내용:
${cleanedContent}

반드시 JSON 형식으로만 응답하세요:
{
  "tone": "친절형" | "정중형" | "친근형",
  "styleAnalysis": "스타일 분석 지침에 따라 분석한 스타일 가이드"
}`;

    const result = await generateText({
      model: "google/gemini-3-flash" as any,
      messages: [{ role: "user", content: prompt }],
    });

    if (result.text) {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : result.text;
      const data = JSON.parse(jsonStr);
      return {
        success: true,
        tone: data.tone,
        styleAnalysis: data.styleAnalysis
      };
    }
    return { success: false, error: 'AI 응답이 없습니다.' };
  } catch (error) {
    console.error('톤 및 스타일 분석 오류:', error);
    return { success: false, error: '분석 중 오류가 발생했습니다.' };
  }
}

/**
 * 특정 블로그 URL이나 키워드 검색 결과를 분석하여 글쓰기 스타일 가이드를 생성합니다.
 */
export async function analyzeStyleFromSource(type: 'URL' | 'KEYWORD', source: string): Promise<{
  success: boolean;
  styleAnalysis?: string;
  error?: string;
}> {
  try {
    let contentsToAnalyze = "";

    if (type === 'URL') {
      // 1. URL에서 blogId 추출
      let blogId = "";
      
      // 입력값이 이미 ID 형태인 경우 (공백 없고, URL 형식이 아님)
      if (!source.includes('.') && !source.includes('/') && !source.includes('http')) {
        blogId = source.trim();
      } else {
        try {
          const urlStr = source.startsWith('http') ? source : `https://${source}`;
          const url = new URL(urlStr);
          const hostname = url.hostname;

          if (hostname === "blog.naver.com" || hostname === "m.blog.naver.com") {
            // blog.naver.com/아이디 또는 m.blog.naver.com/아이디 형식 처리
            blogId = url.pathname.split("/")[1] || "";
          } else if (hostname.endsWith(".blog.naver.com")) {
            // 아이디.blog.naver.com 형식 처리
            blogId = hostname.split(".")[0] || "";
          } else {
            // 다른 호스트명이지만 ID일 가능성이 있는 경우 (예: bongbong_bubu)
            blogId = source.trim();
          }
        } catch (_e) {
          blogId = source.trim();
        }
      }

      if (!blogId) return { success: false, error: '유효한 블로그 주소나 ID가 아닙니다.' };
      console.log(`blogId: ${blogId}`);

      // 2. 해당 블로그의 최신 글 목록(logNo) 가져오기
      const listUrl = `https://blog.naver.com/PostTitleListAsync.naver?blogId=${blogId}&viewDate=&currentPage=1&categoryNo=0&parentCategoryNo=0&countPerPage=5`;
      const listRes = await safeFetch(listUrl, { headers: { 'Accept': 'application/json' } });
      
      if (!listRes.ok) return { success: false, error: '블로그 글 목록을 가져오는데 실패했습니다.' };
      
      const responseText = await listRes.text();
      // 네이버 특유의 JSON 보안 접두어 제거 및 정제
      let cleanJson = responseText.replace(/^\)\]\}',\r?\n/, '');
      
      // JSON 파싱 에러 방지를 위한 정제 로직 강화
      try {
        // 1단계: 일반적인 비표준 이스케이프 처리
        // \xHH 형식을 \u00HH 형식으로 변환 (JSON 표준)
        cleanJson = cleanJson.replace(/\\x([0-9a-fA-F]{2})/g, "\\u00$1");
        
        // 유효하지 않은 백슬래시 이스케이프(예: \ , \% 등) 처리
        // 유효한 이스케이프(" \ / b f n r t u)가 아닌 경우 백슬래시를 이스케이프함
        cleanJson = cleanJson.replace(/\\(?![u"\\\/bfnrt])/g, "\\\\");
        
        let listData;
        try {
          listData = JSON.parse(cleanJson);
        } catch (_parseError) {
          // eslint-disable-next-line no-control-regex
          const fallbackJson = cleanJson.replace(/[\u0000-\u001F\u007F-\u009F]/g, ""); 
          listData = JSON.parse(fallbackJson);
        }
        
        if (!listData.postList || listData.postList.length === 0) {
          return { success: false, error: '분석할 글이 없습니다.' };
        }
        
          // 3. 각 글의 본문 가져오기 (병렬 처리)
          const postContents = await Promise.all(listData.postList.slice(0, 5).map(async (post: any) => {
            const extra = await fetchPostExtraData(blogId, post.logNo);
            if (extra?.fullContent) {
              const text = extra.fullContent.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
              
              // 제목 디코딩 및 + 기호를 공백으로 변환
              let cleanTitle = post.title;
              try {
                cleanTitle = decodeURIComponent(post.title.replace(/\+/g, ' '));
              } catch (_e) {
                // 디코딩 실패 시 원본 유지
              }
              
              return `[제목: ${cleanTitle}]\n${text.substring(0, 1000)}`;
            }
            return "";
          }));

        contentsToAnalyze = postContents.filter(c => c).join('\n\n---\n\n');
      } catch (e) {
        console.error('JSON 파싱 에러:', e, 'Clean JSON preview:', cleanJson.substring(0, 200));
        return { success: false, error: '블로그 데이터를 파싱하는 중 오류가 발생했습니다.' };
      }

    } else {
      const searchResult = await searchBlogPosts(source, 5);
      console.log(searchResult);
      if (searchResult.success && searchResult.posts.length > 0) {
        contentsToAnalyze = searchResult.posts
          .filter(p => p.fullContent)
          .map(p => {
            // HTML 태그 제거된 순수 텍스트만 추출
            const text = p.fullContent?.replace(/<[^>]*>?/gm, ' ')
                                     .replace(/\s+/g, ' ')
                                     .trim() || "";
            return `[포스트 제목: ${p.title}]\n${text.substring(0, 1000)}`;
          })
          .join('\n\n---\n\n');
      } else {
        return { success: false, error: '검색 결과를 찾을 수 없습니다.' };
      }
    }

    if (!contentsToAnalyze || contentsToAnalyze.length < 100) {
      return { success: false, error: '분석할 내용이 충분하지 않습니다.' };
    }

    console.log(contentsToAnalyze);

    const prompt = `다음 블로그 포스트(들)의 글쓰기 스타일을 분석하여, 나중에 다른 글을 쓸 때 프롬프트로 직접 사용할 수 있는 '스타일 가이드' 본문만 작성해주세요.

분석할 내용:
${contentsToAnalyze.substring(0, 4000)}

분석 항목:
1. 문체 (말투, 종결 어미의 특징 - 예: ~해요, ~입니다, ~다 등)
2. 단어 선택의 특징 (자주 사용하는 단어, 전문 용어 사용 수준, 이모지 활용도 등)
3. 문장 구조 (문장의 평균 길이, 호흡, 줄바꿈 습관 등)
4. 글의 구성 방식 (서론-본론-결론의 특징, 가독성을 위한 장치 등)
5. 독자를 대하는 태도 및 분위기 (친근함, 전문적임, 단호함 등)

[응답 규칙]
- "제시된 포스트를 바탕으로~", "분석 결과입니다"와 같은 서술형 도입 문구를 절대 포함하지 마세요.
- "[작성 팁]", "성공입니다"와 같은 마무리 문구나 조언을 절대 포함하지 마세요.
- 오직 스타일 가이드의 핵심 내용(지침)만 불렛 포인트나 구조화된 형태로 출력하세요.
- 다른 설명 없이 스타일 가이드 본문만 바로 시작하세요.`;

    const result = await generateText({
      model: "google/gemini-3-flash" as any,
      messages: [{ role: "user", content: prompt }],
    });

    return {
      success: true,
      styleAnalysis: result.text || ""
    };
  } catch (error) {
    console.error('스타일 분석 오류:', error);
    return { success: false, error: '스타일 분석 중 오류가 발생했습니다.' };
  }
}

// Rate Limiting을 위한 간단한 딜레이 함수
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 요청 간격을 위한 전역 변수
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 500

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
  return USER_AGENTS[randomIndex]!
}

async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
  await ensureRequestInterval()
  const headers = { ...options.headers, 'User-Agent': getRandomUserAgent() }
  const response = await fetch(url, { ...options, headers })
  if (response.status === 429) {
    await delay(1000)
    return await fetch(url, { ...options, headers })
  }
  return response
}

function calculateDaysAgo(timestampMs: number): number {
  const postDate = new Date(timestampMs)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  postDate.setHours(0, 0, 0, 0)
  return Math.floor((today.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(timestampMs: number): string {
  const date = new Date(timestampMs)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

async function blogSearchAPI(query: string, page: number): Promise<SearchListResponse | null> {
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
    if (Array.isArray(jsonData)) return { result: { searchList: jsonData, totalCount: jsonData.length } }
    if (jsonData && Array.isArray(jsonData.result)) return { result: { searchList: jsonData.result, totalCount: jsonData.result.length } }
    return jsonData?.result ? jsonData : null
  } catch (error) {
    console.error('API 호출 오류:', error)
    return null
  }
}

async function fetchPostExtraData(blogId: string, logNo: string) {
  try {
    const likeApiUrl = `https://apis.naver.com/blogserver/like/v1/search/contents?suppress_response_codes=true&pool=blogid&q=BLOG%5B${blogId}_${logNo}%5D&isDuplication=false&cssIds=MULTI_MOBILE%2CBLOG_MOBILE&displayId=BLOG`
    const commentApiUrl = `https://apis.naver.com/comment/v1/pages/count?ticket=blog&pool=blog&objectId=blog_${blogId}_${logNo}`
    
    // 모바일 URL이 파싱에 더 유리하고 UTF-8 보장됨
    const postUrl = `https://m.blog.naver.com/PostView.naver?blogId=${blogId}&logNo=${logNo}`

    const [likeRes, commentRes, postRes] = await Promise.all([
      safeFetch(likeApiUrl, { headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } }),
      safeFetch(commentApiUrl, { headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } }),
      safeFetch(postUrl, { headers: { 'User-Agent': getRandomUserAgent(), 'Accept': 'text/html' } })
    ]);

    let likeCount = 0;
    if (likeRes.ok && likeRes.headers.get('content-type')?.includes('application/json')) {
      const data = await likeRes.json();
      const reactions = data.contents?.[0]?.reactions;
      if (reactions) likeCount = reactions.find((r: any) => r.reactionType === 'like')?.count || 0;
    }

    let commentCount = 0;
    if (commentRes.ok && commentRes.headers.get('content-type')?.includes('application/json')) {
      const data = await commentRes.json();
      commentCount = data.result?.count || data.result?.totalCount || 0;
    }

    if (!postRes.ok) return { likeCount, commentCount, imageCount: 0, fullContent: '' };
    const html = await postRes.text();
    
    let imageCount = 0;
    let fullContent = '';

    // 본문 영역 찾기 (모바일/데스크탑 공통 선택자)
    const contentSelectors = [
      'se-main-container',    // SmartEditor One
      '__post_view_area',     // SE2 & Old
      'postViewArea',         // Old
      'se_component_wrap',    // SE Components
      'post_ct'               // Mobile default
    ];
    
    let mainContainerIdx = -1;
    for (const selector of contentSelectors) {
      mainContainerIdx = html.indexOf(selector);
      if (mainContainerIdx !== -1) break;
    }

    if (mainContainerIdx !== -1) {
      const divStartIdx = html.lastIndexOf('<div', mainContainerIdx);
      if (divStartIdx !== -1) {
        let depth = 0;
        let endIdx = -1;
        let foundStart = false;

        // div 태그 매칭을 통한 본문 영역 추출
        for (let i = divStartIdx; i < html.length; i++) {
          if (html.substring(i, i + 4) === '<div') {
            depth++;
            foundStart = true;
          } else if (html.substring(i, i + 6) === '</div>') {
            depth--;
            if (foundStart && depth === 0) {
              endIdx = i + 6;
              break;
            }
          }
        }

        if (endIdx !== -1) {
          fullContent = html.substring(divStartIdx, endIdx);
          
          // 이미지 개수 계산 (본문 내 이미지)
          // se-sticker-image(스티커), icon(아이콘), profile(프로필) 등 제외
          const images = fullContent.match(/<img[^>]+>/g) || [];
          imageCount = images.filter(img => {
            const isSticker = img.includes('se-sticker-image') || img.includes('se-module-sticker');
            const isIcon = img.includes('icon') || img.includes('emoji');
            const isProfile = img.includes('profile') || img.includes('buddy');
            const isAd = img.includes('ad_') || img.includes('banner');
            return !isSticker && !isIcon && !isProfile && !isAd;
          }).length;
        }
      }
    }

    // 폴백: 위 방법으로 본문을 못 찾았다면 HTML 전체에서 이미지라도 추출
    if (!fullContent || imageCount === 0) {
      const allImages = html.match(/<img[^>]+>/g) || [];
      const contentImages = allImages.filter(img => {
        // 본문 이미지일 가능성이 높은 클래스들 확인
        const isContentImage = img.includes('se-image-resource') || 
                               img.includes('se_media_area') || 
                               img.includes('post-view-image') ||
                               img.includes('se-module-image') ||
                               img.includes('blogfiles.naver.net');
        
        // 제외할 이미지들
        const isSticker = img.includes('se-sticker-image') || img.includes('se-module-sticker');
        const isIcon = img.includes('icon') || img.includes('emoji');
        const isProfile = img.includes('profile') || img.includes('buddy');
        const isStat = img.includes('stat.blog.naver.com'); // 통계용 픽셀 제외
        
        return isContentImage && !isSticker && !isIcon && !isProfile && !isStat;
      });

      if (imageCount === 0) imageCount = contentImages.length;
      
      // 본문이 없을 경우 요약문이라도 추출
      if (!fullContent) {
        const textOnly = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                             .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                             .replace(/<[^>]+>/g, ' ')
                             .replace(/\s+/g, ' ')
                             .trim();
        if (textOnly.length > 100) {
          fullContent = textOnly.substring(0, 5000);
        }
      }
    }

    return { likeCount, commentCount, imageCount, fullContent };
  } catch (error) {
    console.error('포스트 상세 정보 가져오기 오류:', error);
    return null;
  }
}

async function fetchBlogExtraData(blogId: string) {
  try {
    const response = await safeFetch(`https://m.blog.naver.com/api/blogs/${blogId}`, {
      headers: { 'Referer': `https://m.blog.naver.com/${blogId}`, 'Accept': 'application/json' }
    });
    if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json();
      return { ...data.result, blogName: data.result?.blogTitle || data.result?.blogName || '블로그' };
    }
    return null;
  } catch (_error) {
    return null;
  }
}

async function extractKeywordsFromContent(content: string): Promise<string[]> {
  try {
    if (!content || content.length < 50) return [];
    
    // HTML 태그 제거 및 텍스트 정제
    const cleanText = content
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, '') // 스크립트 제거
      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gmi, '')   // 스타일 제거
      .replace(/<[^>]*>?/gm, ' ')                            // 태그 제거
      .replace(/\s+/g, ' ')                                  // 연속 공백 제거
      .trim()
      .substring(0, 3000);                                   // 분석 범위 확대

    if (cleanText.length < 50) return [];

    const result = await generateText({
      model: "google/gemini-3-flash" as any,
      messages: [
        { 
          role: "user", 
          content: `다음 블로그 본문을 분석하여 검색 엔진 최적화(SEO)에 도움이 될만한 핵심 키워드 5개를 추출해주세요.
결과는 반드시 쉼표(,)로만 구분된 텍스트여야 하며, 추가 설명이나 번호는 제외하세요.
예시: 키워드1, 키워드2, 키워드3, 키워드4, 키워드5

본문 내용:
${cleanText}` 
        }
      ],
    });

    if (!result.text) return [];

    return result.text
      .split(',')
      .map(kw => kw.trim().replace(/^#/, ''))
      .filter(kw => kw.length > 0 && kw.length < 20)
      .slice(0, 5);
  } catch (error) {
    console.error('키워드 추출 오류:', error);
    return [];
  }
}

export async function searchBlogPosts(keyword: string, count: number = 7): Promise<BlogSearchResult> {
  try {
    const posts: BlogPost[] = []
    const seenPosts = new Set<string>()
    for (let page = 1; page <= 5; page++) {
      if (posts.length >= count) break
      const searchRes = await blogSearchAPI(keyword, page)
      if (!searchRes?.result?.searchList) break
      for (const post of searchRes.result.searchList) {
        if (posts.length >= count) break
        const key = `${post.domainIdOrBlogId}_${post.logNo}`
        if (seenPosts.has(key)) continue
        seenPosts.add(key)
        posts.push({
          title: post.title.replace(/<[^>]*>?/gm, ''),
          blogName: post.blogName || post.nickName,
          blogId: post.domainIdOrBlogId,
          logNo: String(post.logNo),
          publishDate: formatDate(post.addDate || 0),
          daysAgo: calculateDaysAgo(post.addDate || 0),
          imageCount: 0,
          url: post.postUrl,
          nickName: post.nickName,
          thumbnailCount: post.thumbnails?.length || 0,
          likeCount: 0,
          commentCount: 0,
          quality: null,
          profileImage: post.profileImgUrl,
          raw: post,
        })
      }
      if (posts.length < count) await delay(300)
    }
    if (posts.length === 0) return { success: false, posts: [], totalCount: 0, error: '검색 결과를 찾을 수 없습니다.' }
    const finalPosts = await Promise.all(posts.map(async (post) => {
      const [extra, blog] = await Promise.all([fetchPostExtraData(post.blogId, post.logNo), fetchBlogExtraData(post.blogId)]);
      if (extra) {
        post.likeCount = extra.likeCount; post.commentCount = extra.commentCount;
        post.imageCount = extra.imageCount; post.fullContent = extra.fullContent;
        if (post.fullContent) post.keywords = await extractKeywordsFromContent(post.fullContent);
      }
      if (blog) post.blogInfo = blog;
      return post;
    }));
    return { success: true, posts: finalPosts, totalCount: posts.length }
  } catch (error) {
    console.error('블로그 검색 중 오류 발생:', error);
    return { success: false, posts: [], totalCount: 0, error: '블로그 검색 중 오류 발생' }
  }
}
