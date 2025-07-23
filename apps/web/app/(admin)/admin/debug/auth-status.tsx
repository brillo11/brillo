"use client";

import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { RefreshCw } from "lucide-react";

export function AuthStatusDebugger() {
  const { data: session, status, update } = useSession();

  const handleRefresh = () => {
    update();
    window.location.reload();
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          🔍 NextAuth 상태 디버깅
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
              <strong>이름:</strong> {session.user?.name}
            </div>
            <div>
              <strong>닉네임:</strong> {session.user?.nickname}
            </div>
            <div>
              <strong>역할:</strong>
              <Badge
                variant={
                  session.user?.role === "ADMIN" ? "default" : "secondary"
                }
                className="ml-2"
              >
                {session.user?.role}
              </Badge>
            </div>
            <div>
              <strong>계정 ID:</strong> {session.user?.accountId}
            </div>
            <div>
              <strong>제공자:</strong> {session.user?.provider}
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
            <li>✅ NEXTAUTH_SECRET 설정 확인</li>
            <li>✅ NEXTAUTH_URL이 배포 도메인과 일치하는지 확인</li>
            <li>✅ 데이터베이스 연결 확인</li>
            <li>✅ HTTPS 환경에서 쿠키 설정 확인</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
