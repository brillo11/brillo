"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { signUpWithEmail } from "@/shared/lib/auth-helpers";
import { PATH } from "@/shared/consts/path";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signUpWithEmail(
        form.email,
        form.password,
        form.name
      );

      if (result.success) {
        toast.success("회원가입에 성공했습니다!");
        router.push(PATH.AUTH_LOGIN);
      } else {
        toast.error(result.error || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("회원가입 중 오류가 발생했습니다.");
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
          <h2 className="text-2xl font-bold text-gray-900">회원가입</h2>
          <p className="mt-2 text-sm text-gray-600">
            이메일로 회원가입해주세요
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                이메일
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="이메일을 입력해주세요"
                className="mt-1"
              />
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                이름
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="이름을 입력해주세요"
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
                value={form.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력해주세요"
                className="mt-1"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "가입 중..." : "이메일로 회원가입"}
          </Button>
        </form>

        {/* 로그인 링크 */}
        <div className="mt-6 text-center">
          <span className="text-gray-600">이미 계정이 있으신가요? </span>
          <button
            onClick={() => router.push(PATH.AUTH_LOGIN)}
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
}

