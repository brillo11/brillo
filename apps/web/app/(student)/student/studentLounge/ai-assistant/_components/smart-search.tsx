"use client";

import React, { useState } from "react";
import {
  Search,
  Sparkles,
  Loader2,
  AlignLeft,
  Hash,
  MonitorPlay,
} from "lucide-react";
import { toast } from "sonner";
import {
  extractKeywordsWithGPT,
  searchYouTubeVideos,
  type PrecomputedVideo,
} from "@/serverActions/youtube/youtube-precomputed.actions";
import { RecommendedVideoCard } from "../../dashboard/_components/RecommendedVideoCard";

// --- Component ---

const SmartSearch: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PrecomputedVideo[]>([]);

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
      const result = await searchYouTubeVideos(keyword, 6);

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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm p-4 space-y-3"
                  >
                    <div className="aspect-video bg-gray-100 rounded-lg animate-pulse"></div>
                    <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((video) => (
                  <RecommendedVideoCard key={video.id} video={video} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartSearch;
