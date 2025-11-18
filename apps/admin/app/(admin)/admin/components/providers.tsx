"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SidebarProvider } from "@repo/ui/components/sidebar";
import { AppSidebar } from "./sppSidebar";
import { adminMenus } from "@/shared/consts/menus";
// betterAuth는 SessionProvider가 필요 없음
// import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { PATH } from "@/shared/consts/path";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 로그인 페이지와 어드민 생성 페이지에서는 사이드바를 표시하지 않음
  const isLoginPage = pathname === PATH.AUTH_LOGIN;
  const isCreateAdminPage = pathname === "/admin/create-admin";
  const showSidebar = !isLoginPage && !isCreateAdminPage;

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {showSidebar ? (
          <SidebarProvider>
            <AppSidebar items={adminMenus} />
            <div className="w-full">{children}</div>
          </SidebarProvider>
        ) : (
          // 로그인 페이지 등에서는 사이드바 없이 콘텐츠만 표시
          <div className="w-full">{children}</div>
        )}
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
