// 'use server'

// import { prisma } from '@repo/sellogic-database'
// import { getCurrentUser } from '@/shared/lib/auth-guards'

// export interface BlogIndexHistoryItem {
//   id: string
//   createdAt: Date
//   blogId: string
//   displayNickName: string | null
//   profileImage: string | null
// }

// export interface BlogIndexHistoryResult {
//   status: 'success' | 'error'
//   result?: BlogIndexHistoryItem[]
//   error?: string
// }

// // 사용자의 블로그 지수 조회 히스토리 가져오기
// export async function getUserBlogIndexHistory(): Promise<BlogIndexHistoryResult> {
//   try {
//     const user = await getCurrentUser()
//     if (!user) {
//       return {
//         status: 'error',
//         error: '인증이 필요합니다.',
//       }
//     }

//     const histories = await prisma.userBlogIndexHistory.findMany({
//       where: {
//         userId: user.id,
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//       take: 20, // 최대 20개까지
//     })

//     const result: BlogIndexHistoryItem[] = histories.map(h => ({
//       id: h.id.toString(),
//       createdAt: h.createdAt,
//       blogId: h.blogId,
//       displayNickName: h.displayNickName,
//       profileImage: h.profileImage,
//     }))

//     return {
//       status: 'success',
//       result,
//     }
//   } catch (error) {
//     console.error('블로그 히스토리 조회 오류:', error)
//     return {
//       status: 'error',
//       error: '블로그 히스토리를 불러오는데 실패했습니다.',
//     }
//   }
// }

// // 블로그 지수 조회 히스토리 삭제
// export async function deleteBlogIndexHistory(historyId: string): Promise<{ success: boolean; error?: string }> {
//   try {
//     const user = await getCurrentUser()
//     if (!user) {
//       return {
//         success: false,
//         error: '인증이 필요합니다.',
//       }
//     }

//     // 본인의 히스토리인지 확인
//     const history = await prisma.userBlogIndexHistory.findFirst({
//       where: {
//         id: BigInt(historyId),
//         userId: user.id,
//       },
//     })

//     if (!history) {
//       return {
//         success: false,
//         error: '히스토리를 찾을 수 없습니다.',
//       }
//     }

//     await prisma.userBlogIndexHistory.delete({
//       where: {
//         id: BigInt(historyId),
//       },
//     })

//     return {
//       success: true,
//     }
//   } catch (error) {
//     console.error('블로그 히스토리 삭제 오류:', error)
//     return {
//       success: false,
//       error: '히스토리 삭제에 실패했습니다.',
//     }
//   }
// }

// // 블로그 지수 조회 히스토리 추가
// export async function addBlogIndexHistory(data: {
//   blogId: string
//   displayNickName?: string
//   profileImage?: string
// }): Promise<{ success: boolean; error?: string }> {
//   try {
//     const user = await getCurrentUser()
//     if (!user) {
//       // 로그인하지 않은 경우 히스토리를 저장하지 않음 (에러는 아님)
//       return {
//         success: true,
//       }
//     }

//     // 중복 체크: 같은 blogId가 이미 존재하는지 확인 (시간 제한 없음)
//     const existingHistory = await prisma.userBlogIndexHistory.findFirst({
//       where: {
//         userId: user.id,
//         blogId: data.blogId,
//       },
//     })

//     if (existingHistory) {
//       // 이미 검색한 이력이 있는 경우, 날짜만 수정하여 최신으로 갱신
//       await prisma.userBlogIndexHistory.update({
//         where: {
//           id: existingHistory.id,
//         },
//         data: {
//           displayNickName: data.displayNickName,
//           profileImage: data.profileImage,
//           createdAt: new Date(), // 시간 갱신 (최신 순서로 노출)
//         },
//       })
//     } else {
//       // 새로 추가
//       await prisma.userBlogIndexHistory.create({
//         data: {
//           userId: user.id,
//           blogId: data.blogId,
//           displayNickName: data.displayNickName || null,
//           profileImage: data.profileImage || null,
//         },
//       })
//     }

//     return {
//       success: true,
//     }
//   } catch (error) {
//     console.error('블로그 히스토리 추가 오류:', error)
//     return {
//       success: false,
//       error: '히스토리 추가에 실패했습니다.',
//     }
//   }
// }
