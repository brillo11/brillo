"use client";

import React from "react";
import {
  FileText,
  Image as ImageIcon,
  Hash,
  Download,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import type { AIAssistantSessionData } from "@/serverActions/ai-assistant/ai-assistant-session.actions";
import { VideoGenerator } from "./video-generator";

interface AssistantHistoryDetailProps {
  session: AIAssistantSessionData;
}

export function AssistantHistoryDetail({ session }: AssistantHistoryDetailProps) {
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

  const scriptData = safeParse(session.scriptResponses);
  const metadataData = safeParse(session.metadataResponses);
  const titleData = safeParse(session.titleResponses);
    
  const selectedTitleSet =
    titleData?.sets?.[session.selectedTitleIndex ?? 0];

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 pb-20">
      {/* Overview Card */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#1c1c1c] rounded-2xl p-6 border border-white/5 shadow-xl shadow-black/20 space-y-4">
          <h3 className="font-bold text-gray-200 flex items-center gap-2">
            <FileText size={18} className="text-[#33DB98]" /> 선택된 제목
          </h3>
          {selectedTitleSet ? (
            <div className="p-4 bg-black/40 rounded-xl border border-white/5">
              <div className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">
                영상 제목
              </div>
              <div className="text-lg font-bold text-white mb-4">
                {selectedTitleSet.videoTitle}
              </div>

              <div className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">
                썸네일 텍스트
              </div>
              <div className="text-base font-medium text-[#33DB98]">
                "{selectedTitleSet.thumbnailTitle}"
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              제목이 선택되지 않았습니다.
            </div>
          )}
        </div>

        {/* Thumbnail Preview */}
        <div className="bg-[#1c1c1c] rounded-2xl p-6 border border-white/5 shadow-xl shadow-black/20 space-y-4">
          <h3 className="font-bold text-gray-200 flex items-center gap-2">
            <ImageIcon size={18} className="text-[#33DB98]" /> 썸네일
          </h3>
          <div className="aspect-video bg-black/40 rounded-lg overflow-hidden relative border border-white/10 group">
            {session.thumbnailUrls ? (
              <>
                <img
                  src={session.thumbnailUrls}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  alt="Thumbnail"
                />
                <a
                  href={session.thumbnailUrls}
                  download="thumbnail.jpg"
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium gap-2 backdrop-blur-sm"
                >
                  <Download size={20} /> Download
                </a>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-700">
                <ImageIcon size={32} />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Script & Metadata */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#1c1c1c] rounded-2xl p-6 border border-white/5 shadow-xl shadow-black/20 flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-200 flex items-center gap-2">
              <FileText size={18} className="text-[#33DB98]" /> 대본
            </h3>
            <button
              className="text-gray-500 hover:text-[#33DB98] transition-colors p-1 hover:bg-white/5 rounded"
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
          <div className="flex-1 overflow-y-auto bg-black/40 rounded-xl p-4 border border-white/5 custom-scrollbar">
            {scriptData ? (
              <div className="space-y-4 text-sm text-gray-300">
                <div>
                  <div className="font-bold text-[#33DB98] mb-2">
                    🎬 인트로
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{scriptData.intro}</p>
                </div>
                <div>
                  <div className="font-bold text-orange-400 mb-2">
                    🎤 자기소개
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {scriptData.selfIntro}
                  </p>
                </div>
                {scriptData.chapters?.map((chapter: any, idx: number) => (
                  <div key={idx}>
                    <div className="font-bold text-blue-400 mb-2">
                      {chapter.title}
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">{chapter.content}</p>
                  </div>
                ))}
                <div>
                  <div className="font-bold text-green-400 mb-2">
                    🎬 마무리
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{scriptData.outro}</p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600 italic flex h-full items-center justify-center">
                대본이 생성되지 않았습니다.
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#1c1c1c] rounded-2xl p-6 border border-white/5 shadow-xl shadow-black/20 flex-1">
          <h3 className="font-bold text-gray-200 flex items-center gap-2 mb-4">
            <Hash size={18} className="text-[#33DB98]" /> 메타데이터
          </h3>
          {metadataData ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase mb-1">
                  설명
                </div>
                <div className="text-xs text-gray-300 bg-black/40 p-3 rounded border border-white/5 max-h-32 overflow-y-auto leading-relaxed">
                  {metadataData.description}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase mb-1">
                  태그
                </div>
                <div className="flex flex-wrap gap-1">
                  {metadataData.tags
                    ?.slice(0, 10)
                    .map((t: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-white/5 text-gray-300 rounded text-[10px] border border-white/10"
                      >
                        {t}
                      </span>
                    ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase mb-1">
                  해시태그
                </div>
                <div className="flex flex-wrap gap-1">
                  {metadataData.hashtags?.map((h: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-[#33DB98]/10 text-[#33DB98] rounded text-[10px] border border-[#33DB98]/20"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600 italic text-center py-6 bg-black/20 rounded-xl border border-dashed border-white/5">
              메타데이터가 생성되지 않았습니다.
            </div>
          )}
        </div>
      </div>
      {/* Video Generator Section */}
      <VideoGenerator
        sessionId={session.id}
        useMock={false} // 실제 API 사용 전까지 Mock 모드 활성화
      />
    </div>
  );
}
