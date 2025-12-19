"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PlayCircle, Zap, BarChart, Eye, Users, Play } from "lucide-react";
import { PopularVideoModal } from "./PopularVideoModal";
import type {
  PrecomputedVideo,
  OutlierType,
} from "@/serverActions/youtube/youtube-precomputed.actions";
import type { VideoForModal } from "@/shared/types/video";
import { getCategoryName } from "@/shared/lib/utils/youtubeCategory";
import { formatCount } from "@/shared/lib/utils/numberFormat";

interface RecommendedVideoCardProps {
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

export function RecommendedVideoCard({
  video,
  outlierType = "outlierView",
}: RecommendedVideoCardProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 선택된 outlier 값 가져오기
  const outlierValue = video[outlierType] as number | null;

  // outlier 레이블
  const outlierLabel = "아웃라이어";

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
        className="group bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden hover:border-[#33DB98]/30 hover:shadow-lg hover:shadow-[#33DB98]/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
        onClick={handleCardClick}
      >
        <div className="relative aspect-video overflow-hidden">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              width={400}
              height={225}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <PlayCircle size={48} className="text-gray-600" />
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#33DB98] flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
              <Play size={24} className="text-black fill-black ml-1" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10">
              {video.regionCode || "KR"}
            </span>
            {video.categoryId && (
              <span className="bg-[#33DB98]/90 text-black text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                {getCategoryName(video.categoryId.toString())}
              </span>
            )}
          </div>

          {/* Duration Badge */}
          {video.duration && (
            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs font-bold px-1.5 py-0.5 rounded-md border border-white/10">
              {video.duration.replace("PT", "").replace("M", ":").replace("S", "")}
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="mb-4 flex-1">
            <h3
              className="font-bold text-white text-base line-clamp-2 leading-snug mb-2 group-hover:text-[#33DB98] transition-colors"
              title={video.title}
            >
              {video.title}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-400 font-medium truncate">
                {video.channelTitle}
              </p>
              {video.channelSubscriberCount && (
                <>
                  <span className="w-0.5 h-0.5 bg-gray-600 rounded-full"></span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Users size={11} />
                    <span>{formatCount(video.channelSubscriberCount)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
            <div className="bg-white/5 p-2.5 rounded-lg flex flex-col justify-center border border-white/5">
              <span className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                VPH (시간당)
              </span>
              <div className="flex items-center gap-1.5 text-[#FF4D4D] font-bold text-sm">
                <BarChart size={14} />
                {video.viewsPerHour
                  ? Math.round(video.viewsPerHour).toLocaleString()
                  : "-"}
              </div>
            </div>
            <div
              className={`p-2.5 rounded-lg flex flex-col justify-center border ${
                outlierValue && outlierValue > thresholds.high
                  ? "bg-[#33DB98]/10 border-[#33DB98]/20"
                  : outlierValue && outlierValue > thresholds.medium
                    ? "bg-orange-500/10 border-orange-500/20"
                    : "bg-white/5 border-white/5"
              }`}
            >
              <span className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                {outlierLabel}
              </span>
              <div
                className={`flex items-center gap-1.5 font-bold text-sm ${
                  outlierValue && outlierValue > thresholds.high
                    ? "text-[#33DB98]"
                    : outlierValue && outlierValue > thresholds.medium
                      ? "text-orange-500"
                      : "text-gray-400"
                }`}
              >
                <Zap
                  size={14}
                  fill={
                    outlierValue && outlierValue > thresholds.medium
                      ? "currentColor"
                      : "none"
                  }
                />
                {formatOutlier(outlierValue)}
              </div>
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
