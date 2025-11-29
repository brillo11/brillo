"use client";

import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { ChartBar, Home } from "lucide-react";

export default function DashboardHeader() {
  return (
    <div className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <ChartBar className="h-6 w-6 text-[#3B82F6]" />
              LearnFlow 관리자 대시보드
            </h1>
            <p className="text-gray-600">
              페이지 전체 현황을 한눈에 확인하세요
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                사이트 보기
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
