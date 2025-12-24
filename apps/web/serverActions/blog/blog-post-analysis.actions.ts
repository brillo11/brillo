'use server'

// 포스트 분석 관련 타입 정의
export interface PostAnalysisResult {
    success: boolean
    data?: {
        title: string
        nickname: string
        publishDate: string
        contentLength: number
        content: string
        blogId: string
        logNo: string
    }
    error?: string
}

export interface BannedWordsResult {
    success: boolean
    data?: {
        hasBannedWords: boolean
        bannedWords: string[]
        keywords?: string[]
        message?: string
    }
    error?: string
}

export interface MorphemeItem {
    word: string
    count: number
}

export interface MorphemeAnalysisResult {
    success: boolean
    data?: MorphemeItem[]
    error?: string
}

// URL에서 blogId와 logNo 추출
function extractBlogInfo(url: string): { blogId: string; logNo: string } | null {
    try {
        // 패턴 1: https://blog.naver.com/blogId/logNo
        const pattern1 = /blog\.naver\.com\/([^\/]+)\/(\d+)/
        const match1 = url.match(pattern1)
        if (match1 && match1[1] && match1[2]) {
            return { blogId: match1[1], logNo: match1[2] }
        }

        // 패턴 2: https://blog.naver.com/PostView.naver?blogId=...&logNo=...
        const pattern2 = /blogId=([^&]+).*?logNo=(\d+)/
        const match2 = url.match(pattern2)
        if (match2 && match2[1] && match2[2]) {
            return { blogId: match2[1], logNo: match2[2] }
        }

        return null
    } catch (error) {
        console.error('URL 파싱 오류:', error)
        return null
    }
}

// 포스트 HTML 가져오기
async function fetchPostHTML(blogId: string, logNo: string): Promise<string | null> {
    try {
        const url = `https://blog.naver.com/PostView.naver?blogId=${blogId}&logNo=${logNo}`

        const response = await fetch(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9',
            },
        })

        if (!response.ok) {
            console.error('포스트 조회 실패:', response.status)
            return null
        }

        return await response.text()
    } catch (error) {
        console.error('포스트 HTML 가져오기 오류:', error)
        return null
    }
}

// HTML에서 본문 텍스트 추출
function extractContentFromHTML(html: string): { content: string; contentLength: number } {
    let mainContent = ''
    let contentLength = 0

    // se-main-container 영역만 정확하게 추출
    let mainContainerStartIdx = html.indexOf('class="se-main-container"')
    if (mainContainerStartIdx === -1) {
        mainContainerStartIdx = html.indexOf('class="se_component_wrap sect_dsc __se_component_area"')
    }
    // console.log(`mainContainerStartIdx: ${mainContainerStartIdx}`)
    if (mainContainerStartIdx > 0) {
        // se-main-container의 시작 <div> 찾기
        const divStartIdx = html.lastIndexOf('<div', mainContainerStartIdx)

        // se-main-container의 끝 </div> 찾기 (중첩 div 고려)
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

        mainContent = html.substring(divStartIdx, contentEndIdx)

        // HTML 태그 제거하여 글자수 계산
        const textContent = mainContent
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&[a-z]+;/g, '')
            .replace(/\s+/g, ' ')
            .trim()

        contentLength = textContent.length

        return { content: textContent, contentLength }
    }

    return { content: '', contentLength: 0 }
}

// HTML에서 제목 추출
function extractTitle(html: string): string {
    const titlePatterns = [
        /<meta property="og:title" content="([^"]+)"/,
        /<title>([^<]+)<\/title>/,
        /class="se-title-text"[^>]*>([^<]+)</,
    ]

    for (const pattern of titlePatterns) {
        const match = html.match(pattern)
        if (match && match[1]) {
            return match[1].trim()
        }
    }

    return '제목 없음'
}

// HTML에서 닉네임 추출
function extractNickname(html: string): string {
    const nicknamePatterns = [
        /<meta property="naverblog:nickname" content="([^"]+)"/,
        /class="nick"[^>]*>([^<]+)</,
    ]

    for (const pattern of nicknamePatterns) {
        const match = html.match(pattern)
        if (match && match[1]) {
            return match[1].trim()
        }
    }

    return '닉네임 없음'
}

// HTML에서 작성일 추출
function extractPublishDate(html: string): string {
    const datePatterns = [
        /<span class="se_publishDate pcol2">([^<]+)<\/span>/,
        /class="se_publishDate"[^>]*>([^<]+)</,
        /<meta property="article:published_time" content="([^"]+)"/,
    ]

    for (const pattern of datePatterns) {
        const match = html.match(pattern)
        if (match && match[1]) {
            return match[1].trim()
        }
    }

    return '날짜 없음'
}

// 포스트 전체 분석
export async function analyzePost(postUrl: string): Promise<PostAnalysisResult> {
    try {
        // 1. URL에서 blogId와 logNo 추출
        const blogInfo = extractBlogInfo(postUrl)
        if (!blogInfo) {
            return {
                success: false,
                error: '올바른 네이버 블로그 포스트 URL이 아닙니다.',
            }
        }

        const { blogId, logNo } = blogInfo
        console.log(`blogId: ${blogId}, logNo: ${logNo}`)
        // 2. 포스트 HTML 가져오기
        const html = await fetchPostHTML(blogId, logNo)
        if (!html) {
            return {
                success: false,
                error: '포스트를 불러올 수 없습니다.',
            }
        }

        // 3. 정보 추출
        const title = extractTitle(html)
        const nickname = extractNickname(html)
        const publishDate = extractPublishDate(html)
        const { content, contentLength } = extractContentFromHTML(html)

        if (!content || contentLength === 0) {
            return {
                success: false,
                error: '포스트 본문을 찾을 수 없습니다.',
            }
        }

        return {
            success: true,
            data: {
                title,
                nickname,
                publishDate,
                contentLength,
                content,
                blogId,
                logNo,
            },
        }
    } catch (error) {
        console.error('포스트 분석 오류:', error)
        return {
            success: false,
            error: '포스트 분석 중 오류가 발생했습니다.',
        }
    }
}

// 금칙어 검사
export async function checkBannedWords(content: string): Promise<BannedWordsResult> {
    try {
        console.log('📤 금칙어 검사 요청 본문 길이:', content.length, '자')
        console.log('📤 금칙어 검사 요청 본문 미리보기 (처음 100자):', content.substring(0, 100))

        // 원본 스크립트처럼 JSON.stringify(text) 형식으로 전송
        const response = await fetch('https://riacg0udgj.execute-api.ap-northeast-2.amazonaws.com/dev/hello-lambda', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(content), // 원본: xhr.send(JSON.stringify(text))
        })

        const result = await response.json()

        // Lambda 응답 디버깅
        console.log('🔍 금칙어 검사 Lambda 응답:', result)

        // HTML 응답 파싱
        const htmlResponse = result as string
        const bannedWords: string[] = []
        const keywords: string[] = []

        // 금지어 위반 목록 파싱
        const bannedWordsSection = htmlResponse.match(/### 금지어 위반 목록 ###<br>([\s\S]*?)(?=### 키워드 목록 ###|$)/)
        if (bannedWordsSection && bannedWordsSection[1]) {
            const bannedWordsText = bannedWordsSection[1]
            // "단어: 횟수<br>" 형식에서 단어 추출
            const bannedMatches = bannedWordsText.matchAll(/([^:]+):\s*(\d+)<br>/g)
            for (const match of bannedMatches) {
                if (match[1] && match[1].trim()) {
                    bannedWords.push(match[1].trim())
                }
            }
        }

        // 키워드 목록 파싱
        const keywordsSection = htmlResponse.match(/### 키워드 목록 ###<br>([\s\S]*)/)
        if (keywordsSection && keywordsSection[1]) {
            const keywordsText = keywordsSection[1]
            // "단어: 횟수<br>" 형식에서 단어 추출
            const keywordMatches = keywordsText.matchAll(/([^:]+):\s*(\d+)<br>/g)
            for (const match of keywordMatches) {
                if (match[1] && match[1].trim()) {
                    keywords.push(match[1].trim())
                }
            }
        }

        const hasBannedWords = bannedWords.length > 0

        return {
            success: true,
            data: {
                hasBannedWords,
                bannedWords,
                keywords,
                message: hasBannedWords ? `${bannedWords.length}개의 금칙어 발견` : '금칙어 없음',
            },
        }
    } catch (error) {
        console.error('금칙어 검사 오류:', error)
        return {
            success: false,
            error: '금칙어 검사 중 오류가 발생했습니다.',
        }
    }
}

// 형태소 분석 (2회 이상 등장하는 한글 단어 추출)
export async function analyzeMorphemes(content: string): Promise<MorphemeAnalysisResult> {
    try {
        // 한글 단어 추출 (2글자 이상)
        const koreanWords = content.match(/[가-힣]{2,}/g) || []

        // 빈도수 계산
        const wordCount: Record<string, number> = {}
        for (const word of koreanWords) {
            wordCount[word] = (wordCount[word] || 0) + 1
        }

        // 2회 이상 등장하는 단어만 필터링 및 정렬
        const morphemes: MorphemeItem[] = Object.entries(wordCount)
            .filter(([_, count]) => count >= 2)
            .map(([word, count]) => ({ word, count }))
            .sort((a, b) => b.count - a.count) // 빈도수 내림차순 정렬

        return {
            success: true,
            data: morphemes,
        }
    } catch (error) {
        console.error('형태소 분석 오류:', error)
        return {
            success: false,
            error: '형태소 분석 중 오류가 발생했습니다.',
        }
    }
}
