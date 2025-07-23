"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Eye, EyeOff, RefreshCw } from "lucide-react";

export function LoginDebugInfo() {
  const { data: session, status } = useSession();
  const [showDetails, setShowDetails] = useState(false);

  const checkSessionAPI = async () => {
    try {
      const response = await fetch("/api/auth/session");
      const sessionData = await response.json();
      console.log("📡 Session API Response:", sessionData);
      return sessionData;
    } catch (error) {
      console.error("❌ Session API Error:", error);
      return null;
    }
  };

  const testDatabaseConnection = async () => {
    try {
      const response = await fetch("/api/auth/test-db", { method: "POST" });
      const result = await response.json();
      console.log("🗄️ Database Test Result:", result);
      return result;
    } catch (error) {
      console.error("❌ Database Test Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const runDiagnostics = async () => {
    console.log("🔍 Running login diagnostics...");

    // 1. 세션 API 체크
    const sessionResult = await checkSessionAPI();

    // 2. 데이터베이스 연결 체크
    const dbResult = await testDatabaseConnection();

    // 3. 환경변수 체크 (클라이언트에서 확인 가능한 것만)
    const envCheck = {
      nodeEnv: process.env.NODE_ENV,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      currentUrl: window.location.origin,
    };

    console.log("📊 Diagnostics Results:", {
      session: sessionResult,
      database: dbResult,
      environment: envCheck,
      timestamp: new Date().toISOString(),
    });
  };

  if (!showDetails) {
    return (
      <div className="mt-4 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(true)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          <Eye className="h-3 w-3 mr-1" />
          배포 문제 진단 도구
        </Button>
      </div>
    );
  }

  return (
    <Card className="mt-4 border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          🔧 로그인 문제 진단
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={runDiagnostics}>
              <RefreshCw className="h-3 w-3 mr-1" />
              진단 실행
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDetails(false)}
            >
              <EyeOff className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {/* 현재 세션 상태 */}
        <div className="p-2 bg-white rounded border">
          <div className="font-semibold mb-2">🔐 세션 상태</div>
          <div className="space-y-1">
            <div>
              상태:
              <Badge
                variant={
                  status === "authenticated"
                    ? "default"
                    : status === "loading"
                      ? "secondary"
                      : "destructive"
                }
                className="ml-2 text-xs"
              >
                {status}
              </Badge>
            </div>
            {session && (
              <>
                <div>ID: {session.user?.id || "없음"}</div>
                <div>
                  역할:{" "}
                  <Badge variant="outline" className="text-xs">
                    {session.user?.role || "없음"}
                  </Badge>
                </div>
                <div>이름: {session.user?.name || "없음"}</div>
              </>
            )}
          </div>
        </div>

        {/* 환경 정보 */}
        <div className="p-2 bg-white rounded border">
          <div className="font-semibold mb-2">🌍 환경 정보</div>
          <div className="space-y-1">
            <div>
              환경:{" "}
              <Badge variant="outline" className="text-xs">
                {process.env.NODE_ENV}
              </Badge>
            </div>
            <div>현재 URL: {window.location.origin}</div>
            <div>쿠키 활성화: {navigator.cookieEnabled ? "✅" : "❌"}</div>
            <div>로컬 시간: {new Date().toLocaleString()}</div>
          </div>
        </div>

        {/* 배포 환경 체크리스트 */}
        <div className="p-2 bg-white rounded border">
          <div className="font-semibold mb-2">📋 배포 환경 체크리스트</div>
          <div className="space-y-1 text-xs">
            <div>✅ NEXTAUTH_SECRET 32자 이상으로 설정</div>
            <div>✅ NEXTAUTH_URL이 배포 도메인과 정확히 일치</div>
            <div>✅ DATABASE_URL이 올바르게 설정</div>
            <div>✅ HTTPS 환경에서 쿠키 보안 설정</div>
            <div>✅ 관리자 계정이 데이터베이스에 존재</div>
          </div>
        </div>

        {/* 문제 해결 가이드 */}
        <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
          <div className="font-semibold mb-2">💡 문제 해결 가이드</div>
          <div className="space-y-1 text-xs">
            <div>
              <strong>로딩이 길 때:</strong> 데이터베이스 연결 상태 확인
            </div>
            <div>
              <strong>로그인 후 리다이렉트 안됨:</strong> 세션 쿠키 설정 확인
            </div>
            <div>
              <strong>권한 에러:</strong> 사용자 역할이 ADMIN인지 확인
            </div>
            <div>
              <strong>계속 로그인 페이지로:</strong> NEXTAUTH_URL 확인
            </div>
          </div>
        </div>

        <div className="text-center pt-2">
          <div className="text-xs text-gray-500">
            콘솔에서 더 자세한 로그를 확인하세요
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
