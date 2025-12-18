"use client";

import Image from "next/image";
import {
  PlayCircle,
  Zap,
  BarChart,
  Eye,
  Users,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { PopularVideoModal } from "@/features/video/PopularVideoModal";
import type { PrecomputedVideo } from "@/serverActions/youtube/youtube-precomputed.actions";
import type { VideoForModal } from "@/shared/types/video";
import { getCategoryName } from "@/shared/lib/utils/youtubeCategory";
import { formatCount } from "@/shared/lib/utils/numberFormat";
import { calculateVideoScore } from "@/shared/lib/utils/video-score";

interface SmartSearchVideoRowProps {
  video: PrecomputedVideo;
  index: number;
  onRowClick: (video: PrecomputedVideo) => void;
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
    outlierView: video.outlierView,
    outlierSubscriber: video.outlierSubscriber,
  };
}

export function SmartSearchVideoRow({
  video,
  index,
  onRowClick,
}: SmartSearchVideoRowProps) {
  // 영상 점수 계산
  const scoreResult = calculateVideoScore(
    video.outlierView,
    video.commentCount
  );

  // outlier 표시 형식
  const formatOutlier = (value: number | null) => {
    if (!value) return "-";
    return `${value.toFixed(1)}x`;
  };

  const handleRowClick = () => {
    onRowClick(video);
  };

  const handleYouTubeLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.youtube.com/watch?v=${video.id}`, "_blank");
  };

  return (
    <tr
      className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group"
      onClick={handleRowClick}
    >
      {/* 순번 */}
      <td className="px-4 py-3 text-center text-sm text-gray-500 font-medium">
        {index + 1}
      </td>

      {/* 썸네일 */}
      <td className="px-4 py-3">
        <div className="relative w-24 h-14 rounded overflow-hidden bg-gray-100 flex-shrink-0">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              width={96}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayCircle size={20} className="text-gray-400" />
            </div>
          )}
        </div>
      </td>

      {/* 제목 및 채널 */}
      <td className="px-4 py-3 min-w-[300px]">
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <h3
              className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1 group-hover:text-orange-600 transition-colors"
              title={video.title}
            >
              {video.title}
            </h3>
            <button
              onClick={handleYouTubeLink}
              className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
              title="YouTube에서 보기"
            >
              <ExternalLink size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs text-gray-600">{video.channelTitle}</p>
            {video.channelSubscriberCount && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Users size={12} />
                <span>{formatCount(video.channelSubscriberCount)}</span>
              </div>
            )}
            {video.categoryId && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded">
                {getCategoryName(video.categoryId.toString())}
              </span>
            )}
            {video.regionCode && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-medium rounded">
                {video.regionCode}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* 점수 */}
      <td className="px-4 py-3 text-center">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${scoreResult.bgColor} ${scoreResult.color}`}
        >
          {scoreResult.label}
        </span>
      </td>

      {/* VPH */}
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1 text-sm font-semibold text-red-600">
          <BarChart size={14} />
          <span>
            {video.viewsPerHour
              ? Math.round(video.viewsPerHour).toLocaleString()
              : "-"}
          </span>
        </div>
      </td>

      {/* Outlier */}
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1 text-sm font-semibold text-orange-600">
          <Zap size={14} fill="currentColor" />
          <span>{formatOutlier(video.outlierView)}</span>
        </div>
      </td>

      {/* 댓글 */}
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1 text-sm font-semibold text-blue-600">
          <MessageCircle size={14} />
          <span>
            {video.commentCount ? formatCount(video.commentCount) : "-"}
          </span>
        </div>
      </td>

      {/* 구독자 수 */}
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
          {video.channelSubscriberCount ? (
            <>
              <Users size={14} />
              <span>{formatCount(video.channelSubscriberCount)}</span>
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      </td>

      {/* 조회수 */}
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
          <Eye size={14} />
          <span>{formatCount(video.viewCount)}</span>
        </div>
      </td>
    </tr>
  );
}

// 모달을 별도로 관리하기 위한 컴포넌트
export function SmartSearchVideoModal({
  video,
  isOpen,
  onClose,
  onStartLearning,
}: {
  video: PrecomputedVideo | null;
  isOpen: boolean;
  onClose: () => void;
  onStartLearning: () => void;
}) {
  if (!video) return null;

  const videoForModal = convertToVideoForModal(video);

  return (
    <PopularVideoModal
      video={videoForModal}
      isOpen={isOpen}
      onClose={onClose}
      onStartLearning={onStartLearning}
      outlierType="outlierView"
    />
  );
}
