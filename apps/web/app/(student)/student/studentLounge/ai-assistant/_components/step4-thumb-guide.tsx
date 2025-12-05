"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { LoadingSpinner } from "@repo/ui/components/loading-spinner";
import MarkdownRenderer from "./MarkdownRenderer";

interface Step4ThumbGuideProps {
  selectedGuide: number | null;
  onSelectGuide: (id: number) => void;
  onNext?: () => void;
  thumbnailGuideResponses?: any;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

export function Step4ThumbGuide({
  selectedGuide,
  onSelectGuide,
  onNext,
  thumbnailGuideResponses,
  onGenerate,
  isGenerating = false,
}: Step4ThumbGuideProps) {
  const guides = thumbnailGuideResponses?.thumbnailGuides || [];
  const [expandedGuides, setExpandedGuides] = useState<Set<number>>(new Set());

  if (guides.length === 0) {
    return (
      <div className="space-y-6">
        {onGenerate && (
          <div className="flex justify-center">
            {isGenerating ? (
              <LoadingSpinner loadingText="썸네일 가이드 생성 중..." />
            ) : (
              "썸네일 가이드 생성"
            )}
          </div>
        )}
      </div>
    );
  }

  const toggleGuide = (index: number) => {
    setExpandedGuides((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">썸네일 전략 선택</h2>
        <p className="text-gray-500">영상을 시각적으로 어떻게 구성할까요?</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {guides.map((guide: any, index: number) => {
          const isExpanded = expandedGuides.has(index);
          return (
            <div
              key={index}
              onClick={() => onSelectGuide(index)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:-translate-y-1 h-full flex flex-col ${
                selectedGuide === index
                  ? "border-red-600 bg-red-50 shadow-md"
                  : "border-gray-100 bg-white hover:shadow-lg"
              }`}
            >
              <div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 text-gray-600">
                  <ImageIcon />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  <MarkdownRenderer content={guide.guideTitle} />
                </h3>
                <div className="text-sm text-gray-600 leading-relaxed mb-2">
                  <MarkdownRenderer content={guide.guideSummary} />
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleGuide(index);
                  }}
                  className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <span>상세 확인하기</span>
                  {isExpanded ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-3 text-xs text-gray-500 leading-relaxed animate-in slide-in-from-top-2 duration-200">
                    <MarkdownRenderer content={guide.guideDescription} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {onNext && selectedGuide !== null && (
        <div className="flex justify-end mt-6">
          <button
            onClick={onNext}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            Next Step
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
