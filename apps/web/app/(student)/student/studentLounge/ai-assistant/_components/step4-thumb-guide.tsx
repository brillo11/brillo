"use client";

import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Loader2,
} from "lucide-react";
import { LoadingSpinner } from "@repo/ui/components/loading-spinner";
import MarkdownRenderer from "./MarkdownRenderer";
import type { Step } from "./types";
import { analyzeYouTubeChannel } from "@/serverActions/youtube/youtube-channel-analysis.actions";
import { toast } from "sonner";

interface Step4ThumbGuideProps {
  selectedGuide: number | null;
  onSelectGuide: (id: number) => void;
  onStepChange?: (step: Step) => void;
  thumbnailGuideResponses?: any;
  onGenerate?: () => void;
  isGenerating?: boolean;
  isLoading?: boolean;
  onReferenceThumbnailsChange?: (thumbnails: ThumbnailReference[]) => void;
}

interface ThumbnailReference {
  id: string;
  url: string;
  title?: string;
}

const MAX_THUMBNAILS = 8;

/**
 * ISO 8601 duration 형식을 초로 변환 (예: "PT1M30S" -> 90)
 */
function parseDurationToSeconds(isoDuration: string | undefined): number {
  if (!isoDuration || !isoDuration.startsWith("PT")) return 0;

  const hoursMatch = isoDuration.match(/(\d+)H/);
  const minutesMatch = isoDuration.match(/(\d+)M/);
  const secondsMatch = isoDuration.match(/(\d+)S/);

  const hours = hoursMatch && hoursMatch[1] ? parseInt(hoursMatch[1], 10) : 0;
  const minutes =
    minutesMatch && minutesMatch[1] ? parseInt(minutesMatch[1], 10) : 0;
  const seconds =
    secondsMatch && secondsMatch[1] ? parseInt(secondsMatch[1], 10) : 0;

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * 영상이 쇼츠인지 확인
 * 1. duration이 60초 이하인 경우
 * 2. 제목에 "#shorts" 또는 "#Shorts"가 포함된 경우
 */
function isShortsVideo(
  duration: string | undefined,
  title: string | undefined
): boolean {
  if (!duration || !title) return false;

  // 제목에 #shorts 포함 여부 확인
  const hasShortsTag = /#shorts/i.test(title);

  // duration이 60초 이하인지 확인
  const durationSeconds = parseDurationToSeconds(duration);
  const isShortDuration = durationSeconds > 0 && durationSeconds <= 60;

  return hasShortsTag || isShortDuration;
}

export function Step4ThumbGuide({
  selectedGuide,
  onSelectGuide,
  onStepChange,
  thumbnailGuideResponses,
  onGenerate,
  isGenerating = false,
  isLoading = false,
  onReferenceThumbnailsChange,
}: Step4ThumbGuideProps) {
  const guides = thumbnailGuideResponses?.thumbnailGuides || [];
  const [expandedGuides, setExpandedGuides] = useState<Set<number>>(new Set());
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
      console.log(channelIdOrUsername);

      const result = await analyzeYouTubeChannel(channelIdOrUsername);

      if (!result.success) {
        toast.error(result.error || "채널 정보를 가져오는데 실패했습니다.");
        return;
      }

      if (result.videos && result.videos.length > 0) {
        // 쇼츠 영상 제외하고 일반 영상만 필터링
        const regularVideos = result.videos.filter(
          (video: any) => !isShortsVideo(video.duration, video.title)
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
            (thumb: ThumbnailReference | null) => thumb !== null
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
              onClick={() => !isLoading && onSelectGuide(index)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:-translate-y-1 h-full flex flex-col ${
                selectedGuide === index
                  ? "border-red-600 bg-red-50 shadow-md"
                  : "border-gray-100 bg-white hover:shadow-lg"
              } ${
                isLoading ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
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

      {/* YouTube 채널 참고 (선택사항) */}
      <div className="mt-8">
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-6 flex flex-col h-full overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 text-red-600 font-bold text-lg mb-2">
              <PlayCircle className="fill-current" /> 채널 참고 (선택사항)
            </div>
            <p className="text-sm text-slate-500">
              원하는 경우, 유튜브 채널 URL을 입력하여 해당 채널의 썸네일 스타일을 분석하고 참고할 수 있습니다.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="https://youtube.com/@channel"
              className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              value={youtubeChannelUrl}
              onChange={(e) => setYoutubeChannelUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isChannelLoading && !isLoading) {
                  fetchYoutubeThumbnails();
                }
              }}
              disabled={isChannelLoading || isLoading}
            />
            <button
              onClick={fetchYoutubeThumbnails}
              disabled={isChannelLoading || isLoading}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChannelLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Fetch"
              )}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-2 flex-1 overflow-y-auto content-start min-h-[200px]">
            {youtubeThumbnails.length > 0 ? (
              youtubeThumbnails.map((thumb) => {
                const isSelected = selectedReferenceThumbnails.some(
                  (t) => t.id === thumb.id
                );
                return (
                  <div
                    key={thumb.id}
                    onClick={() => {
                      if (isLoading) return;
                      setSelectedReferenceThumbnails((prev) => {
                        const newSelection = isSelected
                          ? prev.filter((t) => t.id !== thumb.id)
                          : [...prev, thumb];
                        return newSelection;
                      });
                    }}
                    className={`relative group aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                      isLoading
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    } ${
                      isSelected
                        ? "border-red-500 ring-2 ring-red-500/30"
                        : "border-transparent hover:border-gray-300"
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
                      <span className="text-white text-xs font-bold bg-red-600 px-2 py-1 rounded">
                        {isSelected ? "✓ 선택됨" : "클릭하여 선택"}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center text-slate-400 h-full border-2 border-dashed border-gray-300 rounded-xl p-8 bg-white/50">
                <ImageIcon size={32} className="mb-2 opacity-50" />
                <span className="text-sm">No channel fetched yet</span>
              </div>
            )}
          </div>
        </div>
      </div>
          {onStepChange && selectedGuide !== null && (
        <div className="flex justify-end mt-6">
          <button
            onClick={() => onStepChange(5)}
            disabled={isLoading}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Loading...
              </>
            ) : (
              <>
                Next Step
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
