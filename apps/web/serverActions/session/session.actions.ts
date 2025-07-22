// "use server";

// import { auth } from "@/auth";
// import { prisma } from "@repo/database";
// import { headers } from "next/headers";

// /**
//  * 클라이언트의 실제 IP 주소를 추출합니다.
//  */
// async function getClientIP(): Promise<string> {
//   const headersList = await headers();

//   // 프록시 환경에서 실제 클라이언트 IP를 찾기 위한 헤더들 (우선순위 순)
//   const ipHeaders = [
//     "cf-connecting-ip", // Cloudflare
//     "x-real-ip", // Nginx
//     "x-forwarded-for", // 일반적인 프록시
//     "x-client-ip", // Apache
//     "true-client-ip", // Akamai
//     "x-cluster-client-ip" // 클러스터 환경
//   ];

//   // 각 헤더를 순서대로 확인
//   for (const header of ipHeaders) {
//     const value = headersList.get(header);
//     if (value) {
//       // x-forwarded-for는 여러 IP가 콤마로 구분될 수 있음 (첫 번째가 실제 클라이언트)
//       const ip = value.split(",")[0]?.trim();
//       if (ip && isValidIP(ip)) {
//         return ip;
//       }
//     }
//   }

//   // 기본 fallback
//   const forwardedFor = headersList.get("x-forwarded-for");
//   const fallbackIP = forwardedFor?.split(",")[0]?.trim() || "127.0.0.1";
//   return fallbackIP;
// }

// /**
//  * 유효한 IP 주소인지 확인합니다.
//  */
// function isValidIP(ip: string): boolean {
//   // IPv4 패턴
//   const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;

//   if (ipv4Pattern.test(ip)) {
//     // IPv4의 각 옥텟이 0-255 범위인지 확인
//     const octets = ip.split(".");
//     return octets.every((octet) => {
//       const num = parseInt(octet, 10);
//       return num >= 0 && num <= 255;
//     });
//   }

//   return false; // 간단히 IPv4만 체크
// }

// /**
//  * User Agent 정보를 추출합니다.
//  */
// async function getUserAgent(): Promise<string> {
//   const headersList = await headers();
//   return headersList.get("user-agent") || "Unknown";
// }

// /**
//  * 사용자 세션을 업데이트하거나 생성합니다.
//  * 다른 IP에서 접속이 감지되면 기존 세션을 확인합니다.
//  */
// export async function updateUserSession(): Promise<{
//   success: boolean;
//   shouldLogout?: boolean;
//   message?: string;
// }> {
//   try {
//     const session = await auth();
//     if (!session?.user?.id) {
//       return { success: false, message: "인증되지 않은 사용자입니다." };
//     }

//     const userId = BigInt(session.user.id);
//     const currentIP = await getClientIP();
//     const currentUserAgent = await getUserAgent();

//     // 기존 세션 확인
//     const existingSession = await prisma.userSession.findUnique({
//       where: { userId }
//     });

//     const now = new Date();
//     const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);

//     if (existingSession) {
//       // 30초 이내에 다른 IP에서 접속했는지 확인
//       if (
//         existingSession.updatedAt > thirtySecondsAgo &&
//         existingSession.ipAddress !== currentIP
//       ) {
//         // 다른 IP에서 최근에 접속함 - 로그아웃 필요
//         return {
//           success: false,
//           shouldLogout: true,
//           message:
//             "다른 기기에서 접속이 감지되었습니다. 보안을 위해 로그아웃됩니다."
//         };
//       }

//       // 세션 업데이트
//       await prisma.userSession.update({
//         where: { userId },
//         data: {
//           ipAddress: currentIP,
//           userAgent: currentUserAgent,
//           updatedAt: now
//         }
//       });
//     } else {
//       // 새 세션 생성
//       await prisma.userSession.create({
//         data: {
//           userId,
//           ipAddress: currentIP,
//           userAgent: currentUserAgent
//         }
//       });
//     }

//     return { success: true };
//   } catch (error) {
//     console.error("세션 업데이트 오류:", error);
//     return { success: false, message: "세션 업데이트 중 오류가 발생했습니다." };
//   }
// }

// /**
//  * 사용자 세션을 삭제합니다. (로그아웃 시 호출)
//  */
// export async function clearUserSession(): Promise<{
//   success: boolean;
//   message?: string;
// }> {
//   try {
//     const session = await auth();
//     if (!session?.user?.id) {
//       return { success: true }; // 이미 로그아웃된 상태
//     }

//     const userId = BigInt(session.user.id);

//     await prisma.userSession.deleteMany({
//       where: { userId }
//     });

//     return { success: true };
//   } catch (error) {
//     console.error("세션 삭제 오류:", error);
//     return { success: false, message: "세션 삭제 중 오류가 발생했습니다." };
//   }
// }
