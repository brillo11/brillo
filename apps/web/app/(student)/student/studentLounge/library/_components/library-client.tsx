"use client";

import { useState, useMemo } from "react";
import { Search, Filter, MonitorPlay, Film } from "lucide-react";
import { RecommendedVideoCard } from "../../dashboard/_components/RecommendedVideoCard";
import { ShortsVideoCard } from "./ShortsVideoCard";
import type { PrecomputedVideo } from "@/serverActions/youtube/youtube-precomputed.actions";

interface LibraryClientProps {
  videos: PrecomputedVideo[];
  shorts: PrecomputedVideo[];
}

export function LibraryClient({ videos, shorts }: LibraryClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState<"ALL" | "KR" | "US">("ALL");
  const [videoType, setVideoType] = useState<"long" | "short">("long");

  const filteredVideos = useMemo(() => {
    const sourceVideos = videoType === "long" ? videos : shorts;
    return sourceVideos.filter((video) => {
      const matchesSearch =
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.channelTitle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRegion =
        regionFilter === "ALL" || video.regionCode === regionFilter;

      return matchesSearch && matchesRegion;
    });
  }, [videos, shorts, videoType, searchTerm, regionFilter]);

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">영상 라이브러리</h1>
          <p className="text-gray-500">
            AI가 선별한 트렌딩 교육 콘텐츠를 탐색해보세요.
          </p>
        </div>
      </div>

      {/* Controls Container */}
      <div className="flex flex-col gap-4">
        {/* Type Toggles (Long vs Shorts) */}
        <div className="flex p-1 bg-gray-100 rounded-xl w-fit self-start">
          <button
            onClick={() => setVideoType("long")}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
              videoType === "long"
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MonitorPlay size={18} />
            Long Form
          </button>
          <button
            onClick={() => setVideoType("short")}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
              videoType === "short"
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Film size={18} />
            Shorts
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="제목 또는 채널명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <Filter size={16} className="text-gray-500" />
              <select
                value={regionFilter}
                onChange={(e) =>
                  setRegionFilter(e.target.value as "ALL" | "KR" | "US")
                }
                className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer"
              >
                <option value="ALL">전체 지역</option>
                <option value="KR">한국 (KR)</option>
                <option value="US">글로벌 (US)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {videoType === "long" ? (
        /* LONG FORM GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
          {filteredVideos.map((video) => (
            <RecommendedVideoCard key={video.id} video={video} />
          ))}

          {filteredVideos.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p>조건에 맞는 롱폼 영상을 찾을 수 없습니다.</p>
            </div>
          )}
        </div>
      ) : (
        /* SHORTS GRID */
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-in fade-in duration-300">
          {filteredVideos.map((video) => (
            <ShortsVideoCard key={video.id} video={video} />
          ))}

          {filteredVideos.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p>조건에 맞는 숏폼 영상을 찾을 수 없습니다.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
