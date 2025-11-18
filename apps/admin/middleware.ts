import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/lib/auth";
import { PATH } from "./shared/consts/path";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const { pathname } = request.nextUrl;

  // 관리자 페이지 보호
  if (pathname.startsWith(PATH.ADMIN_ROOT)) {
    // 로그인 페이지는 예외
    if (pathname === PATH.AUTH_LOGIN) {
      // 이미 로그인된 관리자는 대시보드로 리다이렉트 (더 엄격한 체크)
      const user = session?.user;
      if (user && (user as any).role === "ADMIN" && user.id) {
        console.log("🔄 Already logged in admin redirected from login page");
        const redirectUrl = new URL(PATH.ADMIN_ROOT, request.url);
        const response = NextResponse.redirect(redirectUrl);

        // 캐시 방지 헤더 추가
        response.headers.set(
          "Cache-Control",
          "no-cache, no-store, max-age=0, must-revalidate"
        );
        return response;
      }
      return NextResponse.next();
    }

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

    // 권한 없는 사용자 → 메인 페이지로
    const user = session.user as any;
    if (user.role !== "ADMIN") {
      console.log("🚫 Non-admin user redirected to home");
      return NextResponse.redirect(new URL("/", request.url));
    }

    // 정상적인 관리자 접근
    console.log("✅ Admin access granted:", pathname);
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
    "/admin/:path*",
    "/api/admin/:path*",
    // 결제 페이지도 인증 필요
    "/payment/:path*",
  ],
  runtime: "nodejs", // Prisma 사용을 위해 Node.js runtime 명시
};
