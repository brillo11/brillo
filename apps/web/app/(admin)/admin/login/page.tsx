"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { verifyAdminCredentials } from "@/serverActions/auth/admin-auth.actions";
import { ArrowLeft } from "lucide-react";

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
      // 서버 액션으로 먼저 검증
      const verification = await verifyAdminCredentials(
        credentials.username,
        credentials.password
      );

      if (!verification.success) {
        toast.error(verification.message);
        setIsLoading(false);
        return;
      }

      // 검증 성공 시 next-auth로 로그인
      const result = await signIn("credentials", {
        redirect: false,
        username: credentials.username,
        password: credentials.password,
        callbackUrl: "/admin",
      });

      if (result?.error) {
        toast.error("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
      } else {
        toast.success("관리자 로그인 성공");
        if (result?.ok) {
          router.replace("/admin");
        }
      }
    } catch (error) {
      toast.error("로그인 중 오류가 발생했습니다.");
      console.error("Login error:", error);
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
      </div>
    </div>
  );
}
