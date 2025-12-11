import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/lib/auth";
import { PATH } from "./shared/consts/path";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const { pathname } = request.nextUrl;

  console.log({ session });

  // 공개 경로 (로그인 불필요)
  const publicPaths = [
    // PATH.AUTH_LOGIN,
    // PATH.AUTH_SIGNUP,
    "/",
    "/api/auth",
    "/favicon.ico",
  ];

  // 공개 경로는 통과
  if (
    publicPaths.some((path) => pathname === path || pathname.startsWith(path))
  ) {
    // 로그인 페이지에서 이미 로그인된 사용자는 관리자 대시보드로 리다이렉트
    if (pathname === PATH.AUTH_LOGIN && session?.user) {
      console.log("🔄 Already logged in user redirected from login page");
      const redirectUrl = new URL(PATH.ADMIN_ROOT, request.url);
      const response = NextResponse.redirect(redirectUrl);
      response.headers.set(
        "Cache-Control",
        "no-cache, no-store, max-age=0, must-revalidate"
      );
      return response;
    }
    return NextResponse.next();
  }

  // 디버깅: /admin 접근 시 세션 로그
  // if (pathname.startsWith(PATH.ADMIN_ROOT)) {
  //   console.log("🔍 Middleware - /admin 접근:", {
  //     pathname,
  //     hasSession: !!session,
  //     hasUser: !!session?.user,
  //     userRole: (session?.user as any)?.role,
  //     userId: (session?.user as any)?.id,
  //   });
  // }

  // 홈 페이지(/) 보호 - 로그인 필요
  // if (pathname === "/") {
  //   if (!session || !session.user) {
  //     console.log("🚫 Unauthenticated user redirected to login from home");
  //     const loginUrl = new URL(PATH.AUTH_LOGIN, request.url);
  //     const response = NextResponse.redirect(loginUrl);
  //     response.headers.set(
  //       "Cache-Control",
  //       "no-cache, no-store, max-age=0, must-revalidate"
  //     );
  //     return response;
  //   }
  //   // 로그인된 사용자는 그대로 통과 (또는 관리자 대시보드로 리다이렉트 가능)
  //   return NextResponse.next();
  // }

  // 관리자 페이지 보호 - 로그인만 확인 (role 검증 제거)
  if (pathname.startsWith(PATH.ADMIN_ROOT)) {
    // 미인증 사용자 → 로그인 페이지로
    if (!session || !session.user) {
      console.log("🚫 Unauthenticated user redirected to login");
      const loginUrl = new URL(PATH.AUTH_LOGIN, request.url);
      const response = NextResponse.redirect(loginUrl);
      response.headers.set(
        "Cache-Control",
        "no-cache, no-store, max-age=0, must-revalidate"
      );
      return response;
    }

    // 로그인된 사용자는 모두 통과
    console.log("✅ Admin access granted:", pathname);
  }

  // API 라우트 보호 - 로그인만 확인 (role 검증 제거)
  if (pathname.startsWith("/api/admin")) {
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // 🔹 ONBOARDING CHECK
  if (session?.user && !pathname.startsWith("/api/auth")) {
    const status = (session.user as any).status;

    // 1. UNKNOWN -> Onboarding
    if (status === "UNKNOWN" && !pathname.startsWith("/auth/onboarding")) {
       console.log("⚠️ Unknown user redirect to onboarding");
       return NextResponse.redirect(new URL("/auth/onboarding", request.url));
    }

    // 2. PENDING -> Pending Page
    if (status === "PENDING" && !pathname.startsWith("/auth/pending")) {
       console.log("⚠️ Pending user redirect to pending page");
       return NextResponse.redirect(new URL("/auth/pending", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/", // Root path check
    "/admin/:path*",
    "/api/admin/:path*",
    "/auth/:path*", 
    "/payment/:path*",
  ],
  runtime: "nodejs", 
};
