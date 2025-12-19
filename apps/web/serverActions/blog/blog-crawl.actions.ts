'use server'

import { analyzePost, type PostAnalysisResult } from './blog-post-analysis.actions'

export interface CrawledBlogPost {
    url: string
    title: string
    content: string
    category: string
    success: boolean
    error?: string
}

export interface CrawlBlogsResult {
    success: boolean
    data?: CrawledBlogPost[]
    error?: string
}

// 전환용 글쓰기 참고 블로그 URL 목록
const CONVERSION_BLOG_URLS = {
    피부과: [
        'https://blog.naver.com/highly_1/223698871437',
        'https://blog.naver.com/polo8358/223547592783',
        'https://blog.naver.com/xhnitvxgk/223525135719',
        'https://blog.naver.com/xhnitvxgk/223498605823',
        'https://m.blog.naver.com/novaskin777/223513654788',
        'https://m.blog.naver.com/dr_ranuncle/223531955605',
    ],
    성형외과: [
        'https://blog.naver.com/dite_black/223731525698',
        'https://blog.naver.com/rlawldls10041/223326892450',
    ],
    한의원: [
        'https://blog.naver.com/ekdowna735',
        'https://blog.naver.com/sjs8667/223576603011',
        'https://blog.naver.com/hxy4soixg/223390860688',
    ],
    치과: [
        'https://blog.naver.com/carjhr0710/223576579803',
        'https://blog.naver.com/spriner/223545242042',
        'https://m.blog.naver.com/spriner/223577814686',
        'https://blog.naver.com/brhappy0/223581189090',
        'https://blog.naver.com/sjs8667/223579335735',
        'https://blog.naver.com/misosmilebp/223580895528',
        'https://blog.naver.com/chika_wang',
        'https://blog.naver.com/gdtree0204/223580369004',
        'https://blog.naver.com/seouldasibom/223514900819',
        'https://blog.naver.com/goeunteeth1/223568559303',
        'https://m.blog.naver.com/dr_momskids/223510266723',
    ],
    정형외과: [
        'https://blog.naver.com/gojpd15/223574676519',
        'https://blog.naver.com/dr-bigstar/223581698430',
        'https://blog.naver.com/onleeman/223578915900',
        'https://blog.naver.com/uajdu3qn/223252755476',
        'https://blog.naver.com/teunsw/223558331033',
        'https://blog.naver.com/thegangchu7/223580907159',
        'https://blog.naver.com/solhospital1/223369029589',
        'https://blog.naver.com/uajdu3qn/223256303499',
    ],
    안과: ['https://blog.naver.com/jalsaljagu/223565572844', 'https://blog.naver.com/jalsaljagu/223025023126'],
    요양병원: [
        'https://blog.naver.com/danaoom/223542044531',
        'https://blog.naver.com/kwshop88/223555365481',
        'https://m.blog.naver.com/dj_hospital/223477675309',
    ],
    'BEST VER': [
        'https://blog.naver.com/200_dental/224028738796',
        'https://blog.naver.com/djgeaynxu/224076080837',
        'https://blog.naver.com/200_dental/224076121744',
        'https://blog.naver.com/prey6728/224078754539',
    ],
    '대행사 VER': [
        'https://blog.naver.com/marketingssok/224001494378',
        'https://blog.naver.com/marketingssok/224004672186',
    ],
}

/**
 * 여러 블로그 URL을 크롤링하여 제목과 본문을 추출
 */
export async function crawlConversionBlogs(
    categories?: string[],
    maxPerCategory?: number
): Promise<CrawlBlogsResult> {
    try {
        const results: CrawledBlogPost[] = []
        const categoriesToCrawl = categories || Object.keys(CONVERSION_BLOG_URLS)

        for (const category of categoriesToCrawl) {
            const urls = CONVERSION_BLOG_URLS[category as keyof typeof CONVERSION_BLOG_URLS]
            if (!urls) continue

            const urlsToCrawl = maxPerCategory ? urls.slice(0, maxPerCategory) : urls

            for (const url of urlsToCrawl) {
                console.log(`크롤링 중: ${category} - ${url}`)

                const result = await analyzePost(url)

                if (result.success && result.data) {
                    results.push({
                        url,
                        title: result.data.title,
                        content: result.data.content,
                        category,
                        success: true,
                    })
                } else {
                    results.push({
                        url,
                        title: '',
                        content: '',
                        category,
                        success: false,
                        error: result.error || '크롤링 실패',
                    })
                }

                // 네이버 서버 부하 방지를 위한 딜레이 (1초)
                await new Promise((resolve) => setTimeout(resolve, 1000))
            }
        }

        return {
            success: true,
            data: results,
        }
    } catch (error) {
        console.error('블로그 크롤링 오류:', error)
        return {
            success: false,
            error: '블로그 크롤링 중 오류가 발생했습니다.',
        }
    }
}

/**
 * 특정 카테고리의 블로그만 크롤링
 */
export async function crawlBlogsByCategory(category: string, maxPosts?: number): Promise<CrawlBlogsResult> {
    return crawlConversionBlogs([category], maxPosts)
}

/**
 * BEST VER 블로그만 크롤링
 */
export async function crawlBestBlogs(): Promise<CrawlBlogsResult> {
    return crawlConversionBlogs(['BEST VER'])
}
