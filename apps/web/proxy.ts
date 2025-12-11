import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/lib/auth";
import { PATH } from "./shared/consts/path";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const { pathname } = request.nextUrl;

    const publicPaths = [
    "/",
    "/api/auth",
    "/favicon.ico",
  ];

  console.log({ session });

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
    "/",
    "/auth/:path*",
    "/admin/:path*",
  ],
  // runtime: "nodejs", // If supported by custom server?
};
