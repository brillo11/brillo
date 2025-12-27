"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Send,
  Image,
  Upload,
  Edit3,
  Youtube,
  FileText,
  CheckCircle2,
  X,
} from "lucide-react";
import { Textarea } from "@repo/ui/components/textarea";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { toast } from "sonner";
import { getYouTubeTranscript } from "@/serverActions/youtube/youtube-transcript.actions";
import type { ChatMessage, Step } from "./types";

interface Step5ThumbGenProps {
  selectedTitle: string;
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
  referenceScript?: string;
  onReferenceScriptChange?: (script: string) => void;
}

export function Step5ThumbGen({
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
  referenceScript = "",
  onReferenceScriptChange,
}: Step5ThumbGenProps) {
  // thumbnailResponses는 이제 S3 URL 또는 base64 (마이그레이션 호환)
  const displayUrl = thumbnailUrls;

  const [progress, setProgress] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setProgress(0);
      setSeconds(0);
      const duration = 120000; // 120 seconds
      const startTime = Date.now();

      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setProgress(newProgress);
        setSeconds(Math.floor(elapsed / 1000));
      }, 100); // UI update interval
    } else {
      setProgress(0);
      setSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  const [scriptProgress, setScriptProgress] = useState(0);
  const [scriptSeconds, setScriptSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setScriptProgress(0);
      setScriptSeconds(0);
      const duration = 15000; // 15 seconds
      const startTime = Date.now();

      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setScriptProgress(newProgress);
        setScriptSeconds(Math.floor(elapsed / 1000));
      }, 100); // UI update interval
    } else {
      setScriptProgress(0);
      setScriptSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isFetchingScript, setIsFetchingScript] = useState(false);
  const [isScriptExpanded, setIsScriptExpanded] = useState(false);

  // Clear script handler
  const handleRemoveScript = () => {
    onReferenceScriptChange?.("");
    setYoutubeUrl(""); // Optional: keep URL or clear it? Clearing it makes sense if "cancelled".
    setIsScriptExpanded(false);
    toast.info("스타일 적용이 취소되었습니다.");
  };

  const handleFetchScript = async () => {
    if (!youtubeUrl.trim()) {
      toast.error("YouTube URL을 입력해주세요.");
      return;
    }

    setIsFetchingScript(true);
    try {
      const result = await getYouTubeTranscript(youtubeUrl);

      if (result.success && result.transcript) {
        // Combine transcript parts into a single text
        const fullScript = result.transcript
          .map((item: any) => item.text)
          .join(" ");
        onReferenceScriptChange?.(fullScript);
        toast.success("대본 스타일을 성공적으로 불러왔습니다.");
      } else {
        toast.error(
          "자막을 불러오는데 실패했습니다: " +
            (result.error || "알 수 없는 오류"),
        );
      }
    } catch (error) {
      console.error("Script fetch error:", error);
      toast.error("대본을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsFetchingScript(false);
    }
  };

  return (
    <div className="space-y-6">
      {!thumbnailUrls && isGenerating && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="animate-spin text-[#33DB98] mb-4" size={48} />
          <p className="font-medium text-gray-400">썸네일 생성 중...</p>
        </div>
      )}
      {thumbnailUrls && (
        <div className="h-[600px] flex flex-col md:flex-row gap-6">
          {/* Left: Image Preview */}
          <div className="flex-1 bg-black/20 rounded-2xl flex flex-col items-center justify-center p-6 border border-white/10 relative overflow-hidden">
            {isGenerating && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-[#33DB98]" size={48} />
                <p className="font-medium text-gray-400">이미지 수정 중...</p>
              </div>
            )}

            <div className="relative w-full max-w-lg shadow-2xl rounded-lg overflow-hidden group">
              <img
                src={displayUrl}
                alt="Generated Thumbnail"
                className="w-full aspect-video object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3 text-white text-center text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                미리보기
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Based on:{" "}
              <span className="font-medium text-gray-400">
                "{selectedTitle}"
              </span>
            </p>

            {/* New: Script Style Reference */}
            {onReferenceScriptChange && (
              <div className="w-full max-w-lg mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Youtube size={16} className="text-red-500" />
                    대본 스타일 참고 (선택사항)
                  </Label>
                </div>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="YouTube 영상 URL 입력"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="bg-black/40 border-white/10 text-xs h-9"
                  />
                  <Button
                    size="sm"
                    onClick={handleFetchScript}
                    disabled={isFetchingScript || !youtubeUrl}
                    className="bg-[#33DB98]/20 text-[#33DB98] hover:bg-[#33DB98]/30 border border-[#33DB98]/50 h-9 px-3"
                  >
                    {isFetchingScript ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "가져오기"
                    )}
                  </Button>
                </div>

                {referenceScript && (
                  <div className="bg-[#33DB98]/5 border border-[#33DB98]/20 rounded-lg p-3 relative transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-[#33DB98] text-xs font-bold">
                        <CheckCircle2 size={12} />
                        <span>스타일 적용됨</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsScriptExpanded(!isScriptExpanded)}
                          className="text-[10px] text-[#33DB98] hover:underline"
                        >
                          {isScriptExpanded ? "접기" : "전체 보기"}
                        </button>
                        <button
                          onClick={handleRemoveScript}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                          title="스타일 적용 취소"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    <p
                      className={`text-xs text-gray-400 italic ${isScriptExpanded ? "max-h-60 overflow-y-auto whitespace-pre-wrap" : "line-clamp-2"}`}
                    >
                      "{referenceScript}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Chat Interface & Edit */}
          <div className="w-full md:w-96 flex flex-col gap-4">
            {/* Thumbnail Edit */}
            {onThumbnailEditTextChange && onFixThumbnail && (
              <div className="flex-1 flex flex-col bg-vzx-card border border-white/10 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 bg-white/5 border-b border-white/5 flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg shadow-sm">
                    <Edit3 size={18} className="text-[#33DB98]" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">썸네일 수정</p>
                    <p className="text-xs text-gray-400">
                      원하는 변경사항을 입력하세요
                    </p>
                  </div>
                </div>
                <div className="p-4 space-y-4 flex flex-col flex-1">
                  <div className="space-y-2 flex flex-col flex-1">
                    {/* ... (Existing Edit Text Area) */}
                    <Label className="text-sm font-medium text-gray-400">
                      수정 요청사항
                    </Label>
                    <Textarea
                      value={thumbnailEditText}
                      onChange={(e) =>
                        onThumbnailEditTextChange(e.target.value)
                      }
                      className="resize-none min-h-[140px] bg-black/20 border border-white/10 text-white focus:border-[#33DB98] focus:ring-1 focus:ring-[#33DB98]/20 flex-1 placeholder:text-gray-600"
                      disabled={isGenerating || isLoading}
                      placeholder="예: 텍스트 크기를 키워주세요, 배경색을 더 밝게 해주세요..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-400">
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
                            ? "border-white/5 bg-white/5 cursor-not-allowed opacity-60"
                            : thumbnailFile
                              ? "border-[#33DB98] bg-[#33DB98]/10 hover:border-[#33DB98] cursor-pointer"
                              : "border-white/10 hover:border-[#33DB98] hover:bg-[#33DB98]/5 cursor-pointer bg-black/20"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            thumbnailFile ? "bg-[#33DB98]/20" : "bg-white/5"
                          }`}
                        >
                          {thumbnailFile ? (
                            <Image
                              size={20}
                              className={
                                isGenerating || isLoading
                                  ? "text-gray-500"
                                  : "text-[#33DB98]"
                              }
                            />
                          ) : (
                            <Upload
                              size={20}
                              className={
                                isGenerating || isLoading
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              }
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              isGenerating || isLoading
                                ? "text-gray-500"
                                : "text-white"
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
                    className="w-full bg-[#33DB98] hover:bg-[#33DB98]/90 text-black font-semibold shadow-sm"
                  >
                    {isGenerating ? (
                      <>
                        <div className="relative mr-2 w-4 h-4 flex items-center justify-center">
                          <svg
                            className="w-full h-full transform -rotate-90"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="transparent"
                              className="text-black/10"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="transparent"
                              strokeDasharray={2 * Math.PI * 10}
                              strokeDashoffset={
                                2 * Math.PI * 10 * (1 - progress / 100)
                              }
                              strokeLinecap="round"
                              className="text-black transition-all duration-100 ease-linear"
                            />
                          </svg>
                        </div>
                        <span>수정 중... ({seconds}초)</span>
                      </>
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
              className="w-full h-12 text-lg bg-[#33DB98] text-black rounded-xl font-bold hover:bg-[#33DB98]/90 transition-all border-none flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="relative mr-2 w-6 h-6 flex items-center justify-center">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        className="text-black/10"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 10}
                        strokeDashoffset={
                          2 * Math.PI * 10 * (1 - scriptProgress / 100)
                        }
                        strokeLinecap="round"
                        className="text-black transition-all duration-100 ease-linear"
                      />
                    </svg>
                  </div>
                  <span>대본 생성 중... ({scriptSeconds}초)</span>
                </>
              ) : (
                <>
                  <span>대본 생성</span>
                  <Send size={20} />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
