"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PlayCircle, Zap, BarChart, Eye } from "lucide-react";
import { PopularVideoModal } from "./PopularVideoModal";
import type { PrecomputedVideo } from "@/serverActions/youtube/youtube-precomputed.actions";
import type { VideoForModal } from "@/shared/types/video";
import { getCategoryName } from "@/shared/lib/utils/youtubeCategory";

interface RecommendedVideoCardProps {
  video: PrecomputedVideo;
}

// PrecomputedVideo를 VideoForModal 형태로 변환
function convertToVideoForModal(video: PrecomputedVideo): VideoForModal {
  return {
    id: video.id,
    title: video.title,
    description: video.description || "",
    channelTitle: video.channelTitle,
    publishedAt: video.publishedAt
      ? video.publishedAt.toISOString()
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
    outlierView: null, // PrecomputedVideo에는 없으므로 null
  };
}

export function RecommendedVideoCard({ video }: RecommendedVideoCardProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              width={400}
              height={225}
              className="w-full h-44 object-cover"
            />
          ) : (
            <div className="w-full h-44 bg-gray-200 flex items-center justify-center">
              <PlayCircle size={48} className="text-gray-400" />
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-2 right-2 flex gap-1">
            <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded">
              {video.regionCode || "KR"}
            </span>
            {video.categoryId && (
              <span className="bg-blue-600/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded">
                {getCategoryName(video.categoryId.toString())}
              </span>
            )}
          </div>

          {/* Outlier Badge on Thumbnail */}
          {video.outlierVph && video.outlierVph > 1.0 && (
            <div
              className={`absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold shadow-sm ${
                video.outlierVph > 2.0
                  ? "bg-red-600 text-white"
                  : "bg-orange-500 text-white"
              }`}
            >
              <Zap size={10} fill="currentColor" />
              <span>{video.outlierVph.toFixed(1)}x</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="mb-3">
            <h3
              className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug mb-1"
              title={video.title}
            >
              {video.title}
            </h3>
            <p className="text-xs text-gray-500">{video.channelTitle}</p>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-50">
            <div className="bg-gray-50 p-2 rounded-lg flex flex-col justify-center">
              <span className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">
                VPH
              </span>
              <div className="flex items-center gap-1.5 text-red-600 font-bold text-sm">
                <BarChart size={14} />
                {video.viewsPerHour
                  ? Math.round(video.viewsPerHour).toLocaleString()
                  : "-"}
              </div>
            </div>
            <div
              className={`p-2 rounded-lg flex flex-col justify-center ${
                video.outlierVph && video.outlierVph > 2.0
                  ? "bg-red-50"
                  : video.outlierVph && video.outlierVph > 1.0
                    ? "bg-orange-50"
                    : "bg-gray-50"
              }`}
            >
              <span className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">
                아웃라이어
              </span>
              <div
                className={`flex items-center gap-1.5 font-bold text-sm ${
                  video.outlierVph && video.outlierVph > 2.0
                    ? "text-red-700"
                    : video.outlierVph && video.outlierVph > 1.0
                      ? "text-orange-600"
                      : "text-gray-600"
                }`}
              >
                <Zap
                  size={14}
                  fill={
                    video.outlierVph && video.outlierVph > 1.0
                      ? "currentColor"
                      : "none"
                  }
                />
                {video.outlierVph ? video.outlierVph.toFixed(1) : "-"}x
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1 text-xs text-gray-400 justify-end">
            <Eye size={12} />
            <span>총: {video.viewCount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <PopularVideoModal
        video={videoForModal}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStartLearning={handleStartLearning}
      />
    </>
  );
}
