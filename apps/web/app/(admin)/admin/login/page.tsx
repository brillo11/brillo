"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useRouter } from "next/navigation";
import { signIn } from "@/auth";
import { toast } from "sonner";
import { verifyAdminCredentials } from "@/serverActions/auth/admin-auth.actions";
import { ArrowLeft } from "lucide-react";
import { LoginDebugInfo } from "./debug-info";

export default function AdminLogin() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // NextAuth만 사용 (중복 검증 제거로 성능 개선)
      const result = await signIn("credentials", {
        redirect: false,
        username: credentials.username,
        password: credentials.password,
        callbackUrl: "/admin",
      });

      if (result?.error) {
        // NextAuth 에러 메시지를 더 친화적으로 변환
        const errorMessage =
          result.error === "CredentialsSignin"
            ? "아이디 또는 비밀번호가 올바르지 않습니다."
            : "로그인에 실패했습니다. 다시 시도해주세요.";
        toast.error(errorMessage);
      } else if (result?.ok) {
        toast.success("관리자 로그인 성공");

        // 세션 설정 완료 대기 후 리다이렉트
        setTimeout(() => {
          window.location.href = "/admin";
        }, 100);
        return;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      {/* 홈으로 가기 버튼 - 상단 좌측 */}
      <Button
        variant="ghost"
        className="fixed top-6 left-6 z-10"
        onClick={() => router.push("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        사이트 홈으로
      </Button>

      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">관리자 로그인</h2>
          <p className="mt-2 text-sm text-gray-600">
            관리자 계정으로 로그인해주세요
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                아이디
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={credentials.username}
                onChange={handleChange}
                placeholder="관리자 아이디"
                className="mt-1"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={credentials.password}
                onChange={handleChange}
                placeholder="관리자 비밀번호"
                className="mt-1"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        {/* 배포 환경 디버깅 도구 */}
        <LoginDebugInfo />
      </div>
    </div>
  );
}
