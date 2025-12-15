"use client";

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
                  className="px-10 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold text-lg hover:shadow-lg disabled:opacity-70 transition-all flex items-center gap-2 mx-auto"
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
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <Hash className="text-orange-600" /> Metadata Optimization
      </h2>

      <div className="grid gap-6">
        {/* Description */}
        {metadataResponses.description && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
            <div className="flex justify-between mb-4 items-center">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Description
              </span>
              <button
                onClick={() =>
                  handleCopy(metadataResponses.description || "", "Description")
                }
                className="text-slate-400 hover:text-orange-600 transition-colors"
              >
                <Copy size={18} />
              </button>
            </div>
            <textarea
              readOnly
              className="w-full bg-gray-50 rounded-xl border border-gray-200 p-4 text-sm h-32 text-slate-800 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
              value={metadataResponses.description}
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Timestamps */}
          {metadataResponses.timestamps &&
            metadataResponses.timestamps.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
                <div className="flex justify-between mb-4 items-center">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    Timestamps
                  </span>
                  <button
                    onClick={() => {
                      const timestampsText = metadataResponses.timestamps
                        ?.map((ts) => `${ts.time} ${ts.title}`)
                        .join("\n");
                      handleCopy(timestampsText || "", "Timestamps");
                    }}
                    className="text-slate-400 hover:text-orange-600 transition-colors"
                  >
                    <Copy size={18} />
                  </button>
                </div>
                <div className="space-y-2 text-sm text-slate-600 font-mono bg-gray-50 p-4 rounded-xl border border-gray-200 h-48 overflow-y-auto">
                  {metadataResponses.timestamps.map((ts, i) => (
                    <div
                      key={i}
                      className="hover:text-slate-900 transition-colors"
                    >
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
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex justify-between mb-4 items-center">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      Hashtags
                    </span>
                    <button
                      onClick={() => {
                        const hashtagsText =
                          metadataResponses.hashtags?.join(" ");
                        handleCopy(hashtagsText || "", "Hashtags");
                      }}
                      className="text-slate-400 hover:text-orange-600 transition-colors"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {metadataResponses.hashtags.map((h) => (
                      <span
                        key={h}
                        className="text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg text-sm border border-orange-100"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Tags */}
            {metadataResponses.tags && metadataResponses.tags.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
                <div className="flex justify-between mb-4 items-center">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    Tags
                  </span>
                  <button
                    onClick={() => {
                      const tagsText = metadataResponses.tags?.join(",");
                      handleCopy(tagsText || "", "Tags");
                    }}
                    className="text-slate-400 hover:text-orange-600 transition-colors"
                  >
                    <Copy size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {metadataResponses.tags.map((t) => (
                    <span
                      key={t}
                      className="text-slate-600 bg-gray-100 px-3 py-1.5 rounded-lg text-xs border border-gray-200"
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
