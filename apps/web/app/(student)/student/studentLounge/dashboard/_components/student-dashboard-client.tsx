"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  PlayCircle,
  Clock,
  ChevronRight,
  Bell,
  CheckCircle,
} from "lucide-react";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import { PATH } from "@/shared/consts/path";
import { RecommendedVideoCard } from "./RecommendedVideoCard";
import type { MissionWithSubmissions } from "@/serverActions/mission.actions";
import type { PrecomputedVideo } from "@/serverActions/youtube/youtube-precomputed.actions";

interface Notice {
  id: bigint;
  title: string;
  createdAt: Date;
  misc?: any;
}

interface StudentDashboardClientProps {
  userName: string;
  pointsEarned: number;
  missionsDone: number;
  progressPercentage: number;
  currentMission: MissionWithSubmissions | null | undefined;
  notices: Notice[];
  recommendedVideos: PrecomputedVideo[];
}

function formatDuration(isoDuration: string | null): string {
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

export default function StudentDashboardClient({
  userName,
  pointsEarned,
  missionsDone,
  progressPercentage,
  currentMission,
  notices,
  recommendedVideos,
}: StudentDashboardClientProps) {
  const router = useRouter();

  // 공지사항 카테고리 추출
  const getNoticeCategory = (notice: Notice) => {
    const misc = (notice.misc as any) || {};
    return misc.category || "일반";
  };

  // 미션의 YouTube URL에서 videoId 추출
  const getVideoIdFromUrl = (url: string | null) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-8 p-6">
      {/* Welcome & Progress */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">안녕하세요, {userName}님!</h1>
          <p className="text-red-100 mb-6">
            주간 목표의 {progressPercentage}%를 완료하셨습니다. 계속
            화이팅하세요!
          </p>
          <div className="flex items-center gap-8">
            <div>
              <p className="text-3xl font-bold">
                {pointsEarned.toLocaleString()}
              </p>
              <p className="text-sm text-red-100 opacity-80">획득한 포인트</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{missionsDone}</p>
              <p className="text-sm text-red-100 opacity-80">완료한 미션</p>
            </div>
          </div>
        </div>

        {/* Notices Panel */}
        <div className="md:w-1/3 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Bell size={18} /> 공지사항
            </h3>
            <Link
              href={PATH.STUDENT_LOUNGE_ANNOUNCEMENTS}
              className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
            >
              전체 보기
            </Link>
          </div>
          <div className="space-y-4">
            {notices.length === 0 ? (
              <p className="text-sm text-gray-500">공지사항이 없습니다.</p>
            ) : (
              notices.slice(0, 2).map((notice) => {
                const category = getNoticeCategory(notice);
                return (
                  <div
                    key={notice.id.toString()}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          category === "Important" || category === "중요"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {kdayjs(notice.createdAt).format("MM/DD")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 font-medium line-clamp-2">
                      {notice.title}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Active Mission */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">현재 미션</h2>
        {currentMission ? (
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
            {currentMission.youtubeUrl && (
              <div className="md:w-64 shrink-0">
                <div className="relative w-full h-36 bg-gray-200 rounded-lg overflow-hidden">
                  {(() => {
                    const videoId = getVideoIdFromUrl(
                      currentMission.youtubeUrl
                    );
                    if (videoId) {
                      return (
                        <Image
                          src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                          alt="Mission thumbnail"
                          fill
                          className="object-cover"
                        />
                      );
                    }
                    return (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <PlayCircle size={48} />
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {currentMission.submissions.length > 0 ? "완료" : "대기중"}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-2">
                    {currentMission.title}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {currentMission.description || "미션 설명이 없습니다."}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={16} /> 마감일:{" "}
                  {kdayjs(currentMission.dueDate).format("YYYY년 M월 D일")}
                </div>
                {currentMission.youtubeUrl && (
                  <button
                    onClick={() => {
                      const videoId = getVideoIdFromUrl(
                        currentMission.youtubeUrl
                      );
                      if (videoId) {
                        router.push(`/student/products/${videoId}`);
                      }
                    }}
                    className="ml-auto px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    학습 시작 <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl p-12 shadow-sm">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                활성 미션 없음
              </h3>
              <p className="text-sm text-gray-500 max-w-md">
                현재 활성화된 미션이 없습니다. 새로운 과제가 있을 때까지
                기다리시거나 아래 추천 영상을 탐색해보세요.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recommended for You */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">추천 영상</h2>
          <Link
            href={PATH.STUDENT_LOUNGE_LIBRARY}
            className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
          >
            전체 보기
          </Link>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {recommendedVideos.slice(0, 4).map((video) => (
            <RecommendedVideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
}
