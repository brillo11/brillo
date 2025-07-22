"use client";

import { useEffect } from "react";
import { Button } from "@repo/ui/components/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅
    console.error("🚨 Admin Dashboard Error:", {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
        </div>

        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          관리자 대시보드 오류
        </h1>

        <p className="mb-6 text-gray-600">
          대시보드를 불러오는 중 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도해주세요.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 rounded bg-red-50 p-4 text-left text-sm text-red-700">
            <p className="font-mono">{error.message}</p>
            {error.digest && (
              <p className="mt-2 text-xs text-red-500">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            다시 시도
          </Button>

          <Button
            variant="outline"
            onClick={() => (window.location.href = "/admin/login")}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            로그인 페이지로
          </Button>
        </div>
      </div>
    </div>
  );
}
