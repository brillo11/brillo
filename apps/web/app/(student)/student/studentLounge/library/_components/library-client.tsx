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
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [videoType, setVideoType] = useState<"long" | "short">("long");

  const filteredVideos = useMemo(() => {
    const sourceVideos = videoType === "long" ? videos : shorts;
    return sourceVideos.filter((video) => {
      const matchesSearch =
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.channelTitle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRegion =
        regionFilter === "ALL" || video.regionCode === regionFilter;

      const matchesCategory =
        categoryFilter === "ALL" ||
        (video.categoryId && video.categoryId.toString() === categoryFilter);

      return matchesSearch && matchesRegion && matchesCategory;
    });
  }, [videos, shorts, videoType, searchTerm, regionFilter, categoryFilter]);

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
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <Filter size={16} className="text-gray-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer"
              >
                <option value="ALL">전체 카테고리</option>
                <option value="1">영화 & 애니메이션</option>
                <option value="2">자동차 & 차량</option>
                <option value="10">음악</option>
                <option value="15">반려동물 & 동물</option>
                <option value="17">스포츠</option>
                <option value="18">단편 영화</option>
                <option value="19">여행 & 이벤트</option>
                <option value="20">게임</option>
                <option value="21">비디오 블로그</option>
                <option value="22">인물 & 블로그</option>
                <option value="23">코미디</option>
                <option value="24">엔터테인먼트</option>
                <option value="25">뉴스 & 정치</option>
                <option value="26">노하우 & 스타일</option>
                <option value="27">교육</option>
                <option value="28">과학 & 기술</option>
                <option value="30">영화</option>
                <option value="31">애니메이션</option>
                <option value="32">액션/어드벤처</option>
                <option value="33">클래식</option>
                <option value="34">코미디</option>
                <option value="35">다큐멘터리</option>
                <option value="36">드라마</option>
                <option value="37">가족</option>
                <option value="38">해외</option>
                <option value="39">공포</option>
                <option value="40">SF/판타지</option>
                <option value="41">스릴러</option>
                <option value="42">쇼츠</option>
                <option value="43">쇼</option>
                <option value="44">예고편</option>
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
