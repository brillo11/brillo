"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { submitOnboarding } from "@/serverActions/auth/onboarding.actions";
import { toast } from "sonner";
import { Card, CardContent } from "@repo/ui/components/card";

export default function OnboardingPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(submitOnboarding, null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nickname, setNickname] = useState("");
  const [bizName, setBizName] = useState("");
  const [isAutoNickname, setIsAutoNickname] = useState(false);

  // 이름/전화번호 변경 시 닉네임 자동 생성
  useEffect(() => {
    if (name && phone.length >= 11) {
      const last4Digits = phone.replace(/-/g, "").slice(-4);
      if (last4Digits.length === 4) {
        setNickname(`${name}_${last4Digits}`);
        setIsAutoNickname(true);
      }
    }
  }, [name, phone]);

  useEffect(() => {
    if (state?.error) {
      if (typeof state.error === "string") {
        toast.error(state.error);
      } else {
        toast.error("입력 정보를 확인해주세요.");
        console.error(state.error);
      }
    }
  }, [state, router]);

  // 휴대폰 번호 자동 포맷팅
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= 11) {
      const formatted = value.replace(
        /^(\d{2,3})(\d{3,4})(\d{4})$/,
        `$1-$2-$3`
      );
      setPhone(formatted);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200/30 rounded-full animate-bounce"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-200/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-32 w-12 h-12 bg-indigo-200/30 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-blue-100/30 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            프로필 정보 입력
          </h1>
          <p className="text-slate-600 text-sm">
            서비스 이용을 위해 추가 정보를 입력해주세요
          </p>
        </div>

        <Card className="w-full border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <form action={formAction} className="space-y-6">
              {/* 실명 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  실명 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      name.length >= 2
                        ? "border-green-400 bg-green-50/10 focus:ring-green-100"
                        : "border-slate-300 focus:ring-blue-100 focus:border-blue-500"
                    } outline-none focus:ring-4 transition-all`}
                    placeholder="홍길동"
                  />
                  {name.length >= 2 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* 휴대폰 번호 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  휴대폰 번호 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="phoneNumber"
                    type="tel"
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      phone.length === 13 || phone.length === 12
                        ? "border-green-400 bg-green-50/10 focus:ring-green-100"
                        : "border-slate-300 focus:ring-blue-100 focus:border-blue-500"
                    } outline-none focus:ring-4 transition-all`}
                    placeholder="010-0000-0000"
                  />
                </div>
              </div>

              {/* 별명 (자동생성) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  별명 (자동 생성)
                </label>
                <input
                  name="nickname"
                  type="text"
                  readOnly
                  value={nickname}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 outline-none"
                  placeholder="실명과 전화번호 입력시 자동 생성"
                />
              </div>

              {/* 사업자명 (필수) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  사업자명 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="bizName"
                    type="text"
                    required
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    placeholder="사업자명을 입력해주세요"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? "처리중..." : "🚀 가입 신청"}
              </button>
              <p className="text-center text-xs text-slate-400">
                모든 필수 정보를 입력해주세요
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
