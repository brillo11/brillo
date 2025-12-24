"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Search,
  Filter,
  Loader2,
  Trash2,
} from "lucide-react";
import { Step8VideoGeneration } from "./step8-video-generation";
import {
  getAIAssistantSessions,
  deleteAIAssistantSession,
  updateAIAssistantSession,
} from "@/serverActions/ai-assistant/ai-assistant-session.actions";
import type { AIAssistantSessionData } from "@/serverActions/ai-assistant/ai-assistant-session.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const STEP_LABELS: Record<string, string> = {
  TITLE: "제목 생성",
  THUMBNAIL_GUIDE: "썸네일 가이드",
  THUMBNAIL: "썸네일 생성",
  SCRIPT: "대본 작성",
  METADATA: "메타데이터",
  SHORTS_TITLES: "쇼츠 제목",
};

export function AssistantHistory({ redirectOnDelete }: { redirectOnDelete?: string }) {
  const router = useRouter();
  const [sessions, setSessions] = useState<AIAssistantSessionData[]>([]);
  const [selectedSession, setSelectedSession] =
    useState<AIAssistantSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const data = await getAIAssistantSessions();
      setSessions(data);
    } catch (error) {
      console.error("Failed to load sessions:", error);
      toast.error("세션을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteAIAssistantSession(sessionId);
      toast.success("삭제되었습니다.");

      // 상세 뷰에서 삭제한 경우 리스트로 돌아가기
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }

      // 세션 목록 새로고침
      loadSessions();

      // 히스토리 페이지로 이동 (옵션)
      if (redirectOnDelete) {
        router.push(redirectOnDelete);
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("삭제에 실패했습니다.");
    }
  };

  const getCompletionStatus = (session: AIAssistantSessionData) => {
    if (session.step === "COMPLETE") {
      return "Completed";
    }
    return "Draft";
  };

  const filteredSessions = sessions.filter(
    (session) =>
      session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.titleMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to safely parse JSON
  const safeParse = (data: any) => {
    if (!data) return null;
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        return null;
      }
    }
    return data;
  };

  const handleVideoGenerated = async (url: string, type: "VEO" | "HEYGEN") => {
    if (!selectedSession) return;
    try {
      await updateAIAssistantSession(selectedSession.id, {
        generatedVideoUrl: url,
        generatedVideoType: type,
      });
      // Update local state
      setSelectedSession((prev) =>
        prev
          ? {
              ...prev,
              generatedVideoUrl: url,
              generatedVideoType: type,
            }
          : null
      );
      toast.success("영상 정보가 저장되었습니다.");
      loadSessions(); // Refresh list background
    } catch (error) {
      console.error("Failed to update session:", error);
      toast.error("영상 정보 저장에 실패했습니다.");
    }
  };

  // Detail View
  if (selectedSession) {
    const scriptData = safeParse(selectedSession.scriptResponses);
    const metadataData = safeParse(selectedSession.metadataResponses);
    const titleData = safeParse(selectedSession.titleResponses);
    const selectedTitleSet =
      titleData?.sets?.[selectedSession.selectedTitleIndex ?? 0];
    
    // Display Title
    const displayTitle = selectedTitleSet?.videoTitle || selectedSession.title || "제목 없음";

    return (
      <div className="flex-1 min-h-screen bg-[#0A0A0A] overflow-y-auto animate-fade-in custom-scrollbar selection:bg-[#33DB98] selection:text-black">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedSession(null)}
              className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">
                {selectedSession.title || "제목 없음"}
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span
                  className={`px-2 py-0.5 rounded font-medium border ${
                    getCompletionStatus(selectedSession) === "Completed"
                      ? "bg-[#33DB98]/10 text-[#33DB98] border-[#33DB98]/20"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }`}
                >
                  {getCompletionStatus(selectedSession)}
                </span>
                <span>•</span>
                <span>
                  {new Date(selectedSession.createdAt).toLocaleDateString(
                    "ko-KR"
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => handleDelete(selectedSession.id, e)}
              className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 font-medium text-sm rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
            >
              삭제
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-8 pb-20">
             <Step8VideoGeneration
                selectedTitle={displayTitle}
                thumbnailUrls={selectedSession.thumbnailUrls || undefined}
                scriptResponses={scriptData}
                metadataResponses={metadataData}
                initialVideoUrl={selectedSession.generatedVideoUrl || undefined}
                initialVideoType={(selectedSession.generatedVideoType as "VEO" | "HEYGEN") || undefined}
                onVideoGenerated={handleVideoGenerated}
             />
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="flex-1 min-h-screen bg-black overflow-y-auto animate-fade-in p-8 custom-scrollbar selection:bg-[#33DB98] selection:text-black">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">작업 기록</h1>
            <p className="text-gray-400 mt-1">
              AI Assistant로 생성한 콘텐츠를 확인하고 관리하세요.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder="검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#33DB98]/20 focus:border-[#33DB98] w-64 shadow-sm placeholder:text-gray-600 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#33DB98]" size={40} />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/5">
            <div className="text-gray-500 mb-4">
              <FileText size={48} className="mx-auto mb-2 opacity-50" />
              <p>저장된 작업이 없습니다.</p>
            </div>
            <button
              onClick={() => router.push("/service/personal-branding/video")}
              className="px-6 py-3 bg-[#33DB98] text-black rounded-xl font-bold hover:bg-[#33DB98]/90 hover:shadow-lg hover:shadow-[#33DB98]/20 transition-all"
            >
              새 프로젝트 시작
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className="group bg-[#1c1c1c] rounded-2xl border border-white/5 overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1 hover:border-[#33DB98]/30 transition-all duration-300 flex flex-col"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-black/40 relative overflow-hidden">
                  {session.thumbnailUrls ? (
                    <img
                      src={session.thumbnailUrls}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                      alt=""
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 bg-white/5">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase shadow-sm backdrop-blur-sm ${
                        getCompletionStatus(session) === "Completed"
                          ? "bg-[#33DB98]/20 text-[#33DB98] border border-[#33DB98]/20"
                          : "bg-amber-500/20 text-amber-500 border border-amber-500/20"
                      }`}
                    >
                      {getCompletionStatus(session)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs font-bold text-[#33DB98] mb-1">
                      {STEP_LABELS[session.step || "TITLE"] || session.step}
                    </div>
                    <button
                      onClick={(e) => handleDelete(session.id, e)}
                      className="text-gray-600 hover:text-red-500 transition-colors bg-transparent hover:bg-white/5 p-1 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h3 className="font-bold text-gray-200 mb-2 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                    {session.title || session.titleMessage || "제목 없음"}
                  </h3>

                  <div className="mt-auto pt-4 flex items-center gap-4 text-xs text-gray-500 border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />{" "}
                      {new Date(session.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={12} />{" "}
                      {session.scriptResponses ? "대본 완료" : "대본 없음"}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* New Project Card */}
            <div
              onClick={() => router.push("/service/personal-branding/video")}
              className="bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 gap-4 cursor-pointer hover:border-[#33DB98] hover:bg-[#33DB98]/5 transition-all group min-h-[300px]"
            >
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-gray-500 group-hover:text-[#33DB98] group-hover:border-[#33DB98]/30">
                <FileText size={24} />
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-400 group-hover:text-white transition-colors">
                  새 프로젝트
                </div>
                <div className="text-xs text-gray-600 mt-1 group-hover:text-gray-400 transition-colors">
                  AI Assistant 시작하기
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
