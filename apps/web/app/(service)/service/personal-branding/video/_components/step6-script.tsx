"use client";

import { useState, useEffect } from "react";

import { Check, FileText, Copy, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { LoadingSpinner } from "@repo/ui/components/loading-spinner";
import MarkdownRenderer from "./MarkdownRenderer";
import { toast } from "sonner";
import type { Step } from "./types";

interface ScriptChapter {
  title: string;
  content: string;
}

interface ScriptResponse {
  intro: string;
  selfIntro: string;
  chapters: ScriptChapter[];
  outro: string;
}

interface Step6ScriptProps {
  thumbnailUrl: string;
  selectedTitle: string;
  topic: string;
  scriptResponses?: ScriptResponse;
  onStepChange?: (step: Step) => void;
  isGenerating?: boolean;
  isLoading?: boolean;
}

export function Step6Script({
  thumbnailUrl,
  selectedTitle,
  topic,
  scriptResponses,
  onStepChange,
  isGenerating = false,
  isLoading = false,
}: Step6ScriptProps) {
  const [progress, setProgress] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setProgress(0);
      setSeconds(0);
      const duration = 15000; // 15 seconds
      const startTime = Date.now();

      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setProgress(newProgress);
        setSeconds(Math.floor(elapsed / 1000));
      }, 100); // UI update interval
    } else {
      setProgress(0);
      setSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  const [metaProgress, setMetaProgress] = useState(0);
  const [metaSeconds, setMetaSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setMetaProgress(0);
      setMetaSeconds(0);
      const duration = 15000; // 15 seconds
      const startTime = Date.now();

      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setMetaProgress(newProgress);
        setMetaSeconds(Math.floor(elapsed / 1000));
      }, 100); // UI update interval
    } else {
      setMetaProgress(0);
      setMetaSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const handleCopy = () => {
    if (scriptResponses) {
      const fullScript = `${scriptResponses.intro}\n\n${scriptResponses.selfIntro}\n\n${scriptResponses.chapters.map((ch) => `${ch.title}\n${ch.content}`).join("\n\n")}\n\n${scriptResponses.outro}`;
      navigator.clipboard.writeText(fullScript);
      toast.success("대본이 복사되었습니다.");
    }
  };

  if (!scriptResponses) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center">
              <div className="relative mb-4 w-12 h-12">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-white/10"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 10}
                    strokeDashoffset={2 * Math.PI * 10 * (1 - progress / 100)}
                    strokeLinecap="round"
                    className="text-[#33DB98] transition-all duration-100 ease-linear"
                  />
                </svg>
              </div>
              <span className="text-lg font-medium text-white">
                대본 생성 중... ({seconds}초)
              </span>
            </div>
          ) : (
            <>
              <p className="text-gray-400 mb-4">대본을 생성해주세요.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Final Info Card */}
        <div className="space-y-6">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">
              썸네일 이미지
            </h3>
            <img
              src={thumbnailUrl}
              alt="Final"
              className="w-full rounded-lg mb-2"
            />
            <p className="text-xs text-gray-400 text-center">(최종)</p>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">
              영상 정보
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-400 block">제목</span>
                <div className="font-medium text-sm text-white">
                  <MarkdownRenderer content={selectedTitle} />
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">주제</span>
                <p className="font-medium text-sm text-white">{topic}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Script Viewer */}
        <div className="md:col-span-2 bg-vzx-card rounded-xl border border-white/10 shadow-sm flex flex-col h-[600px]">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 rounded-t-xl">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-gray-400" />
              <span className="font-bold text-white">영상 대본</span>
            </div>
            <button
              onClick={handleCopy}
              className="text-gray-400 hover:text-white p-1"
            >
              <Copy size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 text-sm leading-loose text-white space-y-6 bg-black/20">
            {scriptResponses ? (
              <>
                {/* Intro */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-[#33DB98] flex items-center gap-2">
                    🎬 인트로 (30초)
                  </h3>
                  <div className="whitespace-pre-wrap">
                    <MarkdownRenderer content={scriptResponses.intro} />
                  </div>
                </div>

                {/* Self Intro */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-orange-600 flex items-center gap-2">
                    🎤 자기소개
                  </h3>
                  <div className="whitespace-pre-wrap">
                    <MarkdownRenderer content={scriptResponses.selfIntro} />
                  </div>
                </div>

                {/* Chapters */}
                {scriptResponses.chapters.map((chapter, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="text-lg font-bold text-blue-600">
                      {chapter.title}
                    </h3>
                    <div className="whitespace-pre-wrap">
                      <MarkdownRenderer content={chapter.content} />
                    </div>
                  </div>
                ))}

                {/* Outro */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-green-600 flex items-center gap-2">
                    🎬 마무리
                  </h3>
                  <div className="whitespace-pre-wrap">
                    <MarkdownRenderer content={scriptResponses.outro} />
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-400">대본이 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {onStepChange && scriptResponses && (
        <div className="flex justify-end mt-6">
          <button
            onClick={() => onStepChange(7)}
            disabled={isLoading}
            className="px-8 py-3 bg-[#33DB98] text-black rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:bg-[#33DB98]/90"
          >
            {isLoading ? (
              <>
                <div className="relative mr-2 w-6 h-6 flex items-center justify-center">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      className="text-black/10"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 10}
                      strokeDashoffset={
                        2 * Math.PI * 10 * (1 - metaProgress / 100)
                      }
                      strokeLinecap="round"
                      className="text-black transition-all duration-100 ease-linear"
                    />
                  </svg>
                </div>
                <span>영상 메타데이터 생성 중... ({metaSeconds}초)</span>
              </>
            ) : (
              <>
                영상 메타데이터 생성
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
