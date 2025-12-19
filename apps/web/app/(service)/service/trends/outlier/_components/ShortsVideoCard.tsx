"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PlayCircle, Zap, BarChart, Film, Users, Play } from "lucide-react";
import { PopularVideoModal } from "@/features/video/PopularVideoModal";
import type {
  PrecomputedVideo,
  OutlierType,
} from "@/serverActions/youtube/youtube-library.actions";
import type { VideoForModal } from "@/shared/types/video";
import { getCategoryName } from "@/shared/lib/utils/youtubeCategory";
import { formatCount } from "@/shared/lib/utils/numberFormat";

interface ShortsVideoCardProps {
  video: PrecomputedVideo;
  outlierType?: OutlierType;
}

// PrecomputedVideo를 VideoForModal 형태로 변환
function convertToVideoForModal(video: PrecomputedVideo): VideoForModal {
  return {
    id: video.id,
    title: video.title,
    description: video.description || "",
    channelTitle: video.channelTitle,
    channelSubscriberCount: video.channelSubscriberCount,
    publishedAt: video.publishedAt
      ? typeof video.publishedAt === "string"
        ? video.publishedAt
        : video.publishedAt.toISOString()
      : new Date().toISOString(),
    thumbnailUrl: video.thumbnailUrl,
    viewCount: video.viewCount,
    likeCount: video.likeCount,
    commentCount: video.commentCount,
    duration: video.duration || "",
    channelId: video.channelId || null,
    categoryId: video.categoryId,
    viewsPerHour: video.viewsPerHour,
    outlierVph: video.outlierVph,
    outlierView: video.outlierView,
    outlierSubscriber: video.outlierSubscriber,
  };
}

export function ShortsVideoCard({
  video,
  outlierType = "outlierView",
}: ShortsVideoCardProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 선택된 outlier 값 가져오기
  const outlierValue = video[outlierType] as number | null;

  // outlier 표시 형식
  const formatOutlier = (value: number | null) => {
    if (!value) return "-";
    return `${value.toFixed(1)}x`;
  };

  // outlier 임계값 (색상 결정)
  const getThresholds = () => {
    return { high: 2.0, medium: 1.0 };
  };

  const thresholds = getThresholds();

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleStartLearning = () => {
    router.push(`/student/products/${video.id}`);
    handleCloseModal();
  };

  const videoForModal = convertToVideoForModal(video);

  return (
    <>
      <div
        className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-[#1A1A1A] cursor-pointer border border-white/5 shadow-lg hover:border-[#33DB98]/30 hover:shadow-[#33DB98]/10 hover:-translate-y-1 transition-all duration-300"
        onClick={handleCardClick}
      >
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <Film size={48} className="text-gray-700" />
          </div>
        )}

        {/* Overlay Gradients */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent"></div>
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-[#0A0A0A]/60 to-transparent"></div>


        {/* Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black/20">
             <div className="w-12 h-12 rounded-full bg-[#33DB98] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
              <Play size={24} className="text-black fill-black ml-1" />
            </div>
        </div>

        {/* Badges - Top */}
        <div className="absolute top-2 right-2 left-2 flex justify-between items-start z-10">
          {outlierValue && outlierValue > thresholds.medium && (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm backdrop-blur-md ${
                outlierValue > thresholds.high
                  ? "bg-[#33DB98] text-black"
                  : "bg-orange-500 text-white"
              }`}
            >
              <Zap size={10} fill="currentColor" />
              <span>{formatOutlier(outlierValue)}</span>
            </div>
          )}
          <div className="flex gap-1 ml-auto">
             {video.categoryId && (
              <span className="bg-black/40 backdrop-blur-md text-white/90 text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10">
                {getCategoryName(video.categoryId.toString())}
              </span>
            )}
            <span className="bg-black/60 backdrop-blur-md text-white/70 text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10">
              {video.regionCode || "KR"}
            </span>
          </div>
        </div>

        {/* Info - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug mb-2 drop-shadow-sm group-hover:text-[#33DB98] transition-colors">
            {video.title}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs text-gray-300 font-medium truncate">{video.channelTitle}</p>
             {video.channelSubscriberCount && (
              <>
              <span className="w-0.5 h-0.5 bg-gray-500 rounded-full"></span>
              <div className="flex items-center gap-0.5 text-xs text-gray-400">
                <Users size={11} />
                <span>{formatCount(video.channelSubscriberCount)}</span>
              </div>
              </>
            )}
          </div>
          <div className="flex items-center justify-between text-[10px] font-medium text-gray-400 border-t border-white/10 pt-2">
            <div className="flex items-center gap-1 text-[#FF4D4D] font-bold">
              <BarChart size={12} />
              {video.viewsPerHour
                ? `${Math.round(video.viewsPerHour).toLocaleString()}/h`
                : "-"}
            </div>
             <div className="flex items-center gap-1">
              <span>{formatCount(video.viewCount)} Views</span>
             </div>
          </div>
        </div>
      </div>

      <PopularVideoModal
        video={videoForModal}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStartLearning={handleStartLearning}
        outlierType={outlierType}
      />
    </>
  );
}
