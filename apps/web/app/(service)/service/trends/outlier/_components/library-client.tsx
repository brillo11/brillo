"use client";

import { useState, useMemo } from "react";
import { Search, Filter, MonitorPlay, Film, ArrowRight } from "lucide-react";
import { RecommendedVideoCard } from "@/features/video/RecommendedVideoCard";
import { ShortsVideoCard } from "./ShortsVideoCard";
import type { PrecomputedVideo } from "@/serverActions/youtube/youtube-library.actions";

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
    <div className="space-y-8 relative min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#33DB98]/10 text-[#33DB98] border border-[#33DB98]/20 uppercase tracking-wider">
               Trending Intelligence
             </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">아웃라이어 라이브러리</h1>
          <p className="text-gray-400 max-w-2xl">
            채널 평균 대비 압도적인 성과를 기록한 인기 영상을 분석합니다. <br className="hidden md:block"/>
            성공하는 콘텐츠의 패턴을 발견하고 인사이트를 얻으세요.
          </p>
        </div>
        
         {/* Video Type Toggle - Large & Prominent */}
        <div className="bg-white/5 p-1 rounded-2xl border border-white/10 inline-flex">
          <button
            onClick={() => setVideoType("long")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
              videoType === "long"
                ? "bg-[#33DB98] text-black shadow-lg shadow-[#33DB98]/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <MonitorPlay size={18} />
            Long Form
          </button>
          <button
            onClick={() => setVideoType("short")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
              videoType === "short"
                ? "bg-[#33DB98] text-black shadow-lg shadow-[#33DB98]/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Film size={18} />
            Shorts
          </button>
        </div>
      </div>

      {/* Controls Container */}
      <div className="flex flex-col gap-4 sticky top-4 z-40">
        {/* Filters & Search - Glassmorphism */}
        <div className="bg-[#1A1A1A]/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="제목, 채널명으로 검색하여 인사이트 찾기..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-black/20 border-none rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-[#33DB98]/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative group">
               <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Filter size={16} className="text-gray-500 group-focus-within:text-[#33DB98]" />
               </div>
              <select
                value={regionFilter}
                onChange={(e) =>
                  setRegionFilter(e.target.value as "ALL" | "KR" | "US")
                }
                className="pl-10 pr-8 py-3.5 bg-black/20 hover:bg-black/30 text-white rounded-xl border-none text-sm font-medium focus:ring-1 focus:ring-[#33DB98]/50 cursor-pointer appearance-none min-w-[140px] transition-colors"
              >
                <option value="ALL">전체 지역</option>
                <option value="KR">한국 (KR)</option>
                <option value="US">글로벌 (US)</option>
              </select>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Filter size={16} className="text-gray-500 group-focus-within:text-[#33DB98]" />
               </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-8 py-3.5 bg-black/20 hover:bg-black/30 text-white rounded-xl border-none text-sm font-medium focus:ring-1 focus:ring-[#33DB98]/50 cursor-pointer appearance-none min-w-[160px] transition-colors"
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

      {/* Results Count */}
       <div className="flex items-center gap-2 text-sm text-gray-500 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#33DB98]"></span>
          <span>총 <strong className="text-white">{filteredVideos.length.toLocaleString()}</strong>개의 아웃라이어 발견</span>
       </div>

      {/* Grid Content */}
      {videoType === "long" ? (
        /* LONG FORM GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredVideos.map((video) => (
            <RecommendedVideoCard key={video.id} video={video} />
          ))}

          {filteredVideos.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
               <Search size={48} className="mb-4 opacity-50"/>
              <p className="text-lg font-medium text-white mb-1">조건에 맞는 영상을 찾을 수 없습니다.</p>
              <p className="text-sm">검색어나 필터를 변경해보세요.</p>
            </div>
          )}
        </div>
      ) : (
        /* SHORTS GRID */
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredVideos.map((video) => (
            <ShortsVideoCard key={video.id} video={video} />
          ))}

          {filteredVideos.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
              <Search size={48} className="mb-4 opacity-50"/>
              <p className="text-lg font-medium text-white mb-1">조건에 맞는 영상을 찾을 수 없습니다.</p>
              <p className="text-sm">검색어나 필터를 변경해보세요.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
