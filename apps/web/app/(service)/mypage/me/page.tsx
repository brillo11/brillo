"use client";

import React, { useState, useEffect } from "react";
import { useSession, authClient } from "@/shared/lib/auth-client";
import { getLoginProvider } from "./actions";

export default function MyPageMe() {
  const { data: session } = useSession();

  const [provider, setProvider] = useState<string>("-");

  useEffect(() => {
    getLoginProvider().then((res) => {
      if (res) {
        const labels: Record<string, string> = {
          kakao: "카카오 (Kakao)",
          naver: "네이버 (Naver)",
          google: "구글 (Google)",
          credential: "이메일 계정 (Email)",
          email: "이메일 계정 (Email)",
        };
        setProvider(labels[res] || res);
      }
    });
  }, []);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState("");

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    setPwdLoading(true);
    setPwdMessage("");

    try {
      const { error } = await authClient.changePassword({
        newPassword: newPassword,
        currentPassword: currentPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        setPwdMessage(error.message || "비밀번호 변경에 실패했습니다.");
      } else {
        setPwdMessage("비밀번호가 성공적으로 변경되었습니다.");
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (error: any) {
      setPwdMessage("오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setPwdLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="max-w-[480px] space-y-12">
        {/* 현재 계정 정보 요약 */}
        <div>
          <h2 className="font-suit text-lg font-bold text-black border-b border-black pb-3 mb-6">
            기본 정보
          </h2>
          <div className="space-y-4 font-suit text-sm text-black">
            <div className="flex justify-between items-center pb-2 border-b border-[#d4d4d4]">
              <span className="font-semibold w-32">가입 연동 플랫폼</span>
              <span className="flex-1 text-[#000000]/70 text-right md:text-left">
                {provider}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#d4d4d4]">
              <span className="font-semibold w-32">가입 이메일</span>
              <span className="flex-1 text-[#000000]/70 text-right md:text-left">
                {session?.user?.email || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#d4d4d4]">
              <span className="font-semibold w-32">현재 이름</span>
              <span className="flex-1 text-[#000000]/70 text-right md:text-left">
                {session?.user?.name || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* 비밀번호 변경 폼 */}
        <div>
          <h3 className="font-suit text-lg font-bold text-black border-b border-black pb-3 mb-4">
            비밀번호 변경
          </h3>
          <p className="text-sm text-[#000000]/60 mb-6 font-suit">
            이메일로 가입한 계정만 해당됩니다.{" "}
            <br className="hidden md:block" />
            카카오, 네이버, 구글 가입자는 여기서 변경할 수 없습니다.
          </p>
          <form className="space-y-4 font-suit" onSubmit={handleUpdatePassword}>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                현재 비밀번호
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 사용 중인 비밀번호"
                required
                className="w-full px-4 h-12 bg-transparent border border-[#d4d4d4] rounded-none focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                새 비밀번호
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새로운 비밀번호"
                required
                className="w-full px-4 h-12 bg-transparent border border-[#d4d4d4] rounded-none focus:outline-none focus:border-black transition-colors"
              />
            </div>
            {pwdMessage && (
              <p
                className={`text-sm tracking-tight ${pwdMessage.includes("성공") ? "text-blue-600" : "text-red-600"}`}
              >
                {pwdMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={pwdLoading}
              className="w-full h-12 bg-transparent border border-black text-black text-sm font-semibold rounded-none hover:bg-black/5 transition-colors disabled:opacity-50 mt-2"
            >
              {pwdLoading ? "처리 중..." : "비밀번호 업데이트"}
            </button>
          </form>
        </div>

        {/* 로그아웃 버튼 */}
        <div className="pt-8 border-t border-[#d4d4d4]">
          <button
            onClick={async () => {
              await authClient.signOut();
              window.location.href = "/";
            }}
            className="w-full h-12 bg-black text-white text-sm font-semibold rounded-none hover:bg-gray-800 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
