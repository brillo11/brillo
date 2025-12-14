"use client";

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
  onGenerate?: () => void;
  onStepChange?: (step: Step) => void;
  isGenerating?: boolean;
  isLoading?: boolean;
}

export function Step6Script({
  thumbnailUrl,
  selectedTitle,
  topic,
  scriptResponses,
  onGenerate,
  onStepChange,
  isGenerating = false,
  isLoading = false,
}: Step6ScriptProps) {
  const handleCopy = () => {
    if (scriptResponses) {
      const fullScript = `${scriptResponses.intro}\n\n${scriptResponses.selfIntro}\n\n${scriptResponses.chapters.map(ch => `${ch.title}\n${ch.content}`).join('\n\n')}\n\n${scriptResponses.outro}`;
      navigator.clipboard.writeText(fullScript);
      toast.success("대본이 복사되었습니다.");
    }
  };

  if (!scriptResponses) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          {isGenerating ? (
            <>
              <LoadingSpinner loadingText="대본 생성 중..." />
            </>
          ) : (
            <>
              <p className="text-gray-500 mb-4">대본을 생성해주세요.</p>
              {onGenerate && (
                <Button
                  onClick={onGenerate}
                  disabled={isGenerating}
                  className="px-10 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold text-lg hover:shadow-lg disabled:opacity-70 transition-all flex items-center gap-2 mx-auto"
                >
                  대본 생성
                </Button>
              )}
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
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">
              Final Thumbnail
            </h3>
            <img
              src={thumbnailUrl}
              alt="Final"
              className="w-full rounded-lg mb-2"
            />
            <p className="text-xs text-gray-400 text-center">
              Version 3 (Final)
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">
              Metadata
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-400 block">Title</span>
                <p className="font-medium text-sm">{selectedTitle}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Topic</span>
                <p className="font-medium text-sm">{topic}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Script Viewer */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-xl">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-gray-500" />
              <span className="font-bold text-gray-700">Video Script</span>
            </div>
            <button
              onClick={handleCopy}
              className="text-gray-500 hover:text-gray-900 p-1"
            >
              <Copy size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 text-sm leading-loose text-gray-700 space-y-6">
            {scriptResponses ? (
              <>
                {/* Intro */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                    🎬 인트로 (30초)
                  </h3>
                  <p className="whitespace-pre-wrap">{scriptResponses.intro}</p>
                </div>

                {/* Self Intro */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-orange-600 flex items-center gap-2">
                    🎤 자기소개
                  </h3>
                  <p className="whitespace-pre-wrap">{scriptResponses.selfIntro}</p>
                </div>

                {/* Chapters */}
                {scriptResponses.chapters.map((chapter, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="text-lg font-bold text-blue-600">
                      {chapter.title}
                    </h3>
                    <p className="whitespace-pre-wrap">{chapter.content}</p>
                  </div>
                ))}

                {/* Outro */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-green-600 flex items-center gap-2">
                    🎬 마무리
                  </h3>
                  <p className="whitespace-pre-wrap">{scriptResponses.outro}</p>
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
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Loading...
              </>
            ) : (
              <>
                Next Step
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
