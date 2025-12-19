"use client";

import { ChevronRight, RefreshCw, Check, Loader2 } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import type { Step } from "./types";

interface Step3TitlesProps {
  topic: string;
  selectedTitle: string;
  onSelectTitle: (index: number) => void;
  onRefresh: () => void;
  onStepChange?: (step: Step) => void;
  titleResponses?: any;
  selectedTitleIndex?: number | null;
  isLoading?: boolean;
}

export function Step3Titles({
  topic,
  selectedTitle,
  onSelectTitle,
  onRefresh,
  onStepChange,
  titleResponses,
  selectedTitleIndex,
  isLoading = false,
}: Step3TitlesProps) {
  const titles = titleResponses?.sets || [];

  if (titles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">제목을 생성 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          Select a Winning Title
        </h2>
        <p className="text-gray-400">
          Based on topic:{" "}
          <span className="font-semibold text-white">"{topic}"</span>
        </p>
      </div>

      <div className="space-y-3">
        {titles.map((set: any, idx: number) => {
          const isSelected = selectedTitleIndex === idx;
          return (
            <div
              key={idx}
              onClick={() => !isLoading && onSelectTitle(idx)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 group ${
                isSelected
                  ? "border-[#33DB98] bg-[#33DB98]/10"
                  : "border-white/10 bg-white/5 hover:border-[#33DB98]/50"
              } ${
                isLoading ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected
                    ? "border-[#33DB98] bg-[#33DB98] text-black"
                    : "border-white/20 text-transparent"
                }`}
              >
                <Check size={16} strokeWidth={4} />
              </div>
              <div className="flex-1">
                <h4
                  className={`font-bold text-lg ${
                    isSelected ? "text-white" : "text-gray-300"
                  }`}
                >
                  <MarkdownRenderer content={set.videoTitle} />
                </h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    썸네일 텍스트
                  </span>
                  <span
                    className={`text-sm font-medium px-2 py-0.5 rounded ${
                      isSelected
                        ? "bg-[#33DB98]/20 text-[#33DB98]"
                        : "bg-white/10 text-gray-400"
                    }`}
                  >
                    "{set.thumbnailTitle || set.thumbnailText}"
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-end gap-4 mt-6">
        {onStepChange && selectedTitleIndex !== null && (
          <button
            onClick={() => onStepChange(4)}
            disabled={isLoading}
            className="px-8 py-3 bg-[#33DB98] text-black rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
        )}
        {/* <button
          onClick={onRefresh}
          className="text-sm font-medium text-gray-500 flex items-center gap-2 hover:text-red-600"
        >
          <RefreshCw size={16} /> Generate More Titles
        </button> */}
      </div>
    </div>
  );
}
