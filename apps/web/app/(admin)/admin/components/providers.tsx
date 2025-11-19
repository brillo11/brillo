"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SidebarProvider } from "@repo/ui/components/sidebar";
import { AppSidebar } from "./sppSidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
          <div className="w-full">{children}</div>
        </SidebarProvider>
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
