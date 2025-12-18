"use client";

import { useState } from "react";
import { toast } from "sonner";
import { loginWithEmail, loginWithSocial } from "@/shared/lib/auth-helpers";
import { Card, CardContent } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import {
  ChevronDown,
  ArrowRight,
  Play,
  Sparkles,
  FileText,
  Share2,
  Video,
  Zap,
  Globe,
  Cpu,
  Twitter,
  Youtube,
} from "lucide-react";
import { useSession } from "@/shared/lib/auth-client";
import { useRouter } from "next/navigation";
import { PATH } from "@/shared/consts/path";
import Image from "next/image";
import Link from "next/link";

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

  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const faqs = [
    {
      q: "VZX는 어떤 서비스인가요?",
      a: "VZX는 지식 창업 강사들을 위한 올인원 AI 브랜딩 자동화 플랫폼입니다. 한 번의 주제 입력만으로 블로그, 쓰레드, 숏츠 기획 및 영상까지 생성합니다.",
    },
    {
      q: "블로그 글만 있으면 영상 제작이 가능한가요?",
      a: "네, VZX의 AI는 텍스트를 분석하여 가장 바이럴되기 좋은 숏츠 스크립트를 추출하고 AI 아바타가 말하는 영상까지 만들어냅니다.",
    },
    // {
    //   q: "SaaS 툴 제작은 어떻게 진행되나요?",
    //   a: "강사님이 수강생들에게 제공하고 싶은 툴 아이디어를 제안하면, VZX의 SaaS 빌더 팀과 AI가 즉시 전용 소프트웨어를 구축해드립니다.",
    // },
  ];

  const handleStartService = () => {
    if (session?.user) {
      router.push(PATH.SERVICE_DASHBOARD);
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

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-vzx-accent selection:text-black">
      {/* GNB (Header) */}
      <header className="fixed top-0 left-0 right-0 h-20 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl z-[100] px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Image
                src="/android-chrome-192x192.png"
                alt="VZX"
                width={48}
                height={48}
              />
              {/* <div className="w-8 h-8 bg-vzx-accent rounded flex items-center justify-center font-bold text-black text-xl">
                V
              </div> */}
              {/* <span className="font-bold text-xl tracking-tighter">VZX</span> */}
            </div>
            <nav className="hidden md:flex items-center gap-6">
              {/* <a
                href="#"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Solutions
              </a> */}
              <Link
                href={PATH.SERVICE_DASHBOARD}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                퍼스널 브랜딩
              </Link>
              <Link
                href={PATH.SERVICE_PERSONAL_BRANDING_WORKFLOW}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                워크플로우 V.1
                <span className="bg-vzx-accent/10 text-vzx-accent text-[10px] px-1.5 py-0.5 rounded border border-vzx-accent/20">
                  NEW
                </span>
              </Link>
              <a
                href="#"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                요금제
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {/* <button
              onClick={handleStartLearning}
              className="text-sm font-medium text-white hover:text-vzx-accent transition-colors"
            >
              대시보드
            </button> */}
            <button
              onClick={handleStartService}
              className="bg-white text-black font-bold px-5 py-2 rounded-full text-sm hover:bg-gray-200 transition-all"
            >
              {session?.user ? "대시보드" : "로그인"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-8 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-vzx-accent/10 rounded-full blur-[120px] -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-400 animate-fade-in-up">
            <Sparkles size={14} className="text-vzx-accent" />
            #1 AI 퍼스널 브랜딩 툴
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            인사이트 하나로, <br />
            <span className="text-vzx-accent">
              10개의 바이럴 컨텐츠 만들고,
            </span>
            <br />
            10배 빠르게 성장하기
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            VisionX 는 당신의 전문성을 눈에 띄는 블로그, 쓰레드, 영상으로 만들어
            드립니다.
          </p>

          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-0 bg-vzx-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-[#1A1A1A] border border-white/10 p-2 rounded-2xl flex items-center gap-2">
              <div className="pl-4 flex-1">
                <input
                  type="text"
                  placeholder="당신의 인사이트를 여기 적어보세요. (ex. 팔리는 숏츠의 비밀)"
                  className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500"
                />
              </div>
              <button
                onClick={handleStartService}
                className="bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-vzx-accent transition-colors flex items-center gap-2"
              >
                워크플로우 <ArrowRight size={18} />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6 text-[10px] text-gray-500 font-medium uppercase tracking-widest">
              <span className="flex items-center gap-1">
                <Zap size={10} className="text-vzx-accent" /> AI 기획자
              </span>
              <span className="flex items-center gap-1">
                <FileText size={10} /> 블로그 포스트 작가
              </span>
              <span className="flex items-center gap-1">
                <Share2 size={10} /> 쓰레드 포스트 생성
              </span>
              <span className="flex items-center gap-1">
                <Video size={10} /> 아바타 생성
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Visual Demo Section */}
      <section className="px-8 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="aspect-video bg-[#111] rounded-3xl border border-white/5 overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-vzx-accent/5 to-transparent" />
            <div className="h-full w-full flex items-center justify-center p-8">
              {/* Simulated Interface Showcase */}
              <div className="grid grid-cols-4 gap-4 w-full h-full opacity-80">
                <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-3">
                  <div className="h-4 w-2/3 bg-white/20 rounded" />
                  <div className="aspect-square bg-vzx-accent/10 rounded-xl flex items-center justify-center">
                    <FileText size={40} className="text-vzx-accent" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-white/10 rounded" />
                    <div className="h-2 w-full bg-white/10 rounded" />
                    <div className="h-2 w-4/5 bg-white/10 rounded" />
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-3 translate-y-4">
                  <div className="h-4 w-2/3 bg-white/20 rounded" />
                  <div className="aspect-square bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Twitter size={40} className="text-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-white/10 rounded" />
                    <div className="h-2 w-full bg-white/10 rounded" />
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-3">
                  <div className="h-4 w-2/3 bg-white/20 rounded" />
                  <div className="aspect-square bg-red-500/10 rounded-xl flex items-center justify-center">
                    <Youtube size={40} className="text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-white/10 rounded" />
                    <div className="h-2 w-full bg-white/10 rounded" />
                    <div className="h-2 w-full bg-white/10 rounded" />
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-3 translate-y-4">
                  <div className="h-4 w-2/3 bg-white/20 rounded" />
                  <div className="aspect-video bg-vzx-accent/20 rounded-xl relative overflow-hidden flex items-center justify-center">
                    <Play fill="#33db98" stroke="none" size={32} />
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded" />
                </div>
              </div>
              {/* Centered Floating Play Button */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-20 h-20 bg-vzx-accent rounded-full flex items-center justify-center pl-1 shadow-[0_0_50px_rgba(51,219,152,0.5)] cursor-pointer hover:scale-110 transition-transform">
                  <Play fill="black" stroke="none" size={32} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Wall */}
      {/* <section className="px-8 pb-32 text-center opacity-40">
        <p className="text-xs font-bold uppercase tracking-[0.3em] mb-12">
          최고의 교육 플랫폼에서 인정받은
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
          {["TITAN CLASS"].map((name) => (
            <span
              key={name}
              className="text-3xl font-black italic tracking-tighter text-gray-500"
            >
              {name}
            </span>
          ))}
        </div>
      </section> */}

      {/* Workflow Section: "Automation on Autopilot" */}
      <section className="px-8 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="text-vzx-accent text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <Cpu size={16} /> 브랜딩 워크플로우 자동화
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              당신의 퍼스널 브랜딩 워크플로우, AI로 대체되었다.
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              AI가 당신의 퍼스널 브랜딩 워크플로우를 자동화하여,{" "}
              <span className="text-vzx-accent">10배 빠르게</span> 바이럴을
              생성합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#111] border border-white/5 p-8 rounded-3xl hover:border-vzx-accent/30 transition-all">
              <div className="p-3 bg-vzx-accent/10 rounded-xl w-fit mb-6 text-vzx-accent">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">
                인사이트로 블로그 작성기
              </h3>
              <p className="text-gray-500 leading-relaxed">
                AI가 당신의 인사이트를 분석하여 전문성을 반영한 SEO-최적화된
                블로그를 생성합니다.
              </p>
            </div>
            <div className="bg-[#111] border border-white/5 p-8 rounded-3xl hover:border-vzx-accent/30 transition-all">
              <div className="p-3 bg-blue-500/10 rounded-xl w-fit mb-6 text-blue-500">
                <Share2 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">블로그를 쓰레드로</h3>
              <p className="text-gray-500 leading-relaxed">
                당신의 긴 블로그 글을 높은 인게이지먼트의 Threads 포스트로
                변환해줍니다.
              </p>
            </div>
            <div className="bg-[#111] border border-white/5 p-8 rounded-3xl hover:border-vzx-accent/30 transition-all">
              <div className="p-3 bg-red-500/10 rounded-xl w-fit mb-6 text-red-500">
                <Video size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">블로그를 숏츠로</h3>
              <p className="text-gray-400 leading-relaxed">
                블로그 글에 기반해 당신의 숏츠를 AI가 기획하고 당신의 아바타
                에셋을 만들어줍니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-8 pb-32">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            질문 있으신가요?
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${faqOpen === i ? "rotate-180" : ""}`}
                  />
                </button>
                {faqOpen === i && (
                  <div className="px-6 pb-5 text-gray-400 leading-relaxed animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-8 pb-32">
        <div className="max-w-5xl mx-auto bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] rounded-[40px] p-12 md:p-20 text-center border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-vzx-accent/5 blur-[100px] pointer-events-none" />
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 relative z-10">
            당신이라는 브랜드를 <br />
            시행착오 없이 키우세요
          </h2>
          <button
            onClick={handleStartService}
            className="relative z-10 bg-white text-black font-bold px-10 py-4 rounded-full text-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
          >
            시작하기 <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Image src="/logo.png" alt="VZX" width={48} height={48} />
              {/* <div className="w-8 h-8 bg-vzx-accent rounded flex items-center justify-center font-bold text-black text-xl">
                V
              </div>
              <span className="font-bold text-xl tracking-tighter">VZX</span> */}
            </div>
            <p className="text-gray-500 text-sm max-w-xs mb-6">
              당신이 가진 전문성의 가치를 아는 유일한 AI 브랜딩 툴
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-gray-500">
              Product
            </h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-vzx-accent">
                  AI Branding
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-vzx-accent">
                  SaaS Builder
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-vzx-accent">
                  Community
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-gray-500">
              Resources
            </h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-vzx-accent">
                  Success Stories
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-vzx-accent">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-vzx-accent">
                  API Docs
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-gray-500">
              Legal
            </h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-vzx-accent">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-vzx-accent">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-vzx-accent">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center text-xs text-gray-600">
          © 2026 TALOSWORKS Inc. All rights reserved.
        </div>
      </footer>

      {/* Login Modal */}
      {isLoginOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsLoginOpen(false)}
        >
          <Card
            className="w-full max-w-md border-none shadow-2xl max-h-[90vh] overflow-y-auto bg-vzx-card"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="px-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-100">로그인</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLoginOpen(false)}
                  className="text-gray-400 hover:text-gray-600 bg-transparent"
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
                {/* <div className="text-center text-slate-600 text-sm">
                  수강생 여러분은 위 버튼을 클릭해주세요
                </div> */}
              </div>

              {/* <div className="text-center mt-6 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdminFormOpen(!isAdminFormOpen)}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  관리자 로그인 {isAdminFormOpen ? "닫기 ▲" : "열기 ▼"}
                </button>
              </div> */}

              {/* {isAdminFormOpen && (
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
              )} */}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
