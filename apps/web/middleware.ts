import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // 관리자 페이지 보호
  if (pathname.startsWith("/admin")) {
    // 로그인 페이지는 예외
    if (pathname === "/admin/login") {
      // 이미 로그인된 관리자는 대시보드로 리다이렉트
      if (session?.user?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // 미인증 사용자 → 로그인 페이지로
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // 권한 없는 사용자 → 메인 페이지로
    if (session.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // API 라우트 보호
  if (pathname.startsWith("/api/admin")) {
    if (!session || session.user?.role !== "ADMIN") {
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
};
