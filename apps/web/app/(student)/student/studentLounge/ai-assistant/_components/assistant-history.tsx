"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Hash,
  Download,
  Copy,
  MoreVertical,
  Search,
  Filter,
  Loader2,
  Trash2,
} from "lucide-react";
import { getAIAssistantSessions, deleteAIAssistantSession } from "@/serverActions/ai-assistant/ai-assistant-session.actions";
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

export function AssistantHistory() {
  const router = useRouter();
  const [sessions, setSessions] = useState<AIAssistantSessionData[]>([]);
  const [selectedSession, setSelectedSession] = useState<AIAssistantSessionData | null>(null);
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
      
      // 히스토리 페이지로 이동
      router.push("/student/studentLounge/ai-assistant/history");
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

  const filteredSessions = sessions.filter((session) =>
    session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.titleMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Detail View
  if (selectedSession) {
    const scriptData = selectedSession.scriptResponses as any;
    const metadataData = selectedSession.metadataResponses as any;
    const titleData = selectedSession.titleResponses as any;
    const selectedTitleSet = titleData?.sets?.[selectedSession.selectedTitleIndex ?? 0];

    return (
      <div className="flex-1 bg-gray-50 h-screen overflow-y-auto animate-fade-in custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedSession(null)}
              className="p-2 hover:bg-gray-100 rounded-full text-slate-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {selectedSession.title || "제목 없음"}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span
                  className={`px-2 py-0.5 rounded font-medium ${
                    getCompletionStatus(selectedSession) === "Completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {getCompletionStatus(selectedSession)}
                </span>
                <span>•</span>
                <span>{new Date(selectedSession.createdAt).toLocaleDateString("ko-KR")}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {/* <button
              onClick={() => router.push(`/student/studentLounge/ai-assistant?session=${selectedSession.id}`)}
              className="px-4 py-2 bg-white border border-gray-200 text-slate-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              이어서 작업
            </button> */}
            <button
              onClick={(e) => handleDelete(selectedSession.id, e)}
              className="px-4 py-2 bg-red-600 text-white font-medium text-sm rounded-lg hover:bg-red-700 transition-colors shadow-lg"
            >
              삭제
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-8 space-y-8">
          {/* Overview Card */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText size={18} className="text-red-600" /> 선택된 제목
              </h3>
              {selectedTitleSet ? (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">
                    영상 제목
                  </div>
                  <div className="text-lg font-bold text-slate-800 mb-4">
                    {selectedTitleSet.videoTitle}
                  </div>

                  <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">
                    썸네일 텍스트
                  </div>
                  <div className="text-base font-medium text-red-600">
                    "{selectedTitleSet.thumbnailTitle}"
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-400 italic">제목이 선택되지 않았습니다.</div>
              )}
            </div>

            {/* Thumbnail Preview */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon size={18} className="text-red-600" /> 썸네일
              </h3>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative border border-gray-200 group">
                {selectedSession.thumbnailResponses ? (
                  <>
                    <img
                      src={`data:image/jpeg;base64,${selectedSession.thumbnailResponses}`}
                      className="w-full h-full object-cover"
                      alt="Thumbnail"
                    />
                    <a
                      href={`data:image/jpeg;base64,${selectedSession.thumbnailResponses}`}
                      download="thumbnail.jpg"
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium gap-2"
                    >
                      <Download size={20} /> Download
                    </a>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon size={32} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Script & Metadata */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={18} className="text-red-600" /> 대본
                </h3>
                <button
                  className="text-slate-400 hover:text-red-600 transition-colors"
                  onClick={() => {
                    if (scriptData) {
                      const fullScript = `${scriptData.intro}\n\n${scriptData.selfIntro}\n\n${scriptData.chapters?.map((ch: any) => `${ch.title}\n${ch.content}`).join("\n\n")}\n\n${scriptData.outro}`;
                      navigator.clipboard.writeText(fullScript);
                      toast.success("대본이 복사되었습니다.");
                    }
                  }}
                >
                  <Copy size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto bg-gray-50 rounded-xl p-4 border border-gray-100 custom-scrollbar">
                {scriptData ? (
                  <div className="space-y-4 text-sm text-slate-700">
                    <div>
                      <div className="font-bold text-red-600 mb-2">🎬 인트로</div>
                      <p className="whitespace-pre-wrap">{scriptData.intro}</p>
                    </div>
                    <div>
                      <div className="font-bold text-orange-600 mb-2">🎤 자기소개</div>
                      <p className="whitespace-pre-wrap">{scriptData.selfIntro}</p>
                    </div>
                    {scriptData.chapters?.map((chapter: any, idx: number) => (
                      <div key={idx}>
                        <div className="font-bold text-blue-600 mb-2">{chapter.title}</div>
                        <p className="whitespace-pre-wrap">{chapter.content}</p>
                      </div>
                    ))}
                    <div>
                      <div className="font-bold text-green-600 mb-2">🎬 마무리</div>
                      <p className="whitespace-pre-wrap">{scriptData.outro}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 italic">대본이 생성되지 않았습니다.</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex-1">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Hash size={18} className="text-red-600" /> 메타데이터
              </h3>
              {metadataData ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">설명</div>
                    <div className="text-xs text-slate-600 bg-gray-50 p-2 rounded border border-gray-100 max-h-32 overflow-y-auto">
                      {metadataData.description}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">태그</div>
                    <div className="flex flex-wrap gap-1">
                      {metadataData.tags?.slice(0, 10).map((t: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-gray-100 text-slate-600 rounded text-[10px] border border-gray-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">해시태그</div>
                    <div className="flex flex-wrap gap-1">
                      {metadataData.hashtags?.map((h: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] border border-blue-200"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-400 italic text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  메타데이터가 생성되지 않았습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="flex-1 bg-gray-50 h-screen overflow-y-auto animate-fade-in p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">작업 기록</h1>
            <p className="text-slate-500">AI Assistant로 생성한 콘텐츠를 확인하고 관리하세요.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-64 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-red-600" size={40} />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-slate-400 mb-4">
              <FileText size={48} className="mx-auto mb-2" />
              <p>저장된 작업이 없습니다.</p>
            </div>
            <button
              onClick={() => router.push("/student/studentLounge/ai-assistant")}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              새 프로젝트 시작
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {session.thumbnailResponses ? (
                    <img
                      src={`data:image/jpeg;base64,${session.thumbnailResponses}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt=""
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase shadow-sm ${
                        getCompletionStatus(session) === "Completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {getCompletionStatus(session)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs font-bold text-red-600 mb-1">
                      {STEP_LABELS[session.step || "TITLE"] || session.step}
                    </div>
                    <button
                      onClick={(e) => handleDelete(session.id, e)}
                      className="text-slate-300 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                    {session.title || session.titleMessage || "제목 없음"}
                  </h3>

                  <div className="mt-auto pt-4 flex items-center gap-4 text-xs text-slate-400 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {new Date(session.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={12} /> {session.scriptResponses ? "대본 완료" : "대본 없음"}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* New Project Card */}
            <div
              onClick={() => router.push("/student/studentLounge/ai-assistant")}
              className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-8 gap-4 cursor-pointer hover:border-red-500 hover:bg-red-50/50 transition-all group min-h-[300px]"
            >
              <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-slate-400 group-hover:text-red-500">
                <FileText size={24} />
              </div>
              <div className="text-center">
                <div className="font-bold text-slate-700 group-hover:text-red-700">새 프로젝트</div>
                <div className="text-xs text-slate-400 mt-1">AI Assistant 시작하기</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
