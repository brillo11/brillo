"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Sparkles,
  Loader2,
  AlignLeft,
  Hash,
  MonitorPlay,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  extractKeywordsWithGPT,
  searchYouTubeVideosByVector,
  type PrecomputedVideo,
} from "@/serverActions/youtube/youtube-precomputed.actions";
import {
  SmartSearchVideoRow,
  SmartSearchVideoModal,
} from "./SmartSearchVideoCard";
import { useRouter } from "next/navigation";

// --- Component ---

const SmartSearch: React.FC = () => {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PrecomputedVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<PrecomputedVideo | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [tooltipPosition, setTooltipPosition] = useState<boolean>(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast.error("텍스트를 입력해주세요.");
      return;
    }

    setIsAnalyzing(true);
    setKeywords([]);
    setSelectedKeyword(null);
    setSearchResults([]);

    try {
      const result = await extractKeywordsWithGPT(inputText);

      if (result.success && result.keywords) {
        setKeywords(result.keywords);
        toast.success(`${result.keywords.length}개의 키워드를 추출했습니다!`);
      } else {
        toast.error(result.error || "키워드 추출에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      toast.error("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearch = async (keyword: string) => {
    if (!keyword.trim()) {
      toast.error("검색어를 입력해주세요.");
      return;
    }

    setSelectedKeyword(keyword);
    setSearchQuery(keyword);
    setIsSearching(true);
    setSearchResults([]);

    try {
      const result = await searchYouTubeVideosByVector(keyword, 50);

      if (result.success && result.videos) {
        setSearchResults(result.videos);
        if (result.videos.length === 0) {
          toast.info("검색 결과가 없습니다.");
        } else {
          toast.success(`${result.videos.length}개의 영상을 찾았습니다!`);
        }
      } else {
        toast.error(result.error || "YouTube 검색에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      toast.error("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeywordSelect = (keyword: string) => {
    handleSearch(keyword);
  };

  const handleDirectSearch = () => {
    handleSearch(searchQuery);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleDirectSearch();
    }
  };

  const handleRowClick = (video: PrecomputedVideo) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  const handleStartLearning = () => {
    if (selectedVideo) {
      router.push(`/student/products/${selectedVideo.id}`);
      handleCloseModal();
    }
  };

  // 정렬된 결과 계산
  const sortedResults = useMemo(() => {
    if (!sortColumn) return searchResults;

    const sorted = [...searchResults].sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;

      switch (sortColumn) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "score":
          // 점수 계산 (outlierView 70% + 댓글 정규화 30%)
          const aComments = (a.commentCount ?? 0) / 1000;
          const bComments = (b.commentCount ?? 0) / 1000;
          const normalizedAComments = Math.min(aComments, 3);
          const normalizedBComments = Math.min(bComments, 3);
          aValue = (a.outlierView ?? 0) * 0.7 + normalizedAComments * 0.3;
          bValue = (b.outlierView ?? 0) * 0.7 + normalizedBComments * 0.3;
          break;
        case "vph":
          aValue = a.viewsPerHour ?? 0;
          bValue = b.viewsPerHour ?? 0;
          break;
        case "outlier":
          aValue = a.outlierView ?? 0;
          bValue = b.outlierView ?? 0;
          break;
        case "comments":
          aValue = a.commentCount ?? 0;
          bValue = b.commentCount ?? 0;
          break;
        case "views":
          aValue = a.viewCount ?? 0;
          bValue = b.viewCount ?? 0;
          break;
        case "subscribers":
          aValue = a.channelSubscriberCount ?? 0;
          bValue = b.channelSubscriberCount ?? 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return sorted;
  }, [searchResults, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // 같은 컬럼 클릭 시 방향 전환
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // 다른 컬럼 클릭 시 해당 컬럼으로 정렬 (기본 내림차순)
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const SortButton = ({ column }: { column: string }) => {
    const isActive = sortColumn === column;
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleSort(column);
        }}
        className="ml-1 inline-flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        title={`${column}로 정렬`}
      >
        {!isActive ? (
          <ArrowUpDown size={14} />
        ) : sortDirection === "asc" ? (
          <ArrowUp size={14} className="text-orange-600" />
        ) : (
          <ArrowDown size={14} className="text-orange-600" />
        )}
      </button>
    );
  };

  return (
    <div className="flex-1 bg-gray-50 h-screen overflow-y-auto animate-fade-in p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Search size={32} className="text-orange-600" /> 스마트 키워드 검색
          </h1>
          <p className="text-slate-500 text-lg">
            채널 설명이나 영상 아이디어를 입력하세요. <br />
            <span className="font-semibold text-slate-700">
              AI가 키워드를 추출
            </span>
            하고 참고 영상을 찾아드립니다.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
              <AlignLeft size={24} />
            </div>
            <div className="flex-1 space-y-4">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                아이디어 / 채널 컨텍스트
              </label>
              <textarea
                className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all outline-none resize-none text-slate-800 placeholder-slate-400"
                placeholder="예: 바쁜 직장인을 위한 간편 요리 채널을 운영하고 있습니다. 5분 안에 만드는 아침 식사 레시피 영상을 만들고 싶어요..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              ></textarea>

              <div className="flex justify-end">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !inputText.trim()}
                  className="px-8 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-slate-900/10 transform active:scale-95"
                >
                  {isAnalyzing ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Sparkles size={18} />
                  )}
                  {isAnalyzing ? "ChatGPT 분석 중..." : "키워드 추출"}
                </button>
              </div>
            </div>
          </div>
          {/* Decoration */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full blur-2xl opacity-10 pointer-events-none"></div>
        </div>

        {/* Direct Search Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Search className="text-orange-600" size={20} /> 직접 검색
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="키워드를 입력하세요 (예: 브이로그 편집, 요리 레시피...)"
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all outline-none text-slate-800 placeholder-slate-400"
            />
            <button
              onClick={handleDirectSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-8 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-600/20 transform active:scale-95"
            >
              {isSearching ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Search size={18} />
              )}
              검색
            </button>
          </div>
        </div>

        {/* Keywords Result Section */}
        {keywords.length > 0 && (
          <div className="animate-fade-in space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Hash className="text-slate-400" size={20} /> 추천 키워드
            </h3>
            <div className="flex flex-wrap gap-3">
              {keywords.map((kw, idx) => (
                <button
                  key={idx}
                  onClick={() => handleKeywordSelect(kw)}
                  disabled={isSearching}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all transform hover:-translate-y-0.5 border disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedKeyword === kw
                      ? "bg-gradient-to-r from-red-600 to-orange-600 text-white border-transparent shadow-lg shadow-orange-500/30 ring-2 ring-offset-2 ring-orange-200"
                      : "bg-white text-slate-600 border-gray-200 hover:border-orange-300 hover:text-orange-600 shadow-sm"
                  }`}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results Section */}
        {selectedKeyword && (
          <div className="space-y-6 pt-4 border-t border-gray-200 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MonitorPlay className="text-red-600" size={24} />
                <span className="text-red-600 underline decoration-2 decoration-red-200">
                  "{selectedKeyword}"
                </span>
                검색 결과
              </h3>
            </div>

            {isSearching ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="animate-pulse">
                  {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                      className="border-b border-gray-100 p-4 space-y-2"
                  >
                      <div className="flex gap-4">
                        <div className="w-24 h-14 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                  </div>
                ))}
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
                검색 결과가 없습니다.
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="overflow-x-auto overflow-y-visible">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          썸네일
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider min-w-[300px]">
                          <div className="flex items-center">
                            제목 / 채널
                            <SortButton column="title" />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center justify-center">
                            점수
                            <SortButton column="score" />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider min-w-[120px]">
                          <div className="flex items-center justify-center">
                            시간당 조회수
                            <SortButton column="vph" />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center justify-center gap-1">
                            Outlier
                            <div
                              className="relative"
                              onMouseEnter={() => setTooltipPosition(true)}
                              onMouseLeave={() => setTooltipPosition(false)}
                            >
                              <Info
                                size={14}
                                className="text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                              />
                            </div>
                            <SortButton column="outlier" />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center justify-center">
                            댓글
                            <SortButton column="comments" />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center justify-center">
                            구독자
                            <SortButton column="subscribers" />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center justify-center">
                            조회수
                            <SortButton column="views" />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sortedResults.map((video, index) => (
                        <SmartSearchVideoRow
                          key={video.id}
                          video={video}
                          index={index}
                          onRowClick={handleRowClick}
                        />
                ))}
                    </tbody>
                  </table>
                </div>
                {/* Outlier 툴팁 - 테이블 밖으로 이동 */}
                {tooltipPosition && (
                  <div className="fixed w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl pointer-events-none z-[9999] whitespace-normal top-[50%] left-[50%] -translate-y-1/2">
                    <div className="font-bold mb-1">Outlier란?</div>
                    <div className="text-gray-300 leading-relaxed">
                      해당 영상의 조회수가 채널 평균 조회수 대비 몇 배인지를
                      나타내는 지표입니다. 예: 3.5x = 채널 평균 조회수의 3.5배.
                      높을수록 해당 채널에서 인기 있는 영상입니다.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 모달은 테이블 외부에 렌더링 */}
        {selectedVideo && (
          <SmartSearchVideoModal
            video={selectedVideo}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onStartLearning={handleStartLearning}
          />
        )}
      </div>
    </div>
  );
};

export default SmartSearch;
