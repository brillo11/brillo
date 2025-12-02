"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PlayCircle, Zap, BarChart, Film } from "lucide-react";
import { PopularVideoModal } from "../../dashboard/_components/PopularVideoModal";
import type { PrecomputedVideo } from "@/serverActions/youtube/youtube-precomputed.actions";
import type { PopularVideo } from "@/serverActions/youtube/youtube-popular.actions";

interface ShortsVideoCardProps {
  video: PrecomputedVideo;
}

// PrecomputedVideo를 PopularVideo 형태로 변환
function convertToPopularVideo(video: PrecomputedVideo): PopularVideo {
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
    viewsPerHour: video.viewsPerHour,
    outlierVph: video.outlierVph,
    outlierView: null, // PrecomputedVideo에는 없으므로 null
  };
}

export function ShortsVideoCard({ video }: ShortsVideoCardProps) {
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

  const popularVideo = convertToPopularVideo(video);

  return (
    <>
      <div
        className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-900 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
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
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <PlayCircle size={48} className="text-gray-400" />
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90"></div>

        {/* Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <PlayCircle className="text-white drop-shadow-lg" size={48} />
        </div>

        {/* Badges - Top */}
        <div className="absolute top-2 right-2 left-2 flex justify-between items-start z-10">
          {video.outlierVph && video.outlierVph > 1.0 && (
            <div
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm backdrop-blur-sm ${
                video.outlierVph > 2.0
                  ? "bg-red-600/90 text-white"
                  : "bg-orange-500/90 text-white"
              }`}
            >
              <Zap size={10} fill="currentColor" />
              <span>{video.outlierVph.toFixed(1)}x</span>
            </div>
          )}
          <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/10">
            {video.regionCode || "KR"}
          </span>
        </div>

        {/* Info - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug mb-1 drop-shadow-md">
            {video.title}
          </h3>
          <p className="text-xs text-gray-300 mb-2">{video.channelTitle}</p>
          <div className="flex items-center gap-3 text-[10px] font-medium text-gray-200">
            <div className="flex items-center gap-1 text-red-400">
              <BarChart size={12} />
              {video.viewsPerHour
                ? `${Math.round(video.viewsPerHour).toLocaleString()}/h`
                : "-"}
            </div>
            <span>{video.viewCount.toLocaleString()} 조회수</span>
          </div>
        </div>
      </div>

      <PopularVideoModal
        video={popularVideo}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStartLearning={handleStartLearning}
      />
    </>
  );
}
