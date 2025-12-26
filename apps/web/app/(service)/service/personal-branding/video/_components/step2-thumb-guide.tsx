"use client";

import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { toast } from "sonner";
import MarkdownRenderer from "./MarkdownRenderer";
import type { Step, ThumbnailReference } from "./types";
import { analyzeYouTubeChannel } from "@/serverActions/youtube/youtube-channel-analysis.actions";
import { isShortsVideo } from "@/serverActions/youtube/youtube-common";

interface Step2ThumbGuideProps {
  onGenerate: () => void;
  isGenerating: boolean;
  thumbnailGuideResponses?: any;
  selectedGuideIndex: number | null;
  onSelectGuide: (index: number) => void;
  onStepChange: (step: Step) => void;
  isNextLoading: boolean;
  onReferenceThumbnailsChange?: (thumbnails: ThumbnailReference[]) => void;
}

const MAX_THUMBNAILS = 8;

export function Step2ThumbGuide({
  onGenerate,
  isGenerating,
  thumbnailGuideResponses,
  selectedGuideIndex,
  onSelectGuide,
  onStepChange,
  isNextLoading,
  onReferenceThumbnailsChange,
}: Step2ThumbGuideProps) {
  const guides = thumbnailGuideResponses?.thumbnailGuides || [];
  const [expandedGuides, setExpandedGuides] = useState<Set<number>>(new Set());

  // YouTube Fetch State
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState("");
  const [isChannelLoading, setIsChannelLoading] = useState(false);
  const [youtubeThumbnails, setYoutubeThumbnails] = useState<
    ThumbnailReference[]
  >([]);
  const [selectedReferenceThumbnails, setSelectedReferenceThumbnails] =
    useState<ThumbnailReference[]>([]);

  // Notify parent when selected thumbnails change
  useEffect(() => {
    onReferenceThumbnailsChange?.(selectedReferenceThumbnails);
  }, [selectedReferenceThumbnails, onReferenceThumbnailsChange]);

  const [imageProgress, setImageProgress] = useState(0);
  const [imageSeconds, setImageSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isNextLoading) {
      setImageProgress(0);
      setImageSeconds(0);
      const duration = 120000; // 120 seconds
      const startTime = Date.now();

      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setImageProgress(newProgress);
        setImageSeconds(Math.floor(elapsed / 1000));
      }, 100); // UI update interval
    } else {
      setImageProgress(0);
      setImageSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isNextLoading]);

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

  const fetchYoutubeThumbnails = async () => {
    if (!youtubeChannelUrl.trim()) {
      toast.error("YouTube 채널 URL을 입력해주세요.");
      return;
    }

    setIsChannelLoading(true);
    try {
      // URL에서 채널 ID 또는 username 추출
      let channelIdOrUsername = youtubeChannelUrl.trim();

      // URL 형식인 경우 채널 ID/username 추출
      if (channelIdOrUsername.includes("youtube.com")) {
        // @username 형식
        const handleMatch = channelIdOrUsername.match(/@[\w-]+/);
        if (handleMatch) {
          channelIdOrUsername = handleMatch[0];
        } else {
          // 채널 ID 형식
          const channelIdMatch = channelIdOrUsername.match(/channel\/([^/?]+)/);
          if (channelIdMatch && channelIdMatch[1]) {
            channelIdOrUsername = channelIdMatch[1];
          } else {
            toast.error("올바른 YouTube 채널 URL을 입력해주세요.");
            setIsChannelLoading(false);
            return;
          }
        }
      }

      const result = await analyzeYouTubeChannel(channelIdOrUsername);

      if (!result.success) {
        toast.error(result.error || "채널 정보를 가져오는데 실패했습니다.");
        return;
      }

      if (result.videos && result.videos.length > 0) {
        // 쇼츠 영상 제외하고 일반 영상만 필터링
        const regularVideos = result.videos.filter(
          (video: any) =>
            !isShortsVideo(video.duration || "", video.title || ""),
        );

        const allThumbnails: ThumbnailReference[] = regularVideos
          .map((video: any) => {
            const thumbnailUrl = video.thumbnail || video.thumbnailUrl || "";
            if (!thumbnailUrl) return null;
            return {
              id: video.videoId || video.id || Math.random().toString(),
              url: thumbnailUrl,
              title: video.title,
            };
          })
          .filter(
            (thumb: ThumbnailReference | null) => thumb !== null,
          ) as ThumbnailReference[];

        // 최대 개수만큼만 가져오기
        const thumbnails = allThumbnails.slice(0, MAX_THUMBNAILS);
        setYoutubeThumbnails(thumbnails);
        toast.success(`${thumbnails.length}개의 썸네일을 가져왔습니다.`);
      } else {
        setYoutubeThumbnails([]);
        toast.info("가져올 썸네일이 없습니다.");
      }
    } catch (error) {
      console.error("Failed to fetch YouTube thumbnails:", error);
      toast.error("썸네일을 가져오는데 실패했습니다.");
    } finally {
      setIsChannelLoading(false);
    }
  };

  // If no guides yet, show generation state (or empty state)
  // But unlike Step4, this component might be mounted differently.
  // In ai-assistant-client, it checks `!guides.length` for empty state too?
  // Let's preserve the "Generate" button view if no guides.

  if (guides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">썸네일 가이드 생성</h2>
          <p className="text-gray-400">
            선택한 주제와 제목에 어울리는 최적의 썸네일 시각화 가이드를
            제안해드립니다.
          </p>
        </div>

        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="h-12 text-lg bg-[#33DB98] text-black hover:bg-[#33DB98]/90 font-bold border-none px-8"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              가이드 구상 중...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              썸네일 가이드 생성하기
            </>
          )}
        </Button>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-sm text-gray-400 max-w-md">
          <p className="mb-2 font-bold text-gray-300">💡 Tip</p>
          <p>
            AI가 영상의 주제와 분위기를 분석하여 클릭률을 높일 수 있는 3가지
            시각적 컨셉을 제안합니다.
            <br className="my-2" />
            마음에 드는 가이드를 선택하면 다음 단계에서 실제 썸네일 이미지를
            생성합니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">썸네일 전략 선택</h2>
        <p className="text-gray-400">영상을 시각적으로 어떻게 구성할까요?</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {guides.map((guide: any, index: number) => {
          const isExpanded = expandedGuides.has(index);
          const isSelected = selectedGuideIndex === index;
          return (
            <div
              key={index}
              onClick={() => !isNextLoading && onSelectGuide(index)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:-translate-y-1 h-full flex flex-col ${
                isSelected
                  ? "border-[#33DB98] bg-[#33DB98]/10 shadow-[0_0_20px_rgba(51,219,152,0.1)]"
                  : "border-white/10 bg-[#1E1E1E] hover:border-[#33DB98]/50 hover:shadow-lg"
              } ${
                isNextLoading
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : ""
              }`}
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    isSelected
                      ? "bg-[#33DB98]/20 text-[#33DB98]"
                      : "bg-white/5 text-gray-400"
                  }`}
                >
                  <ImageIcon />
                </div>
                <h3
                  className={`font-bold text-lg mb-2 ${isSelected ? "text-white" : "text-gray-200"}`}
                >
                  <MarkdownRenderer content={guide.guideTitle} />
                </h3>
                <div className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-3">
                  <MarkdownRenderer content={guide.guideSummary} />
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white/10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleGuide(index);
                  }}
                  className="w-full flex items-center justify-between text-sm text-gray-400 hover:text-white transition-colors"
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

      {/* YouTube 채널 참고 (선택사항) */}
      <div className="mt-8">
        <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-white/10 space-y-6 flex flex-col">
          <div>
            <div className="flex items-center gap-2 text-[#33DB98] font-bold text-lg mb-2">
              <PlayCircle className="fill-current" /> 채널 참고 (선택사항)
            </div>
            <p className="text-sm text-gray-400">
              원하는 경우, 유튜브 채널 URL을 입력하여 해당 채널의 썸네일
              스타일을 분석하고 참고할 수 있습니다.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="https://youtube.com/@channel"
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#33DB98]/50 focus:border-[#33DB98] outline-none transition-all text-white placeholder:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              value={youtubeChannelUrl}
              onChange={(e) => setYoutubeChannelUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isChannelLoading && !isNextLoading) {
                  fetchYoutubeThumbnails();
                }
              }}
              disabled={isChannelLoading || isNextLoading}
            />
            <Button
              onClick={fetchYoutubeThumbnails}
              disabled={isChannelLoading || isNextLoading}
              className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-auto"
            >
              {isChannelLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "불러오기"
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 min-h-[200px]">
            {youtubeThumbnails.length > 0 ? (
              youtubeThumbnails.map((thumb) => {
                const isSelected = selectedReferenceThumbnails.some(
                  (t) => t.id === thumb.id,
                );
                return (
                  <div
                    key={thumb.id}
                    onClick={() => {
                      if (isNextLoading) return;
                      setSelectedReferenceThumbnails((prev) => {
                        const newSelection = isSelected
                          ? prev.filter((t) => t.id !== thumb.id)
                          : [...prev, thumb];
                        return newSelection;
                      });
                    }}
                    className={`relative group aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                      isNextLoading
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    } ${
                      isSelected
                        ? "border-[#33DB98] ring-2 ring-[#33DB98]/30"
                        : "border-transparent hover:border-white/30"
                    }`}
                  >
                    <img
                      src={thumb.url}
                      alt={thumb.title || "Thumbnail"}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute inset-0 bg-black/60 transition-opacity flex items-center justify-center ${
                        isSelected
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <span className="text-black text-xs font-bold bg-[#33DB98] px-2 py-1 rounded">
                        {isSelected ? "✓ 선택됨" : "클릭하여 선택"}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center text-gray-500 h-full border-2 border-dashed border-white/10 rounded-xl p-8 bg-white/5">
                <ImageIcon size={32} className="mb-2 opacity-30" />
                <span className="text-sm">
                  불러온 채널 썸네일 이미지가 없습니다
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {onStepChange && selectedGuideIndex !== null && (
        <div className="flex justify-end mt-8">
          <Button
            onClick={() => onStepChange(5)} // Parameter doesn't technically matter if handleThumbGuideNext ignores it, but type says Step
            disabled={isNextLoading}
            className="px-8 py-6 text-lg bg-[#33DB98] text-black hover:bg-[#33DB98]/90 font-bold rounded-xl flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(51,219,152,0.3)] hover:shadow-[0_0_30px_rgba(51,219,152,0.5)] transition-all"
          >
            {isNextLoading ? (
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
                        2 * Math.PI * 10 * (1 - imageProgress / 100)
                      }
                      strokeLinecap="round"
                      className="text-black transition-all duration-100 ease-linear"
                    />
                  </svg>
                </div>
                <span>썸네일 이미지 생성 중... ({imageSeconds}초)</span>
              </>
            ) : (
              <>
                썸네일 이미지 생성
                <ChevronRight size={20} />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
