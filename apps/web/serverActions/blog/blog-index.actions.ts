// 'use server'

// import {
//   BlogIndexMeasurementRequest,
//   BlogIndexMeasurementResponse,
//   BlogInfo,
//   INDEX_GRADE_TO_SCORE,
//   SCORE_THRESHOLDS,
//   IndexGrade,
//   NB_SCORE_THRESHOLDS,
// } from '@/features/blog/index/index.const'
// import { prisma } from '@repo/sellogic-database'

// // Lambda 함수 URL 설정
// const LAMBDA_FETCH_BLOG_INFO_URL = process.env.LAMBDA_FETCH_BLOG_INFO_URL
// const LAMBDA_FETCH_BLOG_POSTS_URL = process.env.LAMBDA_FETCH_BLOG_POSTS_URL
// const LAMBDA_MEASURE_POST_INDEX_URL = process.env.LAMBDA_MEASURE_POST_INDEX_URL
// const LAMBDA_FETCH_POST_DETAILS_URL = process.env.LAMBDA_FETCH_POST_DETAILS_URL
// const LAMBDA_FETCH_POPULAR_POSTS_URL = process.env.LAMBDA_FETCH_POPULAR_POSTS_URL

// // Rate Limiting을 위한 간단한 딜레이 함수
// async function delay(ms: number): Promise<void> {
//   return new Promise(resolve => setTimeout(resolve, ms))
// }

// // 요청 간격을 위한 전역 변수
// let lastRequestTime = 0
// const MIN_REQUEST_INTERVAL = 500 // 1초 간격

// // Rate Limiting 함수
// async function ensureRequestInterval(): Promise<void> {
//   const now = Date.now()
//   const timeSinceLastRequest = now - lastRequestTime

//   if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
//     const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest
//     console.log(`Rate limiting: ${waitTime}ms 대기 중...`)
//     await delay(waitTime)
//   }

//   lastRequestTime = Date.now()
// }

// // User-Agent 로테이션을 위한 배열
// const USER_AGENTS = [
//   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//   'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
//   'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
//   'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
// ]

// // 랜덤 User-Agent 선택
// function getRandomUserAgent(): string {
//   return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)] ?? USER_AGENTS[0] ?? ''
// }

// // 안전한 fetch 함수 (Rate Limiting + 에러 처리 + User-Agent 로테이션)
// async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
//   await ensureRequestInterval()

//   // User-Agent 로테이션
//   const headers = {
//     ...options.headers,
//     'User-Agent': getRandomUserAgent(),
//   }

//   const finalOptions = {
//     ...options,
//     headers,
//   }

//   try {
//     const response = await fetch(url, finalOptions)

//     // 429 Too Many Requests 처리
//     if (response.status === 429) {
//       console.log('429 에러 발생 - 1초 대기 후 재시도...')
//       await delay(1000)
//       return await fetch(url, finalOptions)
//     }

//     return response
//   } catch (error) {
//     console.error('Fetch 오류:', error)
//     throw error
//   }
// }

// // 네이버 블로그 인덱스 측정 함수
// export async function measureBlogIndex(request: BlogIndexMeasurementRequest): Promise<BlogIndexMeasurementResponse> {
//   try {
//     const { keyword, refreshData = false, addToHistory = true } = request

//     // 키워드가 없으면 에러 반환
//     if (!keyword || !keyword.trim()) {
//       return {
//         success: false,
//         error: '검색어를 입력해주세요.',
//       }
//     }

//     // 1. 블로그 ID 추출 (URL에서 또는 직접 입력)
//     const blogId = extractBlogId(keyword)
//     if (!blogId) {
//       return {
//         success: false,
//         error: '유효한 블로그 ID 또는 URL을 입력해주세요.',
//       }
//     }

//     // 2. refreshData가 false면 오늘 일자 DB 데이터 먼저 확인
//     if (!refreshData) {
//       const cachedData = await getBlogDataToday(blogId)
//       if (cachedData) {
//         console.log('✅ 오늘 일자 캐시 데이터 사용:', blogId)

//         // 캐시 데이터 사용 시에도 히스토리 저장 (직접 검색인 경우만)
//         // if (addToHistory) {
//         //   const { addBlogIndexHistory } = await import('./blog-history.actions')
//         //   addBlogIndexHistory({
//         //     blogId,
//         //     displayNickName: cachedData.data?.blogInfo?.displayNickName,
//         //     profileImage: cachedData.data?.blogInfo?.profileImage,
//         //   }).catch(err => console.error('히스토리 저장 실패:', err))
//         // }

//         return cachedData
//       }
//       console.log('⏳ 캐시 없음, 새로 측정합니다:', blogId)
//     } else {
//       console.log('🔄 강제 갱신 요청, 재측정합니다:', blogId)
//     }

//     // 3. 블로그 기본 정보 조회
//     const blogInfo = await fetchBlogInfo(blogId)
//     if (!blogInfo) {
//       return {
//         success: false,
//         error: '블로그 정보를 조회할 수 없습니다.',
//       }
//     }
//     console.log('blogInfo', blogInfo)

//     // 4. 블로그 포스트 목록 조회 및 지수 측정
//     const indexResult = await measureBlogIndexFromPosts(blogId, blogInfo)
//     if (!indexResult.success) {
//       return indexResult
//     }

//     // 5. 히스토리 저장 (직접 검색인 경우만, 비동기, 실패해도 결과 반환)
//     // if (addToHistory) {
//     //   const { addBlogIndexHistory } = await import('./blog-history.actions')
//     //   addBlogIndexHistory({
//     //     blogId,
//     //     displayNickName: blogInfo.displayNickName,
//     //     profileImage: blogInfo.profileImage,
//     //   }).catch(err => console.error('히스토리 저장 실패:', err))
//     // }

//     return {
//       success: true,
//       data: {
//         blogInfo,
//         blogIndex: indexResult.blogIndex!,
//         optimizationMetrics: indexResult.optimizationMetrics,
//         popularPosts: indexResult.popularPosts, // 인기 게시글 전달
//       },
//     }
//   } catch (error) {
//     console.error('블로그 인덱스 측정 오류:', error)
//     return {
//       success: false,
//       error: '블로그 인덱스 측정 중 오류가 발생했습니다.',
//     }
//   }
// }

// // 블로그 ID 추출 함수
// function extractBlogId(input: string): string | null {
//   const trimmedInput = input.trim()

//   // URL 패턴 매칭
//   const urlPatterns = [/blog\.naver\.com\/([^/?]+)/, /m\.blog\.naver\.com\/([^/?]+)/]

//   for (const pattern of urlPatterns) {
//     const match = trimmedInput.match(pattern)
//     if (match) {
//       return match[1] ?? null
//     }
//   }

//   // 직접 블로그 ID인 경우
//   if (/^[a-zA-Z0-9_-]+$/.test(trimmedInput)) {
//     return trimmedInput
//   }

//   return null
// }

// // 람다를 통한 블로그 정보 조회
// async function fetchBlogInfoWithLambda(blogId: string): Promise<BlogInfo | null> {
//   try {
//     const response = await fetch(LAMBDA_FETCH_BLOG_INFO_URL!, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ blogId }),
//       signal: AbortSignal.timeout(30000), // 30초 타임아웃
//     })

//     // 응답 본문을 먼저 읽어서 에러 정보 확인
//     const responseText = await response.text()

//     if (!response.ok) {
//       console.error(`❌ Lambda 함수 호출 실패: ${response.status} ${response.statusText}`)
//       console.error(`응답 본문:`, responseText.substring(0, 500))

//       // 502 Bad Gateway는 Lambda 타임아웃일 가능성이 높음
//       if (response.status === 502) {
//         console.warn('⚠️ Lambda 타임아웃 가능성 - Lambda 함수의 타임아웃 설정을 확인하세요 (최소 30초 권장)')
//       }

//       throw new Error(`Lambda 함수 호출 실패: ${response.status} ${response.statusText}`)
//     }

//     const result = JSON.parse(responseText)
//     const parsedResult = result.body ? (typeof result.body === 'string' ? JSON.parse(result.body) : result.body) : result

//     if (!parsedResult.success) {
//       throw new Error(parsedResult.error || 'Lambda 함수에서 오류 발생')
//     }

//     return parsedResult.data || null
//   } catch (error) {
//     console.error(`❌ Lambda 블로그 정보 조회 실패:`, error)

//     // 타임아웃 에러 처리
//     if (error instanceof Error && error.name === 'AbortError') {
//       console.warn('⚠️ Lambda 호출 타임아웃 - Lambda 함수의 타임아웃 설정을 확인하세요')
//     }

//     return null
//   }
// }

// // 블로그 기본 정보 조회
// export async function fetchBlogInfo(blogId: string): Promise<BlogInfo | null> {
//   // Lambda 함수 URL이 설정되어 있으면 Lambda 사용
//   if (LAMBDA_FETCH_BLOG_INFO_URL) {
//     console.log('🔗 Lambda를 통한 블로그 정보 조회')
//     return await fetchBlogInfoWithLambda(blogId)
//   }

//   try {
//     // 네이버 블로그 기본 정보 API 호출
//     // const response = await fetch(`https://m.blog.naver.com/api/blogs/${blogId}`, {
//     //   headers: {
//     //     'User-Agent':
//     //       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//     //     Accept: 'application/json, text/plain, */*',
//     //     'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
//     //     'Accept-Encoding': 'gzip, deflate, br',
//     //     Referer: `https://m.blog.naver.com/${blogId}`,
//     //     Origin: 'https://m.blog.naver.com',
//     //     Connection: 'keep-alive',
//     //     'Sec-Fetch-Dest': 'empty',
//     //     'Sec-Fetch-Mode': 'cors',
//     //     'Sec-Fetch-Site': 'same-origin',
//     //     'Cache-Control': 'no-cache',
//     //     Pragma: 'no-cache',
//     //   },
//     // })

//     const response = await safeFetch(`https://m.blog.naver.com/api/blogs/${blogId}`, {
//       headers: {
//         Accept:
//           'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
//         'Accept-Encoding': 'gzip, deflate, br, zstd',
//         'Accept-Language': 'ko,en;q=0.9,en-US;q=0.8',
//         // Cookie:
//         //   'NAC=LG0IBwwNfuHdB; NNB=BZOTMC5ZXSZGQ; BA_DEVICE=3a41961e-f716-4f13-bc23-18aafb7e5542; ba.uuid=d14bf2d4-6064-439b-8734-2f3839d059dd; NACT=1; SRT30=1758694727; SRT5=1758694727; _naver_usersession_=OcKOjoAtFnwrsmzDtwvS0g==; page_uid=jLMLTspzL8wss4i4d4dssssstoR-445549; BUC=LLVJwAbM2arPK8Or4yly8baIF1IMNc_B7vIbB0MLj1M=; JSESSIONID=51EFEEA98AC6638021870D31BC123223.jvm1',
//         Priority: 'u=0, i',
//         Referer: 'https://blog.naver.com',
//         'Sec-Ch-Ua': 'Chromium;v="140", "Not=A?Brand";v="24", "Microsoft Edge";v="140"',
//         'Sec-Ch-Ua-Mobile': '?0',
//         'Sec-Ch-Ua-Platform': 'macOS',
//         'Sec-Fetch-Dest': 'iframe',
//         'Sec-Fetch-Mode': 'navigate',
//         'Sec-Fetch-Site': 'same-origin',
//         'Upgrade-Insecure-Requests': '1',
//       },
//     })

//     console.log(`블로그 정보 조회 응답: ${response.status} ${response.statusText}`)
//     console.log('응답 헤더:', Object.fromEntries(response.headers.entries()))

//     if (!response.ok) {
//       console.error('블로그 정보 조회 실패:', response.status)

//       // 403 에러인 경우 다른 URL 시도
//       if (response.status === 403) {
//         console.log('403 에러 - 다른 접근 방법 시도...')
//         return await tryAlternativeBlogInfo(blogId)
//       }

//       return null
//     }

//     const data = await response.json()
//     console.log('블로그 조회 data는 이렇게 들어옴 : ', data)

//     // 응답 구조에 맞게 데이터 추출
//     const blogInfo = data.result || data

//     const blogTotalPostsData = await safeFetch(
//       `https://blog.naver.com/PostList.naver?blogId=${blogId}&skinType=&skinId=&from=menu`,
//       {
//         headers: {
//           Accept:
//             'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
//           'Accept-Encoding': 'gzip, deflate, br, zstd',
//           'Accept-Language': 'ko,en;q=0.9,en-US;q=0.8',
//         },
//       },
//     )

//     // HTML 응답에서 전체 글 개수 추출
//     const htmlText = await blogTotalPostsData.text()

//     // </strong></a> 뒤에 오는 숫자를 추출하는 정규식 (쉼표 포함)
//     const totalPostsMatch = htmlText.match(/<\/strong><\/a>\s*([\d,]+)개의 글/)
//     const totalPosts = totalPostsMatch?.[1] ? parseInt(totalPostsMatch[1].replace(/,/g, ''), 10) : 0

//     blogInfo.totalPosts = totalPosts

//     // 블로그 히스토리에서 생성일 추출
//     try {
//       const blogHistoryData = await safeFetch(`https://blog.naver.com/profile/history.naver?blogId=${blogId}`, {
//         headers: {
//           Accept:
//             'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
//           'Accept-Encoding': 'gzip, deflate, br, zstd',
//           'Accept-Language': 'ko,en;q=0.9,en-US;q=0.8',
//         },
//       })

//       const historyHtml = await blogHistoryData.text()

//       // 날짜 패턴 추출: YYYY.MM.DD. 형태
//       const dateMatches = historyHtml.match(/(\d{4}\.\d{2}\.\d{2}\.)/g)

//       if (dateMatches && dateMatches.length > 0) {
//         // 가장 오래된 날짜를 생성일로 사용 (첫 번째 매치)
//         const oldestDate = dateMatches[0].replace(/\./g, '-').slice(0, -1) // 2009.03.09. -> 2009-03-09
//         blogInfo.createdDate = oldestDate
//       }
//     } catch (error) {
//       console.log('블로그 히스토리 조회 실패:', error)
//       // 히스토리 조회 실패 시 기존 createdDate 유지
//     }

//     return {
//       blogId,
//       blogName: blogInfo.blogName,
//       blogUrl: `https://blog.naver.com/${blogId}`,
//       displayNickName: blogInfo.displayNickName,
//       createdDate: blogInfo.createdDate,
//       dayVisitors: blogInfo.dayVisitorCount,
//       subscriberCount: blogInfo.subscriberCount,
//       totalVisitorCount: blogInfo.totalVisitorCount,
//       totalPosts: blogInfo.totalPosts,
//       blogDirectory: blogInfo.blogDirectoryName,
//       profileImage: blogInfo.profileImagePath,
//     }
//   } catch (error) {
//     console.error('블로그 정보 조회 오류:', error)

//     // API 실패 시 기본 정보 반환
//     return {
//       blogId,
//       blogName: `${blogId} 블로그`,
//       blogUrl: `https://blog.naver.com/${blogId}`,
//     }
//   }
// }

// // 대안 블로그 정보 조회 방법
// async function tryAlternativeBlogInfo(blogId: string): Promise<BlogInfo | null> {
//   try {
//     console.log('대안 방법으로 블로그 정보 조회 시도:', blogId)

//     // 방법 1: 데스크톱 버전 시도
//     const desktopUrl = `https://blog.naver.com/${blogId}`
//     const response1 = await safeFetch(desktopUrl, {
//       headers: {
//         Accept:
//           'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
//         'Accept-Encoding': 'gzip, deflate, br, zstd',
//         'Accept-Language': 'ko,en;q=0.9,en-US;q=0.8',
//         // Cookie:
//         //   'NAC=LG0IBwwNfuHdB; NNB=BZOTMC5ZXSZGQ; BA_DEVICE=3a41961e-f716-4f13-bc23-18aafb7e5542; ba.uuid=d14bf2d4-6064-439b-8734-2f3839d059dd; NACT=1; SRT30=1758694727; SRT5=1758694727; _naver_usersession_=OcKOjoAtFnwrsmzDtwvS0g==; page_uid=jLMLTspzL8wss4i4d4dssssstoR-445549; BUC=LLVJwAbM2arPK8Or4yly8baIF1IMNc_B7vIbB0MLj1M=; JSESSIONID=51EFEEA98AC6638021870D31BC123223.jvm1',
//         Priority: 'u=0, i',
//         Referer: 'https://blog.naver.com',
//         'Sec-Ch-Ua': 'Chromium;v="140", "Not=A?Brand";v="24", "Microsoft Edge";v="140"',
//         'Sec-Ch-Ua-Mobile': '?0',
//         'Sec-Ch-Ua-Platform': 'macOS',
//         'Sec-Fetch-Dest': 'iframe',
//         'Sec-Fetch-Mode': 'navigate',
//         'Sec-Fetch-Site': 'same-origin',
//         'Upgrade-Insecure-Requests': '1',
//       },
//     })

//     console.log(`데스크톱 버전 응답: ${response1.status}`)

//     if (response1.ok) {
//       // HTML 파싱으로 블로그명 추출 시도
//       const html = await response1.text()
//       const titleMatch = html.match(/<title>([^<]+)<\/title>/)
//       const blogName = titleMatch?.[1] ? titleMatch[1].replace(' : 네이버 블로그', '') : `${blogId} 블로그`

//       console.log('HTML에서 추출한 블로그명:', blogName)

//       return {
//         blogId,
//         blogName,
//         blogUrl: `https://blog.naver.com/${blogId}`,
//         createdDate: new Date().toISOString().split('T')[0],
//       }
//     }

//     // 모든 방법 실패 시 기본 정보 반환
//     return {
//       blogId,
//       blogName: `${blogId}`,
//       blogUrl: `https://blog.naver.com/${blogId}`,
//     }
//   } catch (error) {
//     console.error('대안 방법도 실패:', error)

//     // 최후의 수단: 기본 정보
//     return {
//       blogId,
//       blogName: `${blogId}`,
//       blogUrl: `https://blog.naver.com/${blogId}`,
//     }
//   }
// }

// // 블로그 포스트 목록 조회 및 지수 측정
// async function measureBlogIndexFromPosts(
//   blogId: string,
//   blogInfo: BlogInfo,
// ): Promise<{
//   success: boolean
//   blogIndex?: any
//   optimizationMetrics?: any
//   popularPosts?: Array<{ title: string; logNo: string; views?: number }>
//   error?: string
// }> {
//   try {
//     // 1. 블로그 포스트 목록 조회
//     const posts = await fetchBlogPosts(blogId)
//     if (!posts || posts.length === 0) {
//       return {
//         success: false,
//         error: '블로그 포스트를 조회할 수 없습니다.',
//       }
//     }

//     // 인기 게시글 조회 (선택적)
//     const popularPosts = await fetchPopularPosts(blogId)

//     // 2. 각 포스트의 지수 측정 (10개 포스트)
//     const selectedPosts = posts.slice(0, 10)

//     const postScores = await Promise.all(selectedPosts.map(post => measurePostIndex(post.title, post.logNo)))

//     // 3. 각 포스트의 상세 정보 병렬 조회 (댓글/공감 포함)
//     const postDetailsPromises = selectedPosts.map(post => fetchPostDetails(blogId, post.logNo))
//     const postDetailsList = await Promise.all(postDetailsPromises)

//     // 4. 점수를 points로 변환하고 합계 계산
//     let totalSum = 0
//     let qualitySum = 0
//     let qualityCount = 0
//     const scoreDetails = []

//     for (let i = 0; i < postScores.length; i++) {
//       const score = postScores[i]
//       const post = selectedPosts[i]
//       const details = postDetailsList[i]
//       let points = 0

//       if (score !== null && typeof score === 'number' && !isNaN(score)) {
//         // quality 값을 SCORE_THRESHOLDS 기준으로 points로 변환
//         points = getPointsFromQuality(score)
//         qualitySum += score
//         qualityCount++
//       }

//       totalSum += points

//       // post가 undefined일 수 있으므로 체크
//       if (!post) {
//         continue
//       }

//       scoreDetails.push({
//         title: post.title || '',
//         logNo: post.logNo || '',
//         quality: score ?? null,
//         points,
//         // API에서 가져온 publishDate 사용
//         publishDate: post.publishDate,
//         contentLength: details?.contentLength,
//         imageCount: details?.imageCount,
//         // API에서 가져온 commentCount를 우선 사용, 없으면 HTML 파싱한 값 사용
//         commentCount: post.commentCount !== undefined ? post.commentCount : details?.commentCount,
//         likeCount: details?.likeCount,
//       })
//     }

//     console.log(`📈 Quality 통계: 총 ${qualityCount}개 포스트, 합계: ${qualitySum.toFixed(3)}`)

//     // 5. 평균 점수 및 평균 quality 계산, 최종 등급 결정
//     const averageScore = totalSum / selectedPosts.length
//     let averageQuality = qualityCount > 0 ? qualitySum / qualityCount : 0

//     // NaN 체크 및 보정
//     if (isNaN(averageQuality) || !isFinite(averageQuality)) {
//       console.warn('⚠️ averageQuality가 NaN 또는 Infinity입니다. 0으로 보정합니다.')
//       averageQuality = 0
//     }

//     const grade = calculateFinalGrade(averageScore)

//     console.log(`📊 평균 Quality: ${averageQuality.toFixed(3)}, 평균 Score: ${averageScore.toFixed(2)}, 등급: ${grade}`)

//     // 6. scoreDetails를 quality 기준으로 내림차순 정렬
//     const sortedScoreDetails = [...scoreDetails]
//     // .sort((a, b) => {
//     //   // null은 가장 낮은 값으로 취급
//     //   const qualityA = a.quality ?? -1
//     //   const qualityB = b.quality ?? -1
//     //   return qualityB - qualityA // 내림차순
//     // })

//     // 7. DB에 저장 (Blog 및 BlogHistory)
//     await saveBlogData(blogId, blogInfo, averageQuality, averageScore, grade, sortedScoreDetails, popularPosts || [])

//     return {
//       success: true,
//       blogIndex: {
//         topicIndex: grade,
//         overallIndex: grade,
//         maxIndex: grade,
//         blogTopic: '일반',
//       },
//       optimizationMetrics: {
//         score: averageScore,
//         grade,
//         totalSum,
//         selectedPostsCount: 10,
//         scoreDetails: sortedScoreDetails, // 정렬된 데이터 사용
//       },
//       popularPosts: popularPosts || [], // 인기 게시글 추가
//     }
//   } catch (error) {
//     console.error('포스트 지수 측정 오류:', error)
//     return {
//       success: false,
//       error: '포스트 지수 측정 중 오류가 발생했습니다.',
//     }
//   }
// }

// // 람다를 통한 블로그 포스트 목록 조회
// async function fetchBlogPostsWithLambda(blogId: string): Promise<Array<{ title: string; logNo: string; commentCount?: number; publishDate?: string }> | null> {
//   try {
//     const response = await fetch(LAMBDA_FETCH_BLOG_POSTS_URL!, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ blogId }),
//       signal: AbortSignal.timeout(30000), // 30초 타임아웃
//     })

//     // 응답 본문을 먼저 읽어서 에러 정보 확인
//     const responseText = await response.text()

//     if (!response.ok) {
//       console.error(`❌ Lambda 함수 호출 실패: ${response.status} ${response.statusText}`)
//       console.error(`응답 본문:`, responseText.substring(0, 500))

//       if (response.status === 502) {
//         console.warn('⚠️ Lambda 타임아웃 가능성 - Lambda 함수의 타임아웃 설정을 확인하세요 (최소 30초 권장)')
//       }

//       throw new Error(`Lambda 함수 호출 실패: ${response.status} ${response.statusText}`)
//     }

//     const result = JSON.parse(responseText)
//     const parsedResult = result.body ? (typeof result.body === 'string' ? JSON.parse(result.body) : result.body) : result

//     if (!parsedResult.success) {
//       throw new Error(parsedResult.error || 'Lambda 함수에서 오류 발생')
//     }

//     return parsedResult.data || null
//   } catch (error) {
//     console.error(`❌ Lambda 블로그 포스트 목록 조회 실패:`, error)

//     if (error instanceof Error && error.name === 'AbortError') {
//       console.warn('⚠️ Lambda 호출 타임아웃 - Lambda 함수의 타임아웃 설정을 확인하세요')
//     }

//     return null
//   }
// }

// // 블로그 포스트 목록 조회 (다중 페이지)
// async function fetchBlogPosts(
//   blogId: string,
// ): Promise<Array<{ title: string; logNo: string; commentCount?: number; publishDate?: string }> | null> {
//   // Lambda 함수 URL이 설정되어 있으면 Lambda 사용
//   if (LAMBDA_FETCH_BLOG_POSTS_URL) {
//     console.log('🔗 Lambda를 통한 블로그 포스트 목록 조회')
//     return await fetchBlogPostsWithLambda(blogId)
//   }

//   console.log('📄 다중 페이지로 포스트 수집 시작...')

//   const allPosts: Array<{ title: string; logNo: string; commentCount?: number; publishDate?: string }> = []
//   let currentPage = 1
//   const maxPages = 1 // 최대 1페이지까지 시도

//   while (currentPage <= maxPages) {
//     console.log(`📄 페이지 ${currentPage} 요청 중...`)
//     const endpoint = `https://blog.naver.com/PostTitleListAsync.naver?blogId=${blogId}&currentPage=${currentPage}&countPerPage=10&categoryNo=0&parentCategoryNo=0`
//     // const endpoint = `https://blog.naver.com/api/blogs/${blogId}/post-list`

//     try {
//       const response = await safeFetch(endpoint, {
//         method: 'GET',
//         headers: {
//           Accept:
//             'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
//           'Accept-Encoding': 'gzip, deflate, br, zstd',
//           'Accept-Language': 'ko,en;q=0.9,en-US;q=0.8',
//           // Cookie:
//           //   'NAC=LG0IBwwNfuHdB; NNB=BZOTMC5ZXSZGQ; BA_DEVICE=3a41961e-f716-4f13-bc23-18aafb7e5542; ba.uuid=d14bf2d4-6064-439b-8734-2f3839d059dd; NACT=1; SRT30=1758694727; SRT5=1758694727; _naver_usersession_=OcKOjoAtFnwrsmzDtwvS0g==; page_uid=jLMLTspzL8wss4i4d4dssssstoR-445549; BUC=LLVJwAbM2arPK8Or4yly8baIF1IMNc_B7vIbB0MLj1M=; JSESSIONID=51EFEEA98AC6638021870D31BC123223.jvm1',
//           Priority: 'u=0, i',
//           Referer: 'https://blog.naver.com',
//           'Sec-Ch-Ua': 'Chromium;v="140", "Not=A?Brand";v="24", "Microsoft Edge";v="140"',
//           'Sec-Ch-Ua-Mobile': '?0',
//           'Sec-Ch-Ua-Platform': 'macOS',
//           'Sec-Fetch-Dest': 'iframe',
//           'Sec-Fetch-Mode': 'navigate',
//           'Sec-Fetch-Site': 'same-origin',
//           'Upgrade-Insecure-Requests': '1',
//           'User-Agent':
//             'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0',
//         },
//         // headers: {
//         //   'User-Agent':
//         //     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//         //   Accept: 'application/json, text/javascript, */*; q=0.01',
//         //   'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
//         //   Referer: `https://blog.naver.com/${blogId}`,
//         //   'X-Requested-With': 'XMLHttpRequest',
//         //   // gzip 압축 해제를 위해 Accept-Encoding 제거
//         // },
//       })

//       if (response.ok) {
//         const responseText = await response.text()
//         console.log(`페이지 ${currentPage} 응답 길이: ${responseText.length}`)

//         // console.log('responseText', responseText)

//         // 포스트 추출
//         const pagePosts = await parsePostsFromResponse(responseText, blogId, currentPage)

//         if (pagePosts && pagePosts.length > 0) {
//           allPosts.push(...pagePosts)
//           console.log(`✅ 페이지 ${currentPage}: ${pagePosts.length}개 포스트 추가 (총 ${allPosts.length}개)`)
//           currentPage++

//           // 잠시 대기 (요청 제한 방지)
//           await new Promise(resolve => setTimeout(resolve, 200))
//         } else {
//           console.log(`❌ 페이지 ${currentPage}: 포스트 없음 - 수집 종료`)
//           break
//         }
//       } else {
//         console.log(`❌ 페이지 ${currentPage} 요청 실패: ${response.status}`)
//         break
//       }
//     } catch (error) {
//       console.error(`페이지 ${currentPage} 오류:`, error)
//       break
//     }
//   }

//   console.log(`🎯 총 ${allPosts.length}개 포스트 수집 완료!`)
//   return allPosts.length > 0 ? allPosts.slice(0, 10) : null
// }

// // 응답에서 포스트 파싱하는 별도 함수
// async function parsePostsFromResponse(
//   responseText: string,
//   blogId: string,
//   pageNum: number,
// ): Promise<Array<{ title: string; logNo: string; commentCount?: number; publishDate?: string }> | null> {
//   try {
//     // console.log('responseText는 이렇게 들어옴 : ', responseText)

//     // JSON 파싱 시도 - 여러 방법으로 시도
//     let data

//     try {
//       // 1차: 원본 그대로 파싱 시도
//       data = JSON.parse(responseText)
//     } catch {
//       console.log('1차 JSON 파싱 실패, 이스케이프 수정 후 재시도...')

//       try {
//         // 2차: 이스케이프 문제 수정 후 파싱
//         const cleanedResponse = responseText
//           .replace(/\\'/g, "'") // \' -> '
//           .replace(/\\\\/g, '\\') // \\\\ -> \\
//           .replace(/\\n/g, '') // \n 제거
//           .replace(/\\r/g, '') // \r 제거

//         data = JSON.parse(cleanedResponse)
//       } catch {
//         console.log('2차 JSON 파싱도 실패, 정규식으로 데이터 추출 시도...')

//         // 3차: 정규식으로 필요한 부분만 추출
//         const postListMatch = responseText.match(/"postList":\s*(\[.*?\])(?=,\s*"countPerPage")/s)
//         if (postListMatch && postListMatch[1]) {
//           try {
//             const postList = JSON.parse(postListMatch[1])
//             data = { resultCode: 'S', postList }
//           } catch (regexError) {
//             const errorMessage = regexError instanceof Error ? regexError.message : String(regexError)
//             throw new Error(`모든 JSON 파싱 방법 실패: ${errorMessage}`)
//           }
//         } else {
//           throw new Error('postList를 찾을 수 없음')
//         }
//       }
//     }

//     // 응답 구조 확인: resultCode가 "S"인지 체크
//     if (data.resultCode !== 'S') {
//       console.log(`페이지 ${pageNum} 응답 실패: ${data.resultMessage}`)
//       return null
//     }

//     const posts = data.postList || []

//     if (posts.length > 0) {
//       return posts.map((post: any) => {
//         try {
//           // URL 디코딩 전에 + 기호를 임시 문자로 치환
//           const preprocessed = (post.title || '').replace(/\+/g, '___SPACE___') // + -> 임시 공백 표시

//           // URL 디코딩 (%2B는 +로 변환됨)
//           let decodedTitle = decodeURIComponent(preprocessed)

//           // 임시 공백 표시를 실제 공백으로 변환
//           decodedTitle = decodedTitle.replace(/___SPACE___/g, ' ')

//           return {
//             title: decodedTitle,
//             logNo: post.logNo || '',
//             commentCount: post.commentCount && post.commentCount !== '' ? parseInt(post.commentCount, 10) : undefined,
//             publishDate: post.addDate || '',
//           }
//         } catch (decodeError) {
//           // URL 디코딩 실패 시 수동으로 처리
//           const manualDecoded = (post.title || '')
//             .replace(/%2B/g, '+') // %2B -> + (실제 플러스 기호)
//             .replace(/\+/g, ' ') // + -> 공백

//           return {
//             title: manualDecoded,
//             logNo: post.logNo || '',
//             commentCount: post.commentCount && post.commentCount !== '' ? parseInt(post.commentCount, 10) : undefined,
//             publishDate: post.addDate || '',
//           }
//         }
//       })
//     }
//   } catch (jsonError) {
//     const errorMessage = jsonError instanceof Error ? jsonError.message : String(jsonError)
//     console.log(`페이지 ${pageNum} JSON 파싱 실패:`, errorMessage)
//   }

//   return null
// }

// // 기존 단일 페이지 함수는 사용하지 않으므로 제거됨

// // HTML에서 포스트 목록 파싱 - 사용하지 않으므로 제거됨

// // 람다를 통한 포스트 지수 측정
// async function measurePostIndexWithLambda(title: string, logNo: string): Promise<number | null> {
//   try {
//     const response = await fetch(LAMBDA_MEASURE_POST_INDEX_URL!, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ title, logNo }),
//       signal: AbortSignal.timeout(60000), // 60초 타임아웃 (여러 페이지 검색 가능)
//     })

//     // 응답 본문을 먼저 읽어서 에러 정보 확인
//     const responseText = await response.text()

//     if (!response.ok) {
//       console.error(`❌ Lambda 함수 호출 실패: ${response.status} ${response.statusText}`)
//       console.error(`응답 본문:`, responseText.substring(0, 500))

//       if (response.status === 502) {
//         console.warn('⚠️ Lambda 타임아웃 가능성 - Lambda 함수의 타임아웃 설정을 확인하세요 (최소 60초 권장)')
//       }

//       throw new Error(`Lambda 함수 호출 실패: ${response.status} ${response.statusText}`)
//     }

//     const result = JSON.parse(responseText)
//     const parsedResult = result.body ? (typeof result.body === 'string' ? JSON.parse(result.body) : result.body) : result

//     if (!parsedResult.success) {
//       throw new Error(parsedResult.error || 'Lambda 함수에서 오류 발생')
//     }

//     return parsedResult.data || null
//   } catch (error) {
//     console.error(`❌ Lambda 포스트 지수 측정 실패:`, error)

//     if (error instanceof Error && error.name === 'AbortError') {
//       console.warn('⚠️ Lambda 호출 타임아웃 - Lambda 함수의 타임아웃 설정을 확인하세요')
//     }

//     return null
//   }
// }

// // 개별 포스트 지수 측정
// export async function measurePostIndex(title: string, logNo: string): Promise<number | null> {
//   // Lambda 함수 URL이 설정되어 있으면 Lambda 사용
//   if (LAMBDA_MEASURE_POST_INDEX_URL) {
//     console.log('🔗 Lambda를 통한 포스트 지수 측정')
//     return await measurePostIndexWithLambda(title, logNo)
//   }

//   try {
//     console.log(`포스트 지수 측정 시작: ${title}`)

//     // 1. 게시물 제목 전처리 (이모지 제거, 50자 제한)
//     const cleanTitle = title
//       .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '') // 이모지 제거
//       .replace(/\s+/g, ' ') // 연속된 공백을 하나로 변환
//       .substring(0, 50)
//       .trim()

//     if (!cleanTitle) {
//       console.log('제목이 비어있어서 지수 측정 불가')
//       return null
//     }

//     // 2. 네이버 검색 API 호출
//     // start는 skip 개수: 1, 8, 15, 22, 29... (페이지당 7개씩, start=0과 1은 동일하므로 1부터 시작)
//     // 3-1: 따옴표 포함 검색 (최대 5페이지 = 35개 결과 확인)
//     const quotedQuery = `"${cleanTitle}"`
//     for (let page = 1; page <= 5; page++) {
//       const start = 1 + (page - 1) * 7 // 1, 8, 15, 22, 29
//       console.log(`검색 시도 (따옴표 포함): ${quotedQuery} (start=${start}, page=${page})`)
//       const score = await callNaverSearchAPI(quotedQuery, start, logNo)
//       if (score !== null) {
//         console.log(`지수 측정 성공: ${score}`)
//         return score
//       }
//     }

//     // 3-2: 따옴표 제외 검색 (최대 5페이지 = 35개 결과 확인)
//     for (let page = 1; page <= 5; page++) {
//       const start = 1 + (page - 1) * 7 // 1, 8, 15, 22, 29
//       console.log(`검색 시도 (따옴표 제외): ${cleanTitle} (start=${start}, page=${page})`)
//       const score = await callNaverSearchAPI(cleanTitle, start, logNo)
//       if (score !== null) {
//         console.log(`지수 측정 성공: ${score}`)
//         return score
//       }
//     }

//     // 모든 시도 실패 시 null 반환
//     console.log('모든 검색 시도 실패 - 지수 측정 불가')
//     return null
//   } catch (error) {
//     console.error('포스트 지수 측정 오류:', error)
//     return null
//   }
// }

// // 네이버 검색 API 호출
// // start: skip 개수 (1부터 시작: 1, 8, 15, 22, 29... - start=0과 1은 동일)
// async function callNaverSearchAPI(query: string, start: number, logNo: string): Promise<number | null> {
//   try {
//     // 네이버 API 문서에 맞춘 URL 인코딩 (공백을 +로, 더 엄격한 인코딩)
//     const encodedQuery = encodeURIComponent(query)
//       .replace(/%20/g, '+') // 공백을 +로 변경
//       .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase()) // 특수문자 추가 인코딩

//     const url = `https://s.search.naver.com/p/review/search.naver?where=m_view&start=${start}&query=${encodedQuery}&mode=normal&sm=mtb_jum&api_type=1`

//     // console.log(`검색 URL: ${url}`)

//     const response = await safeFetch(url, {
//       headers: {
//         Accept: 'application/json, text/plain, */*',
//         Referer: 'https://www.naver.com',
//         // Accept:
//         //   'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;
//         //   v=b3;q=0.7',
//         // 'Accept-Encoding': 'gzip, deflate, br, zstd',
//         // 'Accept-Language': 'ko,en;q=0.9,en-US;q=0.8',
//         // Cookie:
//         //   'NAC=LG0IBwwNfuHdB; NNB=BZOTMC5ZXSZGQ; BA_DEVICE=3a41961e-f716-4f13-bc23-18aafb7e5542; ba.
//         //   uuid=d14bf2d4-6064-439b-8734-2f3839d059dd; NACT=1; SRT30=1758694727; SRT5=1758694727;
//         //   _naver_usersession_=OcKOjoAtFnwrsmzDtwvS0g==; page_uid=jLMLTspzL8wss4i4d4dssssstoR-445549;
//         //   BUC=LLVJwAbM2arPK8Or4yly8baIF1IMNc_B7vIbB0MLj1M=; JSESSIONID=51EFEEA98AC6638021870D31BC123223.jvm1',
//         // Priority: 'u=0, i',
//         // Referer: 'https://blog.naver.com',
//         // 'Sec-Ch-Ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Microsoft Edge";v="140"',
//         // 'Sec-Ch-Ua-Mobile': '?0',
//         // 'Sec-Ch-Ua-Platform': '"macOS"',
//         // 'Sec-Fetch-Dest': 'iframe',
//         // 'Sec-Fetch-Mode': 'navigate',
//         // 'Sec-Fetch-Site': 'same-origin',
//         // 'Upgrade-Insecure-Requests': '1',
//         // 'User-Agent':
//         //   'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.
//         //   0.0.0',
//       },
//     })

//     console.log(`검색 API 응답 상태: ${response.status} ${response.statusText}`)

//     if (!response.ok) {
//       console.log(`검색 API 실패: ${response.status}`)
//       return null
//     }

//     const responseText = await response.text()
//     // console.log(`검색 API 응답 길이: ${responseText.length}`)
//     // console.log(`검색 API 응답 내용 (처음 500자):`, responseText)
//     // console.log(`검색 API 응답 내용 (처음 500자):`, responseText.substring(0, 500))

//     // 3. JSON 응답 파싱 - quality 점수 추출
//     try {
//       const jsonData = JSON.parse(responseText)
//       console.log('JSON 파싱 성공!')

//       // 검색 결과에서 quality 점수 추출: result.section[0].data.document[]
//       if (jsonData.result && jsonData.result.section && jsonData.result.section[0] && jsonData.result.section[0].data) {
//         const documents = jsonData.result.section[0].data.document || []
//         console.log(`검색 결과 ${documents.length}개 발견`)

//         for (const doc of documents) {
//           if (doc.common && doc.render) {
//             const { quality } = doc.common
//             const { url } = doc.render

//             // console.log(`검색 결과: "${title}", quality: ${quality}, gdid: ${gdid}`)
//             // console.log(`URL: ${url}`)

//             // URL에서 포스트 ID 추출하여 logNo와 매칭
//             const urlMatch = url.match(/\/(\d+)$/)
//             const postId = urlMatch ? urlMatch[1] : null

//             // logNo와 매칭 시도 (포스트 ID만으로)
//             if (postId === logNo) {
//               console.log(`매칭 성공! PostID: ${postId}, LogNo: ${logNo}, Quality: ${quality}`)

//               // quality 값(0~1)을 그대로 반환
//               return quality
//             }
//           }
//         }

//         console.log('검색 결과에서 해당 포스트를 찾지 못함')
//       } else {
//         console.log('검색 결과 구조가 예상과 다름')
//       }
//     } catch (jsonError) {
//       const errorMessage = jsonError instanceof Error ? jsonError.message : String(jsonError)
//       console.log('JSON 파싱 실패:', errorMessage)
//     }

//     return null
//   } catch (error) {
//     console.error('네이버 검색 API 호출 오류:', error)
//     return null
//   }
// }

// // 람다를 통한 포스트 상세 정보 조회
// async function fetchPostDetailsWithLambda(
//   blogId: string,
//   logNo: string,
// ): Promise<{
//   contentLength?: number
//   imageCount?: number
//   commentCount?: number
//   likeCount?: number
// } | null> {
//   try {
//     const response = await fetch(LAMBDA_FETCH_POST_DETAILS_URL!, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ blogId, logNo }),
//       signal: AbortSignal.timeout(30000), // 30초 타임아웃
//     })

//     // 응답 본문을 먼저 읽어서 에러 정보 확인
//     const responseText = await response.text()

//     if (!response.ok) {
//       console.error(`❌ Lambda 함수 호출 실패: ${response.status} ${response.statusText}`)
//       console.error(`응답 본문:`, responseText.substring(0, 500))

//       if (response.status === 502) {
//         console.warn('⚠️ Lambda 타임아웃 가능성 - Lambda 함수의 타임아웃 설정을 확인하세요 (최소 30초 권장)')
//       }

//       throw new Error(`Lambda 함수 호출 실패: ${response.status} ${response.statusText}`)
//     }

//     const result = JSON.parse(responseText)
//     const parsedResult = result.body ? (typeof result.body === 'string' ? JSON.parse(result.body) : result.body) : result

//     if (!parsedResult.success) {
//       throw new Error(parsedResult.error || 'Lambda 함수에서 오류 발생')
//     }

//     return parsedResult.data || null
//   } catch (error) {
//     console.error(`❌ Lambda 포스트 상세 정보 조회 실패:`, error)

//     if (error instanceof Error && error.name === 'AbortError') {
//       console.warn('⚠️ Lambda 호출 타임아웃 - Lambda 함수의 타임아웃 설정을 확인하세요')
//     }

//     return null
//   }
// }

// // 포스트 상세 정보 조회
// async function fetchPostDetails(
//   blogId: string,
//   logNo: string,
// ): Promise<{
//   contentLength?: number
//   imageCount?: number
//   commentCount?: number
//   likeCount?: number
// } | null> {
//   // Lambda 함수 URL이 설정되어 있으면 Lambda 사용
//   if (LAMBDA_FETCH_POST_DETAILS_URL) {
//     console.log('🔗 Lambda를 통한 포스트 상세 정보 조회')
//     return await fetchPostDetailsWithLambda(blogId, logNo)
//   }

//   try {
//     // PostView.naver URL로 직접 접근
//     const url = `https://blog.naver.com/PostView.naver?blogId=${blogId}&logNo=${logNo}`

//     const response = await fetch(url, {
//       headers: {
//         'User-Agent':
//           'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
//         Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
//         'Accept-Language': 'ko-KR,ko;q=0.9',
//       },
//     })

//     if (!response.ok) {
//       console.error('포스트 조회 실패:', response.status)
//       return null
//     }

//     const html = await response.text()

//     // 댓글/공감 추출
//     let commentCount = 0
//     let likeCount = 0

//     // 댓글수 추출 (여러 패턴 시도)
//     const commentPatterns = [
//       /댓글\s*(\d+)/i,
//       /댓글\s*<\/span>\s*<em[^>]*>(\d+)/i,
//       /<span[^>]*>댓글<\/span>[^>]*>(\d+)/i,
//       /_댓글_\s*_(\d+)_/i,
//       /id="[^"]*[Cc]omment[Cc]ount"[^>]*>(\d+)/i,
//       /class="[^"]*comment[^"]*"[^>]*>.*?(\d+)/i,
//     ]

//     for (const pattern of commentPatterns) {
//       const match = html.match(pattern)
//       if (match) {
//         commentCount = parseInt(match[1] || '0', 10)
//         break
//       }
//     }

//     // 공감수 추출 - API 사용
//     try {
//       const likeApiUrl = `https://apis.naver.com/blogserver/like/v1/search/contents?suppress_response_codes=true&pool=blogid&q=BLOG%5B${blogId}_${logNo}%5D&isDuplication=false&cssIds=MULTI_MOBILE%2CBLOG_MOBILE&displayId=BLOG`

//       const likeResponse = await safeFetch(likeApiUrl, {
//         headers: {
//           Accept: 'application/json',
//           'Accept-Language': 'ko-KR,ko;q=0.9',
//           Referer: `https://blog.naver.com/${blogId}`,
//         },
//       })

//       if (likeResponse.ok) {
//         const likeData = await likeResponse.json()

//         // reactions 배열에서 reactionType이 'like'인 항목 찾기
//         if (likeData.contents && likeData.contents.length > 0) {
//           const content = likeData.contents[0]
//           if (content.reactions && Array.isArray(content.reactions)) {
//             const likeReaction = content.reactions.find((r: any) => r.reactionType === 'like')
//             if (likeReaction && likeReaction.count !== undefined) {
//               likeCount = parseInt(likeReaction.count, 10)
//             }
//           }
//         }
//       }
//     } catch (error) {
//       // API 실패 시 HTML 파싱으로 폴백 (기존 로직)
//       const likePatterns = [
//         /공감\s*(\d+)/i,
//         /공감\s*<\/span>\s*<em[^>]*>(\d+)/i,
//         /<span[^>]*>공감<\/span>[^>]*>(\d+)/i,
//         /sympathy[^>]*>.*?(\d+)/i,
//         /likeit[^>]*>.*?(\d+)/i,
//         /<em[^>]*class="[^"]*cnt[^"]*"[^>]*>(\d+)/i,
//       ]

//       for (const pattern of likePatterns) {
//         const match = html.match(pattern)
//         if (match) {
//           likeCount = parseInt(match[1] || '0', 10)
//           break
//         }
//       }
//     }

//     // 이미지수 추출 (본문 내 img 태그)
//     const imageMatches = html.match(/<img[^>]+>/g) || []

//     // 본문 영역 추출 (개선된 방식: se-main-container만 정확하게)
//     let imageCount = 0
//     let contentLength = 0
//     let mainContent = ''

//     // se-main-container 영역만 정확하게 추출
//     const mainContainerStartIdx = html.indexOf('class="se-main-container"')

//     if (mainContainerStartIdx > 0) {
//       // se-main-container의 시작 <div> 찾기
//       const divStartIdx = html.lastIndexOf('<div', mainContainerStartIdx)

//       // se-main-container의 끝 </div> 찾기 (중첩 div 고려)
//       let depth = 0
//       let contentEndIdx = divStartIdx
//       let inContainer = false

//       for (let i = divStartIdx; i < html.length; i++) {
//         if (html.substring(i, i + 4) === '<div') {
//           depth++
//           inContainer = true
//         } else if (html.substring(i, i + 6) === '</div>') {
//           depth--
//           if (depth === 0 && inContainer) {
//             contentEndIdx = i + 6
//             break
//           }
//         }
//       }

//       mainContent = html.substring(divStartIdx, contentEndIdx)

//       // 이미지 개수 (스티커 제외, 실제 컨텐츠 이미지만)
//       const allImages: string[] = mainContent.match(/<img[^>]+>/g) || []
//       const contentImages = allImages.filter(
//         (img: string) => !img.includes('se-sticker-image') && !img.includes('icon') && !img.includes('emoji'),
//       )
//       imageCount = contentImages.length

//       // HTML 태그 제거하여 글자수 계산
//       const textContent = mainContent
//         .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
//         .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
//         .replace(/<[^>]+>/g, '')
//         .replace(/&nbsp;/g, ' ')
//         .replace(/&[a-z]+;/g, '')
//         .replace(/\s+/g, ' ')
//         .trim()
//       contentLength = textContent.length
//     } else {
//       // fallback: 전체 이미지 개수 사용
//       imageCount = imageMatches.length
//     }

//     return {
//       contentLength,
//       imageCount,
//       commentCount,
//       likeCount,
//     }
//   } catch (error) {
//     console.error('포스트 상세 조회 오류:', error)
//     return null
//   }
// }

// // 람다를 통한 인기 게시글 조회
// async function fetchPopularPostsWithLambda(
//   blogId: string,
// ): Promise<Array<{ title: string; logNo: string; views?: number }> | null> {
//   try {
//     const response = await fetch(LAMBDA_FETCH_POPULAR_POSTS_URL!, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ blogId }),
//       signal: AbortSignal.timeout(30000), // 30초 타임아웃
//     })

//     // 응답 본문을 먼저 읽어서 에러 정보 확인
//     const responseText = await response.text()

//     if (!response.ok) {
//       console.error(`❌ Lambda 함수 호출 실패: ${response.status} ${response.statusText}`)
//       console.error(`응답 본문:`, responseText.substring(0, 500))

//       if (response.status === 502) {
//         console.warn('⚠️ Lambda 타임아웃 가능성 - Lambda 함수의 타임아웃 설정을 확인하세요 (최소 30초 권장)')
//       }

//       throw new Error(`Lambda 함수 호출 실패: ${response.status} ${response.statusText}`)
//     }

//     const result = JSON.parse(responseText)
//     const parsedResult = result.body ? (typeof result.body === 'string' ? JSON.parse(result.body) : result.body) : result

//     if (!parsedResult.success) {
//       throw new Error(parsedResult.error || 'Lambda 함수에서 오류 발생')
//     }

//     return parsedResult.data || null
//   } catch (error) {
//     console.error(`❌ Lambda 인기 게시글 조회 실패:`, error)

//     if (error instanceof Error && error.name === 'AbortError') {
//       console.warn('⚠️ Lambda 호출 타임아웃 - Lambda 함수의 타임아웃 설정을 확인하세요')
//     }

//     return null
//   }
// }

// // 인기 게시글 조회
// async function fetchPopularPosts(
//   blogId: string,
// ): Promise<Array<{ title: string; logNo: string; views?: number }> | null> {
//   // Lambda 함수 URL이 설정되어 있으면 Lambda 사용
//   if (LAMBDA_FETCH_POPULAR_POSTS_URL) {
//     console.log('🔗 Lambda를 통한 인기 게시글 조회')
//     return await fetchPopularPostsWithLambda(blogId)
//   }

//   try {
//     const url = `https://m.blog.naver.com/api/blogs/${blogId}/popular-post-list`

//     // 네이버 인증 쿠키 (환경변수로 관리 권장)
//     // const naverCookie =
//     //   process.env.NAVER_COOKIE ||
//     //   'NNB=WBLEXGLOU3NGQ; NAC=2ssbBww0JLN1; NID_AUT=d2w6Zy30sR0X7kyE/+pwZtp2nG6cPe3burGrD7SNiAO1AsETMaR3zggbRwkH0u1X; ASID=798e994800000199fdd1a25400000024; stat_yn=1; NACT=1'

//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         Accept: 'application/json, text/plain, */*',
//         'Accept-Encoding': 'gzip, deflate, br, zstd',
//         'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
//         'Cache-Control': 'no-cache',
//         // Cookie: naverCookie,
//         Pragma: 'no-cache',
//         Priority: 'u=1, i',
//         Referer: `https://m.blog.naver.com/${blogId}?tab=1`,
//         'Sec-Ch-Ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
//         'Sec-Ch-Ua-Mobile': '?0',
//         'Sec-Ch-Ua-Platform': '"Windows"',
//         'Sec-Fetch-Dest': 'empty',
//         'Sec-Fetch-Mode': 'cors',
//         'Sec-Fetch-Site': 'same-origin',
//         'User-Agent':
//           'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
//       },
//     })

//     if (!response.ok) {
//       console.error('인기 게시글 조회 실패:', response.status, response.statusText)
//       return null
//     }

//     const data = await response.json()
//     // console.log('인기 게시글 조회 결과:', data)

//     // 응답 데이터 파싱
//     if (data.isSuccess && data.result && Array.isArray(data.result.popularPostList)) {
//       // console.log('인기 게시글 파싱:', data.result.popularPostList)
//       return data.result.popularPostList.map((item: any) => ({
//         title: item.titleWithInspectMessage || item.title || '',
//         logNo: item.logNo || '',
//         views: item.readCnt || item.readCount || 0,
//       }))
//     }

//     // console.warn('인기 게시글 데이터 구조가 예상과 다름:', data)
//     return null
//   } catch (error) {
//     console.error('인기 게시글 조회 오류:', error)
//     return null
//   }
// }

// // quality 값을 SCORE_THRESHOLDS 기준으로 points로 변환
// function getPointsFromQuality(quality: number): number {
//   // 특정 값들에 대한 처리 (부동소수점 비교를 위해 소수점 3자리까지 반올림하여 비교)
//   const roundedQuality = Math.round(quality * 1000) / 1000

//   const nb블2Threshold = NB_SCORE_THRESHOLDS['nb블2']
//   if (nb블2Threshold && roundedQuality === nb블2Threshold.exactScore) {
//     return nb블2Threshold.points // nb블2
//   }

//   const nb블1Threshold = NB_SCORE_THRESHOLDS['nb블1']
//   if (nb블1Threshold && roundedQuality === nb블1Threshold.exactScore) {
//     return nb블1Threshold.points // nb블1
//   }

//   // 일반적인 구간별 점수 계산
//   for (const threshold of SCORE_THRESHOLDS) {
//     if (quality >= threshold.minScore) {
//       return threshold.points
//     }
//   }
//   return 1 // 저품질
// }

// // 평균 점수를 기준으로 최종 등급 결정
// function calculateFinalGrade(averageScore: number): IndexGrade {
//   // 부동소수점 비교를 위해 반올림
//   const roundedScore = Math.round(averageScore * 10) / 10

//   // nb블은 정확히 해당 점수일 때만 적용 (모든 게시글이 같은 nb블 quality일 때)
//   if (roundedScore === (INDEX_GRADE_TO_SCORE['nb블2'] as number)) return 'nb블2' as IndexGrade // 8.666점 정확히
//   if (roundedScore === (INDEX_GRADE_TO_SCORE['nb블1'] as number)) return 'nb블1' as IndexGrade // 8.333점 정확히

//   // 일반 구간 기준
//   if (averageScore >= (INDEX_GRADE_TO_SCORE['최적3'] as number) - 0.5) return '최적3' as IndexGrade // 11점
//   if (averageScore >= (INDEX_GRADE_TO_SCORE['최적2'] as number) - 0.5) return '최적2' as IndexGrade // 10점
//   if (averageScore >= (INDEX_GRADE_TO_SCORE['최적1'] as number) - 0.5) return '최적1' as IndexGrade // 9점
//   if (averageScore >= (INDEX_GRADE_TO_SCORE['준최7'] as number) - 0.5) return '준최7' as IndexGrade // 8점
//   if (averageScore >= (INDEX_GRADE_TO_SCORE['준최6'] as number) - 0.5) return '준최6' as IndexGrade // 7점
//   if (averageScore >= (INDEX_GRADE_TO_SCORE['준최5'] as number) - 0.5) return '준최5' as IndexGrade // 6점
//   if (averageScore >= (INDEX_GRADE_TO_SCORE['준최4'] as number) - 0.5) return '준최4' as IndexGrade // 5점
//   if (averageScore >= (INDEX_GRADE_TO_SCORE['준최3'] as number) - 0.5) return '준최3' as IndexGrade // 4점
//   if (averageScore >= (INDEX_GRADE_TO_SCORE['준최2'] as number) - 0.5) return '준최2' as IndexGrade // 3점
//   if (averageScore >= (INDEX_GRADE_TO_SCORE['준최1'] as number) - 0.5) return '준최1' as IndexGrade // 2점
//   return '저품질' // 1점
// }

// // 플레이스 검색 지수 측정 함수 (향후 구현)
// export async function measurePlaceSearchIndex(_keyword: string): Promise<BlogIndexMeasurementResponse> {
//   try {
//     // TODO: 플레이스 검색 지수 구현
//     // 1. 네이버 통합검색 페이지 접속: https://search.naver.com/search.naver
//     // 2. JavaScript 변수에서 데이터 추출: naver.search.ext.nmb.salt.query
//     // 3. nlu_query 필드에서 플레이스 검색 지수 데이터 파싱

//     return {
//       success: false,
//       error: '플레이스 검색 지수는 아직 구현되지 않았습니다.',
//     }
//   } catch (error) {
//     console.error('플레이스 검색 지수 측정 오류:', error)
//     return {
//       success: false,
//       error: '플레이스 검색 지수 측정 중 오류가 발생했습니다.',
//     }
//   }
// }

// // DB에 블로그 데이터 저장
// async function saveBlogData(
//   blogId: string,
//   blogInfo: BlogInfo,
//   quality: number,
//   score: number,
//   grade: string,
//   scoreDetails: Array<{
//     title: string
//     logNo: string
//     quality: number | null
//     points: number
//     publishDate?: string
//     contentLength?: number
//     imageCount?: number
//     commentCount?: number
//     likeCount?: number
//   }>,
//   popularPosts: Array<{ title: string; logNo: string; views?: number }>,
// ): Promise<void> {
//   try {
//     const today = new Date()
//     const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

//     // 1. 랭킹 계산 (quality 기준으로 실시간 계산)
//     // count로 더 높은 quality를 가진 블로그 개수 조회 (인덱스 활용, 성능 최적화)
//     // quality는 Float이고 기본값이 0이므로, gt 조건만으로도 null이 자동 제외됨
//     const higherQualityCount = await prisma.blog.count({
//       where: {
//         quality: {
//           gt: quality,
//         },
//       },
//     })

//     const rank = higherQualityCount + 1

//     // 2. Blog 테이블에 최신 정보 저장/업데이트 (rank 포함)
//     await prisma.blog.upsert({
//       where: { blogId },
//       create: {
//         blogId,
//         blogName: blogInfo.blogName || '',
//         displayNickName: blogInfo.displayNickName || '',
//         blogUrl: blogInfo.blogUrl || '',
//         blogDirectory: blogInfo.blogDirectory || '',
//         profileImage: blogInfo.profileImage || '',
//         blogCreatedDate: blogInfo.createdDate || '',
//         totalPosts: blogInfo.totalPosts || 0,
//         subscriberCount: blogInfo.subscriberCount || 0,
//         totalVisitorCount: blogInfo.totalVisitorCount || 0,
//         dayVisitors: blogInfo.dayVisitors || 0,
//         grade,
//         quality,
//         score,
//         rank,
//         lastUpdated: today,
//       },
//       update: {
//         blogName: blogInfo.blogName || '',
//         displayNickName: blogInfo.displayNickName || '',
//         blogUrl: blogInfo.blogUrl || '',
//         blogDirectory: blogInfo.blogDirectory || '',
//         profileImage: blogInfo.profileImage || '',
//         blogCreatedDate: blogInfo.createdDate || '',
//         totalPosts: blogInfo.totalPosts || 0,
//         subscriberCount: blogInfo.subscriberCount || 0,
//         totalVisitorCount: blogInfo.totalVisitorCount || 0,
//         dayVisitors: blogInfo.dayVisitors || 0,
//         grade,
//         quality,
//         score,
//         rank,
//         lastUpdated: today,
//       },
//     })

//     // 3. BlogHistory에 오늘 날짜로 기록 추가 (히스토리 추적용)
//     await prisma.blogHistory.upsert({
//       where: {
//         dateKey_blogId: {
//           dateKey,
//           blogId,
//         },
//       },
//       create: {
//         dateKey,
//         blogId,
//         blogName: blogInfo.blogName || '',
//         grade,
//         quality,
//         score,
//         rank,
//         totalPosts: blogInfo.totalPosts || 0,
//         subscriberCount: blogInfo.subscriberCount || 0,
//         totalVisitorCount: blogInfo.totalVisitorCount || 0,
//         dayVisitors: blogInfo.dayVisitors || 0,
//         scoreDetails: scoreDetails as any, // JSON 저장
//         popularPosts: popularPosts as any, // JSON 저장
//       },
//       update: {
//         blogName: blogInfo.blogName || '',
//         grade,
//         quality,
//         score,
//         rank,
//         totalPosts: blogInfo.totalPosts || 0,
//         subscriberCount: blogInfo.subscriberCount || 0,
//         totalVisitorCount: blogInfo.totalVisitorCount || 0,
//         dayVisitors: blogInfo.dayVisitors || 0,
//         scoreDetails: scoreDetails as any, // JSON 저장
//         popularPosts: popularPosts as any, // JSON 저장
//       },
//     })

//     console.log(`✅ 블로그 데이터 저장 완료: ${blogId} (랭킹: ${rank}위)`)
//   } catch (error) {
//     console.error('블로그 데이터 저장 오류:', error)
//     // 에러가 발생해도 측정 결과는 반환하도록 throw하지 않음
//   }
// }

// // 오늘 일자 블로그 데이터 조회 (캐시)
// async function getBlogDataToday(blogId: string): Promise<BlogIndexMeasurementResponse | null> {
//   try {
//     const today = new Date()
//     const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

//     // 1. BlogHistory에서 오늘 일자 데이터 조회
//     const historyData = await prisma.blogHistory.findUnique({
//       where: {
//         dateKey_blogId: {
//           dateKey,
//           blogId,
//         },
//       },
//       select: {
//         grade: true,
//         quality: true,
//         score: true,
//         rank: true,
//         totalPosts: true,
//         subscriberCount: true,
//         totalVisitorCount: true,
//         dayVisitors: true,
//         scoreDetails: true,
//         popularPosts: true,
//       },
//     })

//     if (!historyData) {
//       return null
//     }

//     // 2. Blog 테이블에서 최신 정보 조회
//     const blogData = await prisma.blog.findUnique({
//       where: { blogId },
//     })

//     if (!blogData) {
//       return null
//     }

//     // 3. BlogIndexMeasurementResponse 형태로 반환
//     return {
//       success: true,
//       data: {
//         blogInfo: {
//           blogId,
//           blogName: blogData.blogName || '',
//           blogUrl: blogData.blogUrl || '',
//           displayNickName: blogData.displayNickName || '',
//           createdDate: blogData.blogCreatedDate || '',
//           dayVisitors: blogData.dayVisitors,
//           subscriberCount: blogData.subscriberCount,
//           totalVisitorCount: blogData.totalVisitorCount,
//           totalPosts: blogData.totalPosts,
//           blogDirectory: blogData.blogDirectory || '',
//           profileImage: blogData.profileImage || '',
//           lastUpdated: blogData.lastUpdated.toISOString(),
//         },
//         blogIndex: {
//           topicIndex: historyData.grade as any,
//           overallIndex: historyData.grade as any,
//           maxIndex: historyData.grade as any,
//           blogTopic: '일반',
//         },
//         optimizationMetrics: {
//           score: historyData.score,
//           grade: historyData.grade as any,
//           totalSum: historyData.score * 10,
//           selectedPostsCount: 10,
//           scoreDetails: (historyData.scoreDetails as any) || [], // DB에서 조회한 상세 정보
//         },
//         popularPosts: (historyData.popularPosts as any) || [], // DB에서 조회한 인기글 정보
//       },
//     }
//   } catch (error) {
//     console.error('오늘 일자 블로그 데이터 조회 오류:', error)
//     return null
//   }
// }

// // 블로그 히스토리 조회 (지수 히스토리 + 랭킹 히스토리)
// export async function getBlogHistory(blogId: string) {
//   try {
//     const history = await prisma.blogHistory.findMany({
//       where: { blogId },
//       orderBy: { dateKey: 'asc' },
//       select: {
//         dateKey: true,
//         grade: true,
//         quality: true,
//         score: true,
//         rank: true,
//       },
//     })

//     return {
//       success: true,
//       data: history,
//     }
//   } catch (error) {
//     console.error('블로그 히스토리 조회 오류:', error)
//     return {
//       success: false,
//       error: '블로그 히스토리 조회 중 오류가 발생했습니다.',
//     }
//   }
// }

