"use client";

import { useState, useEffect } from "react";

import {
  Copy,
  Hash,
  Tag,
  Clock,
  FileText,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { LoadingSpinner } from "@repo/ui/components/loading-spinner";
import { toast } from "sonner";
import type { Step } from "./types";

interface Step7MetadataProps {
  metadataResponses?: {
    description?: string;
    timestamps?: Array<{ time: string; title: string }>;
    hashtags?: string[];
    tags?: string[];
  };
  onGenerate?: () => void;
  onStepChange?: (step: Step) => void;
  isGenerating?: boolean;
  isLoading?: boolean;
}

export function Step7Metadata({
  metadataResponses,
  onGenerate,
  onStepChange,
  isGenerating = false,
  isLoading = false,
}: Step7MetadataProps) {
  const [completionProgress, setCompletionProgress] = useState(0);
  const [completionSeconds, setCompletionSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setCompletionProgress(0);
      setCompletionSeconds(0);
      const duration = 15000; // 15 seconds
      const startTime = Date.now();

      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setCompletionProgress(newProgress);
        setCompletionSeconds(Math.floor(elapsed / 1000));
      }, 100); // UI update interval
    } else {
      setCompletionProgress(0);
      setCompletionSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label}이 복사되었습니다.`);
  };

  if (!metadataResponses) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          {isGenerating ? (
            <>
              <LoadingSpinner loadingText="메타데이터 생성 중..." />
            </>
          ) : (
            <>
              <p className="text-gray-500 mb-4">메타데이터를 생성해주세요.</p>
              {onGenerate && (
                <Button
                  onClick={onGenerate}
                  disabled={isGenerating}
                  className="px-10 py-4 bg-[#33DB98] text-black rounded-xl font-bold text-lg hover:shadow-lg disabled:opacity-70 transition-all flex items-center gap-2 mx-auto hover:bg-[#33DB98]/90"
                >
                  메타데이터 생성
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Hash className="text-[#33DB98]" /> 메타데이터 최적화
      </h2>

      <div className="grid gap-6">
        {/* Description */}
        {metadataResponses.description && (
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-sm hover:border-[#33DB98]/50 transition-colors">
            <div className="flex justify-between mb-4 items-center">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                설명
              </span>
              <button
                onClick={() =>
                  handleCopy(metadataResponses.description || "", "Description")
                }
                className="text-gray-400 hover:text-[#33DB98] transition-colors"
              >
                <Copy size={18} />
              </button>
            </div>
            <textarea
              readOnly
              className="w-full bg-black/20 rounded-xl border border-white/10 p-4 text-sm h-32 text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#33DB98] resize-none"
              value={metadataResponses.description}
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Timestamps */}
          {metadataResponses.timestamps &&
            metadataResponses.timestamps.length > 0 && (
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-sm hover:border-[#33DB98]/50 transition-colors">
                <div className="flex justify-between mb-4 items-center">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                    타임스탬프
                  </span>
                  <button
                    onClick={() => {
                      const timestampsText = metadataResponses.timestamps
                        ?.map((ts) => `${ts.time} ${ts.title}`)
                        .join("\n");
                      handleCopy(timestampsText || "", "Timestamps");
                    }}
                    className="text-gray-400 hover:text-[#33DB98] transition-colors"
                  >
                    <Copy size={18} />
                  </button>
                </div>
                <div className="space-y-2 text-sm text-gray-400 font-mono bg-black/20 p-4 rounded-xl border border-white/10 h-48 overflow-y-auto">
                  {metadataResponses.timestamps.map((ts, i) => (
                    <div key={i} className="hover:text-white transition-colors">
                      {ts.time} {ts.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

          <div className="space-y-6">
            {/* Hashtags */}
            {metadataResponses.hashtags &&
              metadataResponses.hashtags.length > 0 && (
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-sm hover:border-[#33DB98]/50 transition-colors">
                  <div className="flex justify-between mb-4 items-center">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                      해시태그
                    </span>
                    <button
                      onClick={() => {
                        const hashtagsText =
                          metadataResponses.hashtags?.join(" ");
                        handleCopy(hashtagsText || "", "Hashtags");
                      }}
                      className="text-gray-400 hover:text-[#33DB98] transition-colors"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {metadataResponses.hashtags.map((h) => (
                      <span
                        key={h}
                        className="text-[#33DB98] bg-[#33DB98]/10 px-3 py-1.5 rounded-lg text-sm border border-[#33DB98]/20"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Tags */}
            {metadataResponses.tags && metadataResponses.tags.length > 0 && (
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-sm hover:border-[#33DB98]/50 transition-colors">
                <div className="flex justify-between mb-4 items-center">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                    태그
                  </span>
                  <button
                    onClick={() => {
                      const tagsText = metadataResponses.tags?.join(",");
                      handleCopy(tagsText || "", "Tags");
                    }}
                    className="text-gray-400 hover:text-[#33DB98] transition-colors"
                  >
                    <Copy size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {metadataResponses.tags.map((t, i) => (
                    <span
                      key={`${t}-${i}`}
                      className="text-gray-300 bg-white/10 px-3 py-1.5 rounded-lg text-xs border border-white/5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {onStepChange && metadataResponses && (
        <div className="flex justify-end mt-6">
          <button
            onClick={() => onStepChange(8)}
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
                        2 * Math.PI * 10 * (1 - completionProgress / 100)
                      }
                      strokeLinecap="round"
                      className="text-black transition-all duration-100 ease-linear"
                    />
                  </svg>
                </div>
                <span>최종 확인 중... ({completionSeconds}초)</span>
              </>
            ) : (
              <>
                최종 확인
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
