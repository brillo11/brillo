"use client";

import { Check, FileText, Copy } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { LoadingSpinner } from "@repo/ui/components/loading-spinner";
import MarkdownRenderer from "./MarkdownRenderer";
import { toast } from "sonner";

interface Step6ScriptProps {
  thumbnailUrl: string;
  selectedTitle: string;
  topic: string;
  scriptResponses?: string;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

export function Step6Script({
  thumbnailUrl,
  selectedTitle,
  topic,
  scriptResponses,
  onGenerate,
  isGenerating = false,
}: Step6ScriptProps) {
  const handleCopy = () => {
    if (scriptResponses) {
      navigator.clipboard.writeText(scriptResponses);
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
              <p className="text-gray-500 mt-4">잠시만 기다려주세요...</p>
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
      <div className="bg-green-50 border border-green-100 rounded-xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <Check size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Mission Complete!
            </h2>
            <p className="text-green-700">Your content package is ready.</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 shadow-sm hover:bg-gray-50">
          Download Assets
        </button>
      </div>

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
          <div className="flex-1 overflow-y-auto p-6 text-sm leading-loose text-gray-700">
            {scriptResponses ? (
              <MarkdownRenderer content={scriptResponses} />
            ) : (
              <p className="text-gray-400">대본이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
