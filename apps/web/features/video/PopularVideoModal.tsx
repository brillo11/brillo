"use client";

import { kdayjs } from "@/shared/lib/utils/dayjs";
import { getCategoryName } from "@/shared/lib/utils/youtubeCategory";
import { formatCount } from "@/shared/lib/utils/numberFormat";
import {
  X,
  Calendar,
  BarChart,
  Zap,
  Play,
  ExternalLink,
  Users,
} from "lucide-react";
import type { VideoForModal } from "@/shared/types/video";
import type { OutlierType } from "@/serverActions/youtube/youtube-precomputed.actions";

interface PopularVideoModalProps {
  video: VideoForModal | null;
  isOpen: boolean;
  onClose: () => void;
  onStartLearning: () => void;
  outlierType?: OutlierType;
}

export function PopularVideoModal({
  video,
  isOpen,
  onClose,
  onStartLearning,
  outlierType = "outlierView",
}: PopularVideoModalProps) {
  if (!video || !isOpen) {
    return null;
  }

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-[#111111] rounded-2xl border border-white/10 shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header/Image */}
        <div className="relative aspect-video w-full bg-black">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover opacity-75"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              썸네일 없음
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors border border-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Floating Header Info */}
        <div className="relative px-8 -mt-20 mb-6 z-10"> 
             <div className="flex items-center gap-2 mb-3">
              <span className="inline-block px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-lg border border-white/10">
                KR
              </span>
              {video.categoryId && (
                <span className="inline-block px-2.5 py-1 bg-[#33DB98] text-black rounded-lg text-xs font-bold shadow-lg shadow-[#33DB98]/20">
                  {getCategoryName(video.categoryId.toString())}
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-3 text-white drop-shadow-lg">
              {video.title}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span className="font-bold text-white flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs overflow-hidden">
                    {video.channelTitle.charAt(0)}
                 </div>
                 {video.channelTitle}
              </span>
              {video.channelSubscriberCount && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                  <span className="flex items-center gap-1.5">
                    <Users size={14} className="text-gray-400" />
                    {formatCount(video.channelSubscriberCount)}
                  </span>
                </>
              )}
              <span className="w-1 h-1 rounded-full bg-gray-500"></span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" />{" "}
                {video.publishedAt
                  ? kdayjs(video.publishedAt).format("YYYY년 M월 D일")
                  : ""}
              </span>
            </div>
        </div>

        {/* Modal Body */}
        <div className="px-8 pb-8">
          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-colors">
              <span className="text-xs text-gray-400 uppercase font-bold mb-1.5 flex items-center gap-1">
                 <Play size={10} fill="currentColor"/> 총 조회수
              </span>
              <span className="text-xl font-bold text-white group-hover:text-[#33DB98] transition-colors">
                {video.viewCount.toLocaleString()}
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-[#FF4D4D] uppercase font-bold mb-1.5">
                시간당 조회수
              </span>
              <span className="text-xl font-bold text-[#FF4D4D] flex items-center gap-2">
                <BarChart size={20} />
                {video.viewsPerHour
                  ? Math.round(video.viewsPerHour).toLocaleString()
                  : "-"}
              </span>
            </div>
            <div
              className={`p-5 rounded-2xl border flex flex-col items-center justify-center text-center ${
                outlierValue && outlierValue > thresholds.high
                  ? "bg-[#33DB98]/10 border-[#33DB98]/20"
                  : "bg-white/5 border-white/5"
              }`}
            >
              <span
                className={`text-xs uppercase font-bold mb-1.5 ${
                  outlierValue && outlierValue > thresholds.high
                    ? "text-[#33DB98]"
                    : "text-gray-500"
                }`}
              >
                {outlierLabel}
              </span>
              <span
                className={`text-xl font-bold flex items-center gap-2 ${
                  outlierValue && outlierValue > thresholds.high
                    ? "text-[#33DB98]"
                    : "text-gray-300"
                }`}
              >
                <Zap
                  size={20}
                  fill={
                    outlierValue && outlierValue > thresholds.high
                      ? "currentColor"
                      : "none"
                  }
                />
                {formatOutlier(outlierValue)}
              </span>
            </div>
          </div>

          {/* Description Preview */}
          {video.description && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
                 콘텐츠 미리보기
              </h3>
              <div className="text-gray-300 text-sm leading-relaxed p-5 rounded-xl bg-white/5 border border-white/5 max-h-40 overflow-y-auto custom-scrollbar">
                {video.description.split('\n').map((line, i) => ( 
                    <p key={i} className="mb-1 min-h-[1rem]">{line}</p>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-white/10">
            <a
              href={`https://youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-black hover:bg-[#33DB98] hover:text-black rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-[#33DB98]/20"
            >
              <ExternalLink size={18} />
              YouTube에서 시청하기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
