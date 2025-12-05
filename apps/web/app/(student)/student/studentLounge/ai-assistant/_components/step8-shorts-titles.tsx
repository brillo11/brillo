"use client";

import { Copy, Video } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { LoadingSpinner } from "@repo/ui/components/loading-spinner";
import { toast } from "sonner";

interface Step8ShortsTitlesProps {
  shortsTitlesResponses?: {
    shortsTitles?: Array<{
      chapterTitle: string;
      titles: string[];
    }>;
  };
  onGenerate?: () => void;
  isGenerating?: boolean;
}

export function Step8ShortsTitles({
  shortsTitlesResponses,
  onGenerate,
  isGenerating = false,
}: Step8ShortsTitlesProps) {
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label}이 복사되었습니다.`);
  };

  if (!shortsTitlesResponses?.shortsTitles) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          {isGenerating ? (
            <>
              <LoadingSpinner loadingText="쇼츠 제목 생성 중..." />
            </>
          ) : (
            <>
              <p className="text-gray-500 mb-4">쇼츠 제목을 생성해주세요.</p>
              {onGenerate && (
                <Button
                  onClick={onGenerate}
                  disabled={isGenerating}
                  className="px-10 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold text-lg hover:shadow-lg disabled:opacity-70 transition-all flex items-center gap-2 mx-auto"
                >
                  쇼츠 제목 생성
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
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">쇼츠 제목</h2>
        <p className="text-gray-500">각 챕터별로 생성된 쇼츠용 제목입니다.</p>
      </div>

      <div className="space-y-4">
        {shortsTitlesResponses.shortsTitles.map((chapter, chapterIndex) => (
          <div
            key={chapterIndex}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Video size={18} className="text-gray-500" />
                <h3 className="font-bold text-gray-900">
                  {chapter.chapterTitle}
                </h3>
              </div>
              <button
                onClick={() => {
                  const allTitles = chapter.titles.join("\n");
                  handleCopy(allTitles, `${chapter.chapterTitle} 쇼츠 제목`);
                }}
                className="text-gray-500 hover:text-gray-900 p-1"
              >
                <Copy size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {chapter.titles.map((title, titleIndex) => (
                <div
                  key={titleIndex}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer group"
                  onClick={() => handleCopy(title, "쇼츠 제목")}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 flex-1">
                      {title}
                    </p>
                    <Copy
                      size={16}
                      className="text-gray-400 group-hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
