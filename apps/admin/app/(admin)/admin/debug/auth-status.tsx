"use client";

import { authClient } from "@/shared/lib/auth-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export function AuthStatusDebugger() {
  const [session, setSession] = useState<any>(null);
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await authClient.getSession();
        if (sessionData?.data) {
          setSession(sessionData.data);
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
        setStatus("unauthenticated");
      }
    };
    fetchSession();
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          🔍 BetterAuth 상태 디버깅
          <Button size="sm" variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>세션 상태:</strong>
            <Badge
              variant={
                status === "authenticated"
                  ? "default"
                  : status === "loading"
                    ? "secondary"
                    : "destructive"
              }
              className="ml-2"
            >
              {status}
            </Badge>
          </div>

          <div>
            <strong>환경:</strong>
            <Badge variant="outline" className="ml-2">
              {process.env.NODE_ENV}
            </Badge>
          </div>
        </div>

        {session && (
          <div className="space-y-2 p-3 bg-gray-50 rounded">
            <div>
              <strong>사용자 ID:</strong> {session.user?.id}
            </div>
            <div>
              <strong>이메일:</strong> {session.user?.email}
            </div>
            <div>
              <strong>이름:</strong> {session.user?.name}
            </div>
            <div>
              <strong>생성일:</strong>{" "}
              {session.user?.createdAt
                ? new Date(session.user.createdAt).toLocaleString()
                : "N/A"}
            </div>
            <div>
              <strong>세션 만료:</strong>{" "}
              {session.expiresAt
                ? new Date(session.expiresAt).toLocaleString()
                : "N/A"}
            </div>
          </div>
        )}

        <div className="space-y-2 p-3 bg-blue-50 rounded">
          <div>
            <strong>현재 URL:</strong> {window.location.href}
          </div>
          <div>
            <strong>User Agent:</strong> {navigator.userAgent.slice(0, 50)}...
          </div>
          <div>
            <strong>쿠키 활성화:</strong>{" "}
            {navigator.cookieEnabled ? "예" : "아니오"}
          </div>
          <div>
            <strong>로컬 시간:</strong> {new Date().toISOString()}
          </div>
        </div>

        <div className="text-xs text-gray-600 space-y-1">
          <p>
            <strong>배포 환경 체크리스트:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>✅ BETTER_AUTH_SECRET 설정 확인</li>
            <li>✅ NEXT_PUBLIC_APP_URL이 배포 도메인과 일치하는지 확인</li>
            <li>✅ 데이터베이스 연결 확인</li>
            <li>✅ HTTPS 환경에서 쿠키 설정 확인</li>
            <li>✅ 소셜 로그인 클라이언트 ID/Secret 확인</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
