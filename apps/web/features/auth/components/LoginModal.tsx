"use client";

import { useState } from "react";
import { toast } from "sonner";
import { loginWithSocial } from "@/shared/lib/auth-helpers";
import { X } from "lucide-react";
import { useAtom } from "jotai";
import { loginModalOpenAtom } from "@/features/auth/login-modal-atom";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";

export function LoginModal() {
  const [isLoginOpen, setIsLoginOpen] = useAtom(loginModalOpenAtom);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const pathname = usePathname();

  const isDarkHeader = pathname === "/" || pathname === "/about";

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

  if (!isLoginOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md transition-all duration-300",
        isDarkHeader ? "bg-black/70" : "bg-white/70",
      )}
      onClick={() => setIsLoginOpen(false)}
    >
      <div
        className={cn(
          "w-full max-w-[400px] border rounded-2xl shadow-2xl overflow-hidden",
          isDarkHeader
            ? "bg-black border-white/10"
            : "bg-white border-black/10",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-8 md:p-10 flex flex-col items-center">
          <button
            onClick={() => setIsLoginOpen(false)}
            className={cn(
              "absolute top-6 right-6 transition-colors",
              isDarkHeader
                ? "text-gray-400 hover:text-white"
                : "text-gray-500 hover:text-black",
            )}
            aria-label="Close"
          >
            <X size={24} />
          </button>

          <div className="flex flex-col items-center mt-2 mb-10 w-full space-y-6">
            <img
              className={cn(
                "w-[100px] object-contain transition-all duration-300",
                !isDarkHeader && "invert",
              )}
              alt="Brillo Logo"
              src="/images/layout/brillo-logo-text.png"
            />

            <div className="text-center space-y-3">
              <h2
                className={cn(
                  "font-playfair font-normal text-[26px] tracking-[0.05em] uppercase",
                  isDarkHeader ? "text-white" : "text-black",
                )}
              >
                Login
              </h2>
              <p
                className={cn(
                  "font-suit font-medium text-[13px] tracking-tight break-keep",
                  isDarkHeader ? "text-gray-400" : "text-gray-500",
                )}
              >
                단순한 변화가 아닌, 새로운 당신
                <br />
                프리미엄 퍼스널 비주얼디렉팅
              </p>
            </div>
          </div>

          {/* 카카오 로그인 */}
          <div className="w-full mb-2">
            <button
              onClick={() => handleSocialLogin("kakao")}
              disabled={isSocialLoading}
              type="button"
              className="relative flex w-full items-center justify-center gap-3 rounded-xl bg-[#FEE500] px-4 py-[18px] font-suit font-bold text-[#191919] hover:bg-[#FEE500]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-6"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9 2C4.029 2 0 4.966 0 8.625C0 10.982 1.572 13.045 3.992 14.238C3.791 14.88 3.097 17.203 3.056 17.373C3.056 17.373 3.036 17.433 3.072 17.464C3.107 17.494 3.167 17.485 3.167 17.485C3.364 17.456 5.626 15.908 6.551 15.228C7.324 15.424 8.146 15.534 9 15.534C13.971 15.534 18 12.568 18 8.909C18 5.25 13.971 2 9 2Z"
                  fill="#191919"
                />
              </svg>
              {isSocialLoading ? "로그인 중..." : "카카오로 시작하기"}
            </button>
          </div>

          <div className="mt-6 text-center w-full">
            <p className="font-suit text-[#666666] text-xs">
              로그인 시 브릴로의{" "}
              <Link
                href="/terms"
                className={cn(
                  "underline transition-colors",
                  isDarkHeader ? "hover:text-white" : "hover:text-black",
                )}
                onClick={() => setIsLoginOpen(false)}
              >
                이용약관
              </Link>{" "}
              및{" "}
              <Link
                href="/privacy"
                className={cn(
                  "underline transition-colors",
                  isDarkHeader ? "hover:text-white" : "hover:text-black",
                )}
                onClick={() => setIsLoginOpen(false)}
              >
                개인정보처리방침
              </Link>
              에 동의하게 됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
