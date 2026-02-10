"use client";

import { useState } from "react";
import { toast } from "sonner";
import { loginWithEmail, loginWithSocial } from "@/shared/lib/auth-helpers";
import { Eye, EyeOff, X } from "lucide-react";
import { useAtom } from "jotai";
import { loginModalOpenAtom } from "@/features/auth/login-modal-atom";
import { BeforeAfterGallery } from "@/features/home/components/BeforeAfterGallery";
import { ReviewsCarousel } from "@/features/home/components/ReviewsCarousel";

export default function HomePage() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useAtom(loginModalOpenAtom);
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        credentials.password,
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
    <div className="bg-white overflow-hidden w-full min-w-full lg:min-w-[1280px] relative mx-auto mt-21">
      {/* 히어로 섹션 */}
      <div className="relative w-full h-screen">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/brillo_main.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#00000061]" />
        <div className="absolute bottom-40 left-4 md:left-[150px] w-full max-w-screen-xl mx-auto px-4 md:px-0">
          <div className="flex flex-col items-start gap-[18px] max-w-lg">
            <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
              <div className="relative self-stretch font-suit font-bold text-white text-[32px] md:text-[40px] leading-tight">
                외모, 그 이상의 변화
              </div>
            </div>
            <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
              <div className="relative self-stretch font-pretendard font-medium text-white text-xl md:text-2xl leading-[30px]">
                프리미엄 퍼스널 비주얼디렉팅
                <br />
                브릴로
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rebirth Quote */}
      <div className="relative py-20 bg-black px-4">
        <div className="max-w-screen-xl mx-auto">
          <p className="mx-auto font-normal text-white text-xl text-center tracking-[0] leading-[normal] font-playfair">
            <span className="text-white text-xl tracking-[0]">
              It’s not just a change, It’s a{" "}
            </span>
            <span className="font-bold">Rebirth</span>
            <span className="font-normal text-white text-xl tracking-[0]">
              .
            </span>
          </p>

          <p className="mx-auto max-w-md font-medium text-white text-2xl text-center tracking-[-1.44px] leading-9 mt-2">
            단순한 변화가 아닌, 새로운 당신
          </p>
        </div>

        <div className="flex flex-col gap-4 items-center">
          <div className="w-full pb-20">
            <BeforeAfterGallery />
          </div>

          {/* Main Hero Description Text */}
          <p className="font-medium font-suit text-white text-base text-center tracking-[0] leading-6 break-keep">
            <span className="font-medium">전 </span>
            <span className="font-medium font-playfair">SM Entertainment </span>
            <span className="font-medium">
              출신 비주얼 디렉터
              <br />
              수많은 아티스트와 브랜드의 변화를 이끌어온 경험
              <br />
            </span>
            <span className="font-bold">
              이제, 그 노하우를 온전히 당신에게 선사합니다
            </span>
          </p>
        </div>

        <img
          className="w-px h-[275px] object-cover mx-auto my-20"
          alt="Line"
          src="/images/home/vertical-line.svg"
        />

        {/* All About Visual Title */}
        <div className="flex flex-col w-full max-w-sm items-center gap-[19.65px] mx-auto text-center">
          <div className="flex flex-col items-center gap-[10.92px] relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative self-stretch font-serif font-normal text-white text-[32px] tracking-[0] leading-[normal]">
              ALL About VISUAL
            </div>
            <p className="relative self-stretch font-medium font-suit text-white text-2xl tracking-[0] leading-9">
              당신의 비주얼을 새롭게 정의하는 <br />
              프리미엄 솔루션
            </p>
          </div>
        </div>
      </div>
      <div className="h-[204px] bg-gradient-to-b from-black to-transparent -mt-px" />

      {/* 4카드 섹션 */}
      <div className="py-20 mx-auto max-w-screen-xl px-4 xl:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1 */}
          <div className="flex flex-col gap-6">
            <img
              className="w-full aspect-[246/288] object-cover"
              src="/images/home/card-1.png"
              alt="Visual Consulting"
            />
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-black text-[22px] leading-[33px]">
                Visual Consulting
              </h3>
              <p className="font-suit font-medium text-black text-[13px] leading-[19.5px] break-keep">
                당신의 모든 시각적 요소를 낱낱이 진단하고
                <br className="hidden md:block" />
                이를 극대화·최적화 하기 위한
                <br className="hidden md:block" />
                당신만의 비주얼 로드맵을 설계합니다.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col gap-6">
            <img
              className="w-full aspect-[246/288] object-cover"
              src="/images/home/card-2.png"
              alt="Signature Look Styling"
            />
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-black text-[22px] leading-[33px]">
                Signature Look Styling
              </h3>
              <p className="font-suit font-medium text-black text-[13px] leading-[19.5px] break-keep">
                트렌드가 아닌, 아이덴티티에 집중합니다.
                <br className="hidden md:block" />
                당신만의 무드와 라이프스타일을 반영한
                <br className="hidden md:block" />
                시그니처 룩 스타일링.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col gap-6">
            <img
              className="w-full aspect-[246/288] object-cover"
              src="/images/home/card-3.png"
              alt="Total Visual Making"
            />
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-black text-[22px] leading-[33px]">
                Total Visual Making
              </h3>
              <p className="font-suit font-medium text-black text-[13px] leading-[19.5px] break-keep">
                컨설팅-스타일링-헤어&페이셜 메이크오버-
                <br className="hidden md:block" />
                프로필 촬영까지. 머리부터 발끝까지 당신의
                <br className="hidden md:block" />
                비주얼에 차별화를 만듭니다.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="flex flex-col gap-6">
            <img
              className="w-full aspect-[246/288] object-cover"
              src="/images/home/card-4.png"
              alt="VIP & Celeb Directing"
            />
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-black text-[22px] leading-[33px]">
                VIP & Celeb Directing
              </h3>
              <p className="font-suit font-medium text-black text-[13px] leading-[19.5px] break-keep">
                비즈니스, 촬영, 그리고 무대와 영상 등 특별한
                <br className="hidden md:block" />
                순간 가장 빛나는 당신을 위한 프라이빗 케어.
                <br className="hidden md:block" />
                시술과 성형 메디컬 연계까지 확장, 드라마틱한
                <br className="hidden md:block" />
                변화를 지원합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Making Process */}
      <div className="mx-auto max-w-screen-xl px-4 xl:px-0 py-20 relative">
        <h2 className="font-serif font-normal text-black text-[28px] leading-[normal] mb-12">
          Visual Making Process
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {[
            {
              step: "1. 사진 & 체크리스트 준비",
              desc: "정밀 진단을 위한 기초 단계",
              icon: "/images/home/icon-file-image.svg",
              bg: "linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(102,102,102,1)_100%)",
            },
            {
              step: "2. 심층 컨설팅",
              desc: "데이터 기반 분석과 맞춤 전략 설계",
              icon: "/images/home/icon-macbook.svg",
              bg: "linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(102,102,102,1)_100%)",
            },
            {
              step: "3. 퍼스널 스타일링",
              desc: "목적· 예산· 체형을 반영한 실전 코디네이션",
              icon: "/images/home/icon-presentation.svg",
              bg: "linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(102,102,102,1)_100%)",
            },
            {
              step: "4. 헤어 & 메이크업",
              desc: "전문 아티스트와 함께 나만의 비주얼 완성",
              icon: "/images/home/icon-brush.svg",
              bg: "linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(102,102,102,1)_100%)",
            },
            {
              step: "5. 프로필 스냅 촬영",
              desc: "완성된 나만의 비주얼을 기록",
              icon: "/images/home/icon-camera.svg",
              bg: "linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(102,102,102,1)_100%)",
            },
            {
              step: "6. 맞춤 리포트 제공",
              desc: "지속가능한 자기 관리 가이드",
              icon: "/images/home/icon-file-chart.svg",
              bg: "linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(102,102,102,1)_100%)",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="w-full h-[180px] rounded-[30px] relative bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border border-gray-100 shadow-sm flex flex-col justify-end p-8 overflow-hidden group hover:shadow-md transition-shadow"
            >
              <div className="absolute top-[25px] left-[23px] w-12 h-12 rounded-full flex items-center justify-center shadow-md bg-zinc-900">
                <img
                  src={item.icon}
                  alt="icon"
                  className="w-6 h-6 invert brightness-0 filter"
                />
              </div>
              <div className="flex flex-col items-start gap-2 relative z-10">
                <h3 className="font-suit font-medium text-black text-2xl leading-9">
                  {item.step}
                </h3>
                <p className="font-suit font-medium text-black text-base leading-6 text-gray-600">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Process Flow Lines (Full Screen Width) */}
        <div className="hidden lg:block absolute w-screen left-1/2 -translate-x-1/2 inset-y-0 pointer-events-none -z-0">
          <div className="max-w-screen-xl mx-auto w-full h-full relative font-bold">
            {/* Row 1: Start from Center of Card 1 -> End Screen Edge */}
            <div className="absolute top-[260px] right-[calc(-50vw+50%)] left-[16.666%] border-t border-dashed border-gray-800" />

            {/* Row 2: Start from Screen Edge -> Center of Card 6 */}
            <div className="absolute top-[464px] left-[calc(-50vw+50%)] -right-[3%] border-t border-dashed border-gray-800">
              <div className="absolute -right-1.5 -top-1.5 w-3 h-3 border-t border-r border-gray-800 rotate-45" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Area Backgrounds */}
      <ReviewsCarousel />

      {/* Decorative / Gradient Elements */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-[1751px] h-[1217px] pointer-events-none" />

      {/* Login Modal (Floating) */}
      {isLoginOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsLoginOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white tracking-widest">
                  LOGIN
                </h2>
                <button
                  onClick={() => setIsLoginOpen(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* 카카오 로그인 */}
              <div className="space-y-4 mb-8">
                <button
                  onClick={() => handleSocialLogin("kakao")}
                  disabled={isSocialLoading}
                  type="button"
                  className="relative flex w-full items-center justify-center gap-3 rounded-xl bg-[#FFE812] px-4 py-4 font-medium text-black hover:bg-[#FFE812]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {/* Kakao Icon */}
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="absolute left-5"
                  >
                    <path
                      d="M12 3C6.477 3 2 6.477 2 11c0 2.558 1.523 4.85 3.889 6.262L5.5 21l3.889-1.889C10.5 19.5 11.2 19.6 12 19.6c5.523 0 10-3.477 10-8.6S17.523 3 12 3z"
                      fill="currentColor"
                    />
                  </svg>
                  {isSocialLoading ? "로그인 중..." : "카카오로 시작하기"}
                </button>
              </div>

              <div className="text-center pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAdminFormOpen(!isAdminFormOpen)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  관리자 로그인
                </button>
              </div>

              {isAdminFormOpen && (
                <form
                  id="admin-form"
                  onSubmit={handleSubmit}
                  className="space-y-5 mt-6 animate-fade-in"
                >
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">
                      아이디
                    </label>
                    <input
                      name="email"
                      placeholder="admin@brillo.kr"
                      required={true}
                      value={credentials.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-[#222] transition-colors"
                      type="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">
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
                        className="w-full px-4 py-3 pr-12 bg-[#1A1A1A] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-[#222] transition-colors"
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-6 rounded-xl font-suit font-bold text-black bg-white hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? "로그인 중..." : "관리자 로그인"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
