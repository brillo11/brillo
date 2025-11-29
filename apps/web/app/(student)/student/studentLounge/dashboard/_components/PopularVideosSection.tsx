"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import type { PopularVideo } from "@/serverActions/youtube/youtube-popular.actions";

interface PopularVideosSectionProps {
  videos: PopularVideo[];
}

function formatNumber(num: number | null): string {
  if (num === null) return "-";
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return num.toLocaleString();
}

function formatDuration(isoDuration: string): string {
  if (!isoDuration) return "";

  const match = isoDuration.match(
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i
  ) as RegExpMatchArray | null;
  if (!match) return "";

  const hours = Number.parseInt(match[1] ?? "0", 10);
  const minutes = Number.parseInt(match[2] ?? "0", 10);
  const seconds = Number.parseInt(match[3] ?? "0", 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatVph(vph: number | null): string | null {
  if (vph === null || Number.isNaN(vph)) return null;
  if (vph < 10) return null;
  if (vph >= 1000000) {
    return `${(vph / 1000000).toFixed(1).replace(/\.0$/, "")}M vph`;
  }
  if (vph >= 1000) {
    return `${(vph / 1000).toFixed(1).replace(/\.0$/, "")}K vph`;
  }
  return `${vph.toFixed(1)} vph`;
}

function formatOutlier(multiplier: number | null): string | null {
  if (multiplier === null || !Number.isFinite(multiplier)) return null;
  if (multiplier <= 0) return null;
  return `${multiplier.toFixed(1)}x`;
}

function getOutlierBadgeClass(multiplier: number | null): string | null {
  if (multiplier === null || !Number.isFinite(multiplier) || multiplier <= 0) {
    return null;
  }

  if (multiplier <= 5) {
    // 약간 좋은 정도
    return "bg-slate-50 text-slate-700 border-slate-200";
  }

  if (multiplier <= 10) {
    // 꽤 잘 나온 영상
    return "bg-amber-50 text-amber-800 border-amber-200";
  }

  // 채널 대비 매우 높은 아웃라이어
  return "bg-red-50 text-red-700 border-red-200";
}

export function PopularVideosSection({ videos }: PopularVideosSectionProps) {
  const [selectedVideo, setSelectedVideo] = useState<PopularVideo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasVideos = videos.length > 0;

  const handleCardClick = (video: PopularVideo) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedVideo(null);
    }, 200);
  };

  if (!hasVideos) {
    return null;
  }

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
            요즘 뜨는 YouTube 인기 영상
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            지금 한국에서 인기 있는 영상들로 학습 아이디어를 얻어보세요.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {videos.map((video) => (
          <button
            key={video.id}
            type="button"
            onClick={() => handleCardClick(video)}
            className="group flex flex-col rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-50"
          >
            <div className="relative w-full aspect-video bg-slate-100 overflow-hidden">
              {video.thumbnailUrl ? (
                <Image
                  src={video.thumbnailUrl}
                  alt={video.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                  썸네일 없음
                </div>
              )}
              {video.duration && (
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-[10px] sm:text-[11px] font-medium">
                  {formatDuration(video.duration)}
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col px-3 sm:px-4 py-3">
              <p className="text-xs text-slate-500 mb-1 line-clamp-1">
                {video.channelTitle || "채널 정보 없음"}
              </p>
              <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 line-clamp-2 mb-2">
                {video.title}
              </h3>
              <div className="mt-auto flex flex-col gap-1 text-[11px] sm:text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>{formatNumber(video.viewCount)}회 조회</span>
                  <span>
                    {video.publishedAt
                      ? kdayjs(video.publishedAt).format("YYYY년 M월 D일")
                      : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  {formatVph(video.viewsPerHour) && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {formatVph(video.viewsPerHour)}
                    </span>
                  )}
                  {formatOutlier(video.outlierMultiplierRecent) &&
                    getOutlierBadgeClass(video.outlierMultiplierRecent) && (
                      <span
                        className={`ml-auto inline-flex items-center px-1.5 py-0.5 rounded-full border ${getOutlierBadgeClass(
                          video.outlierMultiplierRecent
                        )}`}
                      >
                        {formatOutlier(video.outlierMultiplierRecent)}
                      </span>
                    )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseModal();
          } else {
            setIsModalOpen(true);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-white">
          {selectedVideo && (
            <>
              <div className="relative w-full aspect-video bg-black">
                {selectedVideo.thumbnailUrl && (
                  <Image
                    src={selectedVideo.thumbnailUrl}
                    alt={selectedVideo.title}
                    fill
                    sizes="100vw"
                    className="object-cover opacity-90"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="bg-red-600/90 text-white border-none mb-2">
                    인기 영상
                  </Badge>
                  <DialogTitle className="text-lg sm:text-2xl font-bold text-white mb-1">
                    {selectedVideo.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-slate-100/90">
                    {selectedVideo.channelTitle}
                  </DialogDescription>
                </div>
              </div>

              <div className="px-5 sm:px-6 py-4 sm:py-5 space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600">
                  <span className="font-medium text-slate-800">
                    {selectedVideo.channelTitle}
                  </span>
                  <span className="w-px h-3 bg-slate-300" />
                  <span>{formatNumber(selectedVideo.viewCount)}회 조회</span>
                  {selectedVideo.likeCount !== null && (
                    <>
                      <span className="w-px h-3 bg-slate-300" />
                      <span>
                        좋아요 {formatNumber(selectedVideo.likeCount)}
                      </span>
                    </>
                  )}
                  {selectedVideo.commentCount !== null && (
                    <>
                      <span className="w-px h-3 bg-slate-300" />
                      <span>
                        댓글 {formatNumber(selectedVideo.commentCount)}
                      </span>
                    </>
                  )}
                  {selectedVideo.publishedAt && (
                    <>
                      <span className="w-px h-3 bg-slate-300" />
                      <span>
                        업로드:{" "}
                        {kdayjs(selectedVideo.publishedAt).format(
                          "YYYY년 M월 D일"
                        )}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-slate-500">
                  {formatVph(selectedVideo.viewsPerHour) && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      실시간 속도: {formatVph(selectedVideo.viewsPerHour)}
                    </span>
                  )}
                  {formatOutlier(selectedVideo.outlierMultiplierRecent) &&
                    getOutlierBadgeClass(
                      selectedVideo.outlierMultiplierRecent
                    ) && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full border ${getOutlierBadgeClass(
                          selectedVideo.outlierMultiplierRecent
                        )}`}
                      >
                        {formatOutlier(selectedVideo.outlierMultiplierRecent)}
                      </span>
                    )}
                </div>

                {selectedVideo.description && (
                  <div className="bg-slate-50 rounded-lg border border-slate-100 p-3 sm:p-4 max-h-48 overflow-y-auto text-xs sm:text-sm text-slate-700 whitespace-pre-line">
                    {selectedVideo.description}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-100"
                    onClick={handleCloseModal}
                  >
                    닫기
                  </Button>
                  <a
                    href={`https://www.youtube.com/watch?v=${selectedVideo.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-red-600 text-white hover:bg-red-700">
                      YouTube에서 시청
                    </Button>
                  </a>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
