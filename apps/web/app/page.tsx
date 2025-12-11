"use client";

import { useState } from "react";
import { toast } from "sonner";
import { loginWithEmail, loginWithSocial } from "@/shared/lib/auth-helpers";
import Image from "next/image";
import { Card, CardContent } from "@repo/ui/components/card";
import { Logo } from "@repo/ui/components/proBlocks/logo";
import { Button } from "@repo/ui/components/button";
import {
  PlayCircle,
  BookOpen,
  Target,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Youtube,
  GraduationCap,
  Play,
} from "lucide-react";
import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing-navbar";
import { useSession } from "@/shared/lib/auth-client";
import { useRouter } from "next/navigation";
import { PATH } from "@/shared/consts/path";

export default function HomePage() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleStartLearning = () => {
    if (session?.user) {
      router.push(PATH.STUDENT_ROOT);
    } else {
      setIsLoginOpen(true);
    }
  };

  const handleSocialLogin = async (provider: "kakao") => {
    setIsSocialLoading(true);
    try {
      const result = await loginWithSocial(provider);
      if (!result.success) {
        toast.error(result.error || "카카오 로그인에 실패했습니다.");
      }
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

      toast.success("로그인 성공");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Youtube,
      title: "YouTube 기반 학습",
      description:
        "인기 YouTube 영상을 학습 자료로 활용하여 실용적인 지식을 습득합니다.",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: Target,
      title: "개인화된 미션",
      description:
        "나만의 학습 목표에 맞춘 맞춤형 미션을 통해 체계적으로 학습합니다.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: BookOpen,
      title: "자동 자막 추출",
      description:
        "YouTube 영상의 자막을 자동으로 추출하여 학습 자료로 활용합니다.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Users,
      title: "커뮤니티 학습",
      description:
        "다른 학습자들과 함께 공지사항을 확인하고 학습 경험을 공유합니다.",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      {/* Navigation */}
      <MarketingNavbar onLoginClick={() => setIsLoginOpen(true)} />
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-[500px] h-[500px] bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-20 w-[400px] h-[400px] bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob delay-[2s]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-wide mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            AI-Powered Personalized Learning
            {/* YouTube로 시작하는 개인화된 학습 */}
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
            YouTube 인사이트로 <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-amber-500">
              학습의 새로운 차원을
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-12 leading-relaxed">
            인기 YouTube 영상을 활용한 개인화된 학습 플랫폼으로{" "}
            <br className="hidden sm:block" /> 나만의 학습 자료를 만들고
            체계적으로 학습하세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-red-200 transition-all flex items-center justify-center gap-2 group"
              onClick={handleStartLearning}
            >
              무료로 학습 시작하기
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl border border-gray-200 shadow-2xl overflow-hidden bg-gray-900/5 aspect-video flex items-center justify-center group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 z-10"></div>
            <img
              src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop"
              alt="Dashboard Preview"
              className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute z-20 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg">
                <Play size={24} fill="currentColor" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-lg">
                  Analyzing Content...
                </p>
                <p className="text-white/80 text-sm">
                  Extracting key insights from 124 videos
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              왜 TubeInsight를 선택해야 할까요?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              YouTube 영상을 활용한 혁신적인 학습 경험을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl flex items-center justify-center text-red-600 mb-6 border border-red-100">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <Logo variant="full" size="md" />
            </div>
            <p className="text-sm text-slate-400">
              © 2024 TubeInsight. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {isLoginOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsLoginOpen(false)}
        >
          <Card
            className="w-full max-w-md border-none shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">로그인</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLoginOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </Button>
              </div>

              {/* 카카오 로그인 */}
              <div className="space-y-4 mb-6">
                <button
                  onClick={() => handleSocialLogin("kakao")}
                  disabled={isSocialLoading}
                  type="button"
                  className="relative flex w-full items-center justify-center gap-3 rounded-xl bg-[#FFE600] px-4 py-4 font-medium text-black hover:bg-[#FFE600]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
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
                <div className="text-center text-slate-600 text-sm">
                  수강생 여러분은 위 버튼을 클릭해주세요
                </div>
              </div>

              <div className="text-center mt-6 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdminFormOpen(!isAdminFormOpen)}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  관리자 로그인 {isAdminFormOpen ? "닫기 ▲" : "열기 ▼"}
                </button>
              </div>

              {isAdminFormOpen && (
                <form
                  id="admin-form"
                  onSubmit={handleSubmit}
                  className="space-y-4 mt-6 pt-6 border-t border-slate-200 animate-fadeIn"
                >
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-amber-800 font-medium">
                      ⚠️ 관리자 전용 로그인
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      아이디<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      name="email"
                      placeholder="아이디를 입력하세요"
                      required={true}
                      value={credentials.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-base text-slate-900 border rounded-xl transition-all focus:ring-2 focus:border-transparent placeholder-slate-400 border-slate-300 focus:ring-blue-500"
                      type="email"
                    />
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
                        className="appearance-none relative block w-full px-4 py-3 pr-12 border border-slate-300 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white placeholder-slate-400"
                        placeholder="비밀번호를 입력하세요"
                        type={showPassword ? "text" : "password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3 px-6 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? "로그인 중..." : "관리자 로그인"}
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
