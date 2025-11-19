"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { loginWithEmail, loginWithSocial } from "@/shared/lib/auth-helpers";
import { PATH } from "@/shared/consts/path";
import { Card, CardContent } from "@repo/ui/components/card";

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  console.log({ credentials });
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);

  const handleSocialLogin = async (provider: "kakao") => {
    setIsSocialLoading(true);
    try {
      const result = await loginWithSocial(provider);
      if (!result.success) {
        toast.error(result.error || "카카오 로그인에 실패했습니다.");
      }
      // 성공 시 Better Auth가 자동으로 리다이렉트
    } catch (error) {
      console.error("Social login error:", error);
      toast.error("카카오 로그인 중 오류가 발생했습니다.");
    } finally {
      setIsSocialLoading(false);
    }
  };

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
      const result = await loginWithEmail(
        credentials.email,
        credentials.password
      );

      if (!result.success) {
        toast.error(result.error || "로그인에 실패했습니다.");
        return;
      }

      // 로그인 성공
      toast.success("로그인 성공");

      // if (credentials.email === "student.test@gmail.com") {
      //   // 세션 설정 완료 대기 후 리다이렉트
      //   setTimeout(() => {
      //     window.location.href = PATH.STUDENT_ROOT;
      //   }, 100);
      // } else {
      //   // 세션 설정 완료 대기 후 리다이렉트
      //   setTimeout(() => {
      //     window.location.href = PATH.ADMIN_ROOT;
      //   }, 100);
      // }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200/30 rounded-full animate-bounce"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-200/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-32 w-12 h-12 bg-indigo-200/30 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-blue-100/30 rounded-full animate-pulse delay-500"></div>
      </div>
      {/* 홈으로 가기 버튼 - 상단 좌측 */}
      {/* <Button
        variant="ghost"
        className="fixed top-6 left-6 z-10"
        onClick={() => router.push("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        사이트 홈으로
      </Button> */}

      <div className="max-w-md w-full space-y-6 sm:space-y-8 relative z-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900">사주 수익화</h2>
          <p className="mt-2 text-base text-gray-600">계정에 로그인해주세요</p>
        </div>

        <Card className="w-full max-w-md border-none shadow-xl">
          <CardContent>
            {/* 카카오 로그인 */}
            <div className="space-y-4 p-2">
              <button
                onClick={() => handleSocialLogin("kakao")}
                disabled={isSocialLoading}
                type="button"
                className="relative flex w-full items-center justify-center gap-3 rounded-xl bg-[#FFE600] px-4 py-4 font-medium text-black hover:bg-[#FFE600]/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* 카카오 아이콘 - 나중에 /public/icons/kakao.svg 추가 가능 */}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-5"
                >
                  <path
                    d="M12 3C6.477 3 2 6.477 2 11c0 2.558 1.523 4.85 3.889 6.262L5.5 21l3.889-1.889C10.5 19.5 11.2 19.6 12 19.6c5.523 0 10-3.477 10-8.6S17.523 3 12 3z"
                    fill="currentColor"
                  />
                </svg>
                {isSocialLoading ? "로그인 중..." : "카카오로 시작하기"}
              </button>
              <div className="text-center text-gray-500 text-sm">
                수강생 여러분은 위 버튼을 클릭해주세요
              </div>
            </div>

            <div className="text-center mt-8 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  console.log("관리자 로그인 버튼 클릭");
                  setIsAdminFormOpen((prev) => !prev);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                관리자 로그인 {isAdminFormOpen ? "닫기 ▲" : "열기 ▼"}
              </button>
            </div>

            {isAdminFormOpen && (
              <form
                onSubmit={handleSubmit}
                className="space-y-4 mt-6 pt-6 border-t border-slate-200 animate-fadeIn"
              >
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-amber-800 font-medium">
                    ⚠️ 관리자 전용 로그인
                  </p>
                </div>
                <div className="">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    아이디<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="email"
                      placeholder="아이디를 입력하세요"
                      required={true}
                      value={credentials.email}
                      onChange={handleChange}
                      className="w-full px-3 py-3 sm:px-4 text-base text-slate-900 border rounded-xl transition-all focus:ring-2 focus:border-transparent touch-manipulation placeholder-slate-400 border-slate-300 focus:ring-blue-500"
                      type="email"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    비밀번호
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      autoComplete="current-password"
                      required={true}
                      value={credentials.password}
                      onChange={handleChange}
                      className="appearance-none relative block w-full px-4 py-3 pr-12 border border-slate-300 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 placeholder-slate-400"
                      placeholder="비밀번호를 입력하세요"
                      type="password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                        data-slot="icon"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
                {/* <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      type="checkbox"
                    />
                    <span className="ml-2 text-slate-700">
                      30일 동안 로그인 유지
                    </span>
                  </label>
                </div> */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-6 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? "로그인 중..." : "관리자 로그인"}
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
