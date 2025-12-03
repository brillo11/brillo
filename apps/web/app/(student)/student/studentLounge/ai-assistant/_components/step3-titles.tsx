"use client";

import { ChevronRight, RefreshCw } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

interface Step3TitlesProps {
  topic: string;
  selectedTitle: string;
  onSelectTitle: (index: number) => void;
  onRefresh: () => void;
  onNext?: () => void;
  titleResponses?: any;
  selectedTitleIndex?: number | null;
}

export function Step3Titles({
  topic,
  selectedTitle,
  onSelectTitle,
  onRefresh,
  onNext,
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
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  isSelected
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {idx + 1}
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">썸네일 제목:</span>{" "}
                  <MarkdownRenderer content={set.thumbnailTitle} />
                </div>
                <div className="text-lg font-medium text-gray-800">
                  <span className="font-medium">영상 제목:</span>{" "}
                  <MarkdownRenderer content={set.videoTitle} />
                </div>
              </div>
              <ChevronRight
                className={`text-gray-300 group-hover:text-gray-600 shrink-0 ${isSelected ? "text-red-600" : ""}`}
              />
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-end gap-4 mt-6">
        {onNext && selectedTitleIndex !== null && (
          <button
            onClick={onNext}
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
