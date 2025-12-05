"use client";

import { Copy, Hash, Tag, Clock, FileText, ChevronRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { LoadingSpinner } from "@repo/ui/components/loading-spinner";
import { toast } from "sonner";

interface Step7MetadataProps {
  metadataResponses?: {
    description?: string;
    timestamps?: Array<{ time: string; title: string }>;
    hashtags?: string[];
    tags?: string[];
  };
  onGenerate?: () => void;
  onNext?: () => void;
  isGenerating?: boolean;
}

export function Step7Metadata({
  metadataResponses,
  onGenerate,
  onNext,
  isGenerating = false,
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">메타데이터</h2>
        <p className="text-gray-500">
          유튜브 업로드에 필요한 메타데이터입니다.
        </p>
      </div>

      <div className="space-y-4">
        {/* 설명 */}
        {metadataResponses.description && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-gray-500" />
                <h3 className="font-bold text-gray-900">설명</h3>
              </div>
              <button
                onClick={() =>
                  handleCopy(metadataResponses.description || "", "설명")
                }
                className="text-gray-500 hover:text-gray-900 p-1"
              >
                <Copy size={18} />
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {metadataResponses.description}
              </pre>
            </div>
          </div>
        )}

        {/* 타임스탬프 */}
        {metadataResponses.timestamps &&
          metadataResponses.timestamps.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-gray-500" />
                  <h3 className="font-bold text-gray-900">타임스탬프</h3>
                </div>
                <button
                  onClick={() => {
                    const timestampsText = metadataResponses.timestamps
                      ?.map((ts) => `${ts.time} ${ts.title}`)
                      .join("\n");
                    handleCopy(timestampsText || "", "타임스탬프");
                  }}
                  className="text-gray-500 hover:text-gray-900 p-1"
                >
                  <Copy size={18} />
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {metadataResponses.timestamps
                    .map((ts) => `${ts.time} ${ts.title}`)
                    .join("\n")}
                </pre>
              </div>
            </div>
          )}

        {/* 해시태그 */}
        {metadataResponses.hashtags &&
          metadataResponses.hashtags.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Hash size={18} className="text-gray-500" />
                  <h3 className="font-bold text-gray-900">해시태그</h3>
                </div>
                <button
                  onClick={() => {
                    const hashtagsText = metadataResponses.hashtags?.join(" ");
                    handleCopy(hashtagsText || "", "해시태그");
                  }}
                  className="text-gray-500 hover:text-gray-900 p-1"
                >
                  <Copy size={18} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {metadataResponses.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* 태그 */}
        {metadataResponses.tags && metadataResponses.tags.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-gray-500" />
                <h3 className="font-bold text-gray-900">태그</h3>
              </div>
              <button
                onClick={() => {
                  const tagsText = metadataResponses.tags?.join(", ");
                  handleCopy(tagsText || "", "태그");
                }}
                className="text-gray-500 hover:text-gray-900 p-1"
              >
                <Copy size={18} />
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {metadataResponses.tags.join(", ")}
              </pre>
            </div>
          </div>
        )}
      </div>

      {onNext && metadataResponses && (
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
