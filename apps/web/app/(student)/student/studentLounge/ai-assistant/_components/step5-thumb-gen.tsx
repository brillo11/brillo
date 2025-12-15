"use client";

import { Loader2, Send, Image, Upload, Edit3 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Textarea } from "@repo/ui/components/textarea";
import { Label } from "@repo/ui/components/label";
import { LoadingSpinner } from "@repo/ui/components/loading-spinner";
import type { CreatorPersona, ChatMessage, Step } from "./types";
import { renderIcon } from "./utils";

interface Step5ThumbGenProps {
  selectedPersona: CreatorPersona | null;
  selectedTitle: string;
  thumbnailUrl: string;
  chatMessages: ChatMessage[];
  chatInput: string;
  isGenerating: boolean;
  onChatInputChange: (input: string) => void;
  onChatSubmit: () => void;
  onStepChange: (step: Step) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  thumbnailUrls?: string;
  thumbnailEditText?: string;
  onThumbnailEditTextChange?: (text: string) => void;
  thumbnailFile?: File | null;
  onThumbnailFileChange?: (file: File | null) => void;
  onThumbnailGenerate?: () => void;
  onFixThumbnail?: () => void;
  isLoading?: boolean;
}

export function Step5ThumbGen({
  selectedPersona,
  selectedTitle,
  thumbnailUrls,
  chatMessages,
  chatInput,
  isGenerating,
  onChatInputChange,
  onChatSubmit,
  onStepChange,
  chatEndRef,
  thumbnailEditText = "",
  onThumbnailEditTextChange,
  thumbnailFile,
  onThumbnailFileChange,
  onThumbnailGenerate,
  onFixThumbnail,
  isLoading = false,
}: Step5ThumbGenProps) {
  // thumbnailResponses는 이제 S3 URL 또는 base64 (마이그레이션 호환)
  const displayUrl = thumbnailUrls;

  return (
    <div className="space-y-6">
      {!thumbnailUrls && isGenerating && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
          <p className="font-medium text-gray-600">썸네일 생성 중...</p>
        </div>
      )}
      {thumbnailUrls && (
        <div className="h-[600px] flex flex-col md:flex-row gap-6">
          {/* Left: Image Preview */}
          <div className="flex-1 bg-black/5 rounded-2xl flex flex-col items-center justify-center p-6 border border-gray-200 relative overflow-hidden">
            {isGenerating && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-red-600" size={48} />
                <p className="font-medium text-gray-600">
                  Refining thumbnail...
                </p>
              </div>
            )}

            <div className="relative w-full max-w-lg shadow-2xl rounded-lg overflow-hidden group">
              <img
                src={displayUrl}
                alt="Generated Thumbnail"
                className="w-full aspect-video object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3 text-white text-center text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Preview Mode
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Based on: <span className="font-medium">"{selectedTitle}"</span>
            </p>
          </div>

          {/* Right: Chat Interface & Edit */}
          <div className="w-full md:w-96 flex flex-col gap-4">
            {/* Thumbnail Edit */}
            {onThumbnailEditTextChange && onFixThumbnail && (
              <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Edit3 size={18} className="text-gray-700" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">
                      썸네일 수정
                    </p>
                    <p className="text-xs text-gray-500">
                      원하는 변경사항을 입력하세요
                    </p>
                  </div>
                </div>
                <div className="p-4 space-y-4 flex flex-col flex-1">
                  <div className="space-y-2 flex flex-col flex-1">
                    <Label className="text-sm font-medium text-gray-700">
                      수정 요청사항
                    </Label>
                    <Textarea
                      value={thumbnailEditText}
                      onChange={(e) =>
                        onThumbnailEditTextChange(e.target.value)
                      }
                      className="resize-none min-h-[180px] border border-gray-200 focus:border-red-400 focus:ring-1 focus:ring-red-400/20 flex-1"
                      disabled={isGenerating || isLoading}
                      placeholder="예: 텍스트 크기를 키워주세요, 배경색을 더 밝게 해주세요..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      참고 이미지
                    </Label>
                    <label className="relative block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          onThumbnailFileChange?.(e.target.files?.[0] || null)
                        }
                        disabled={isGenerating || isLoading}
                        className="hidden"
                      />
                      <div
                        className={`flex items-center gap-3 p-3 border-2 border-dashed rounded-lg transition-all ${
                          isGenerating || isLoading
                            ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                            : thumbnailFile
                              ? "border-red-300 bg-red-50/50 hover:border-red-400 hover:bg-red-50 cursor-pointer"
                              : "border-gray-300 hover:border-red-400 hover:bg-red-50/50 cursor-pointer"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            thumbnailFile ? "bg-red-100" : "bg-gray-100"
                          }`}
                        >
                          {thumbnailFile ? (
                            <Image
                              size={20}
                              className={
                                isGenerating || isLoading
                                  ? "text-gray-400"
                                  : "text-red-600"
                              }
                            />
                          ) : (
                            <Upload
                              size={20}
                              className={
                                isGenerating || isLoading
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              isGenerating || isLoading
                                ? "text-gray-400"
                                : "text-gray-700"
                            }`}
                          >
                            {thumbnailFile
                              ? thumbnailFile.name
                              : "이미지 파일 선택"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {thumbnailFile
                              ? "다른 파일을 선택하려면 클릭하세요"
                              : "PNG, JPG, GIF 최대 10MB"}
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <Button
                    onClick={onFixThumbnail}
                    disabled={
                      isGenerating || isLoading || !thumbnailEditText.trim()
                    }
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold shadow-sm"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <Edit3 size={16} />
                        썸네일 수정 중...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Edit3 size={16} />
                        수정하기
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <Button
              onClick={() => onStepChange(6)}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-base hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Generating Script...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Generate Script</span>
                  <Send size={18} />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
