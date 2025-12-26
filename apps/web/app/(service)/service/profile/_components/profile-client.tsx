"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { updateProfileSettings } from "@/serverActions/profile/profile.actions";
import { AssistantHistory } from "../../personal-branding/video/_components/assistant-history";
import { BlogHistory } from "./blog-history";
import {
  User,
  Settings,
  FileText,
  Instagram,
  Share2,
  Video,
  Save,
} from "lucide-react";

interface ProfileClientProps {
  user: {
    name?: string | null;
    nickname?: string | null;
    email?: string | null;
    role?: string | null;
    image?: string | null;
    heygenAvatarId?: string | null;
    heygenVoiceId?: string | null;
  } | null;
}

export function ProfileClient({ user }: ProfileClientProps) {
  const [avatarId, setAvatarId] = useState(user?.heygenAvatarId || "");
  const [voiceId, setVoiceId] = useState(user?.heygenVoiceId || "");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "PROFILE" | "BLOG" | "INSTAGRAM" | "THREAD" | "VIDEO"
  >("PROFILE");

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateProfileSettings({
        heygenAvatarId: avatarId,
        heygenVoiceId: voiceId,
      });
      toast.success("설정이 저장되었습니다.");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("설정 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl min-h-screen space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-[#33DB98]/10 flex items-center justify-center text-[#33DB98]">
          <User size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">내 프로필</h1>
          <p className="text-gray-400">계정 설정 및 작업물 관리</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Tabs */}
        <div className="flex border-b border-white/10 overflow-x-auto">
          {[
            { id: "PROFILE", label: "프로필", icon: User },
            { id: "BLOG", label: "블로그", icon: FileText },
            { id: "THREAD", label: "스레드", icon: Share2 },
            { id: "INSTAGRAM", label: "인스타그램", icon: Instagram },
            { id: "VIDEO", label: "영상 제작", icon: Video },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-[#33DB98] text-[#33DB98] font-bold"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="min-h-[500px]">
          {activeTab === "PROFILE" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* User Info Card */}
              <div className="bg-vzx-card border border-white/10 rounded-2xl p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-800 border-2 border-[#33DB98]/30 overflow-hidden">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user.name || ""}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {user?.nickname || user?.name || "사용자"}
                    </h2>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                    <div className="mt-2 inline-flex items-center px-2 py-1 rounded bg-[#33DB98]/10 text-[#33DB98] text-xs font-bold border border-[#33DB98]/20">
                      {user?.role || "MEMBER"}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl">
                    <span className="text-gray-400 text-sm">보유 포인트</span>
                    <span className="text-white font-bold">0 P</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl">
                    <span className="text-gray-400 text-sm">이용중인 플랜</span>
                    <span className="text-white font-bold">무료 플랜</span>
                  </div>
                </div>
              </div>

              {/* Settings Card */}
              <div className="bg-vzx-card border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-2 mb-6 text-white font-bold text-lg">
                  <Settings size={20} className="text-[#33DB98]" />
                  <span>AI 설정</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      HeyGen Avatar ID
                    </label>
                    <input
                      type="text"
                      value={avatarId}
                      onChange={(e) => setAvatarId(e.target.value)}
                      placeholder="Avatar ID 입력"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-[#33DB98] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      HeyGen Voice ID
                    </label>
                    <input
                      type="text"
                      value={voiceId}
                      onChange={(e) => setVoiceId(e.target.value)}
                      placeholder="Voice ID 입력"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-[#33DB98] focus:outline-none transition-colors"
                    />
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="w-full bg-[#33DB98] hover:bg-[#2bb880] text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-[#33DB98]/20"
                  >
                    {isSaving ? (
                      "저장 중..."
                    ) : (
                      <>
                        <Save size={18} /> 설정 저장하기
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "VIDEO" && (
            <div className="bg-vzx-card border border-white/10 rounded-2xl overflow-hidden min-h-[600px]">
              <AssistantHistory redirectOnDelete={undefined} />
              {/* render AssistantHistory without redirect, it fits nicely */}
            </div>
          )}

          {activeTab === "BLOG" && (
            <div className="bg-vzx-card border border-white/10 rounded-2xl overflow-hidden min-h-[600px]">
              <BlogHistory />
            </div>
          )}

          {activeTab === "INSTAGRAM" && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-vzx-card border border-white/10 rounded-2xl">
              <Instagram size={48} className="mb-4 opacity-50" />
              <p>인스타그램 작업 내역이 없습니다.</p>
              <button className="mt-4 px-4 py-2 border border-white/20 rounded-lg text-sm hover:bg-white/5 transition-colors">
                새 피드 생성하기
              </button>
            </div>
          )}

          {activeTab === "THREAD" && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-vzx-card border border-white/10 rounded-2xl">
              <Share2 size={48} className="mb-4 opacity-50" />
              <p>스레드 작업 내역이 없습니다.</p>
              <button className="mt-4 px-4 py-2 border border-white/20 rounded-lg text-sm hover:bg-white/5 transition-colors">
                새 스레드 작성하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
