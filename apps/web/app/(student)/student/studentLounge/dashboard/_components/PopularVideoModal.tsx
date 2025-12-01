"use client";

import { kdayjs } from "@/shared/lib/utils/dayjs";
import { X, Calendar, BarChart, Zap, Play, ExternalLink } from "lucide-react";
import type { PopularVideo } from "@/serverActions/youtube/youtube-popular.actions";

interface PopularVideoModalProps {
  video: PopularVideo | null;
  isOpen: boolean;
  onClose: () => void;
  onStartLearning: () => void;
}

export function PopularVideoModal({
  video,
  isOpen,
  onClose,
  onStartLearning,
}: PopularVideoModalProps) {
  if (!video || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header/Image */}
        <div className="relative aspect-video w-full bg-black">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover opacity-90"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              썸네일 없음
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors"
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <span className="inline-block px-2 py-1 bg-red-600 rounded text-xs font-bold mb-2">
              KR
            </span>
            <h2 className="text-2xl font-bold leading-tight mb-2">
              {video.title}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-200">
              <span className="font-medium">{video.channelTitle}</span>
              <span className="w-1 h-1 rounded-full bg-gray-400"></span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />{" "}
                {video.publishedAt
                  ? kdayjs(video.publishedAt).format("YYYY년 M월 D일")
                  : ""}
              </span>
            </div>
          </div>
        </div>
        {/* Modal Body */}
        <div className="p-6 md:p-8">
          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-gray-500 uppercase font-bold mb-1">
                총 조회수
              </span>
              <span className="text-lg font-bold text-gray-900">
                {video.viewCount.toLocaleString()}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-red-500 uppercase font-bold mb-1">
                시간당 조회수
              </span>
              <span className="text-lg font-bold text-red-700 flex items-center gap-2">
                <BarChart size={18} />
                {video.viewsPerHour
                  ? Math.round(video.viewsPerHour).toLocaleString()
                  : "-"}
              </span>
            </div>
            <div
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${
                video.outlierVph && video.outlierVph > 2
                  ? "bg-orange-50 border-orange-100"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <span
                className={`text-xs uppercase font-bold mb-1 ${
                  video.outlierVph && video.outlierVph > 2
                    ? "text-orange-600"
                    : "text-gray-500"
                }`}
              >
                아웃라이어 점수
              </span>
              <span
                className={`text-lg font-bold flex items-center gap-2 ${
                  video.outlierVph && video.outlierVph > 2
                    ? "text-orange-700"
                    : "text-gray-700"
                }`}
              >
                <Zap
                  size={18}
                  fill={
                    video.outlierVph && video.outlierVph > 2
                      ? "currentColor"
                      : "none"
                  }
                />
                {video.outlierVph ? video.outlierVph.toFixed(1) : "-"}x
              </span>
            </div>
          </div>

          {/* Description Preview */}
          {video.description && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 mb-2">
                콘텐츠 미리보기
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 bg-gray-50 p-4 rounded-lg italic border border-gray-100">
                "{video.description.substring(0, 200)}
                {video.description.length > 200 ? "..." : ""}"
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onStartLearning}
              className="flex-1 py-3.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-100 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Play size={18} fill="currentColor" />
              학습 미션 시작
            </button>
            <a
              href={`https://youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink size={18} />
              YouTube에서 시청
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
