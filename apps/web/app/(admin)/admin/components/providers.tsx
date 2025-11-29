"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SidebarProvider } from "@repo/ui/components/sidebar";
import { AppSidebar } from "./sppSidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserHeader } from "@/shared/components/header/user-header";
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <AppSidebar />
          <div className="flex flex-col w-full min-h-screen">
            <UserHeader />
            <div className="flex-1">{children}</div>
          </div>
        </SidebarProvider>
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
