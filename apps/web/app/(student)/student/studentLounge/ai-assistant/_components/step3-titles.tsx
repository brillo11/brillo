"use client";

import { ChevronRight, RefreshCw, Check } from "lucide-react";
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
}

export function Step3Titles({
  topic,
  selectedTitle,
  onSelectTitle,
  onRefresh,
  onStepChange,
  titleResponses,
  selectedTitleIndex,
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
        <h2 className="text-2xl font-bold text-gray-900">
          Select a Winning Title
        </h2>
        <p className="text-gray-500">
          Based on topic:{" "}
          <span className="font-semibold text-gray-900">"{topic}"</span>
        </p>
      </div>

      <div className="space-y-3">
        {titles.map((set: any, idx: number) => {
          const isSelected = selectedTitleIndex === idx;
          return (
            <div
              key={idx}
              onClick={() => onSelectTitle(idx)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 group ${
                isSelected
                  ? "border-red-600 bg-red-50"
                  : "border-gray-100 bg-white hover:border-gray-300"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-gray-300 text-transparent"
                }`}
              >
                <Check size={16} strokeWidth={4} />
              </div>
              <div className="flex-1">
                <h4
                  className={`font-bold text-lg ${
                    isSelected ? "text-slate-900" : "text-slate-700"
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
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-slate-600"
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
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            Next Step
            <ChevronRight size={20} />
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
