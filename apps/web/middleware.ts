import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const { pathname } = request.nextUrl;

  // 공개 경로 (로그인 불필요)
  const publicPaths = [
    "/auth/login",
    "/auth/signup",
    "/api/auth",
    "/favicon.ico",
  ];

  // 공개 경로는 통과
  if (
    publicPaths.some((path) => pathname === path || pathname.startsWith(path))
  ) {
    // 로그인 페이지에서 이미 로그인된 사용자는 홈으로 리다이렉트
    if (pathname === "/auth/login" && session?.user) {
      console.log("🔄 Already logged in user redirected from login page");
      const redirectUrl = new URL("/", request.url);
      const response = NextResponse.redirect(redirectUrl);
      response.headers.set(
        "Cache-Control",
        "no-cache, no-store, max-age=0, must-revalidate"
      );
      return response;
    }
    return NextResponse.next();
  }

  // 관리자 페이지 보호
  if (pathname.startsWith("/admin")) {
    // 미인증 사용자 → 로그인 페이지로
    if (!session || !session.user) {
      console.log("🚫 Unauthenticated user redirected to login");
      const loginUrl = new URL("/auth/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.headers.set(
        "Cache-Control",
        "no-cache, no-store, max-age=0, must-revalidate"
      );
      return response;
    }

    // 권한 없는 사용자 → 메인 페이지로
    const user = session.user as any;
    if (user.role !== "ADMIN") {
      console.log("🚫 Non-admin user redirected to home");
      return NextResponse.redirect(new URL("/", request.url));
    }

    // 정상적인 관리자 접근
    console.log("✅ Admin access granted:", pathname);
  }

  // 일반 사용자 페이지 보호 (로그인 필요)
  // 홈 페이지(/)는 제외하고 나머지 페이지는 로그인 필요
  if (
    pathname !== "/" &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api")
  ) {
    if (!session || !session.user) {
      console.log("🚫 Unauthenticated user redirected to login:", pathname);
      const loginUrl = new URL("/auth/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.headers.set(
        "Cache-Control",
        "no-cache, no-store, max-age=0, must-revalidate"
      );
      return response;
    }
    console.log("✅ Authenticated user access granted:", pathname);
  }

  // API 라우트 보호
  if (pathname.startsWith("/api/admin")) {
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user as any;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)", // 모든 경로 (정적 파일 제외)
  ],
  runtime: "nodejs", // Prisma 사용을 위해 Node.js runtime 명시
};
