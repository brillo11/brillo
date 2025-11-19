"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StudentHeader } from "@/app/(student)/student/components/student-header";
const queryClient = new QueryClient();

export function StudentProviders({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <StudentHeader />
        <main className="flex-1">{children}</main>
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
