"use client";

import { Image as ImageIcon, ChevronRight } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Choose Thumbnail Strategy
        </h2>
        <p className="text-gray-500">
          How should we package this video visually?
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {guides.map((guide: any, index: number) => (
          <div
            key={index}
            onClick={() => onSelectGuide(index)}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:-translate-y-1 h-full flex flex-col ${
              selectedGuide === index
                ? "border-red-600 bg-red-50 shadow-md"
                : "border-gray-100 bg-white hover:shadow-lg"
            }`}
          >
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 text-gray-600">
              <ImageIcon />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">
              <MarkdownRenderer content={guide.guideTitle} />
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed mb-2">
              <MarkdownRenderer content={guide.guideSummary} />
            </div>
            <div className="text-xs text-gray-500 leading-relaxed">
              <MarkdownRenderer content={guide.guideDescription} />
            </div>
          </div>
        ))}
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
