"use client";

import React, { useState } from "react";
import {
  Search,
  Calendar,
  Image as ImageIcon,
  ThumbsUp,
  ExternalLink,
  Loader2,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  searchBlogPosts,
  BlogPost,
} from "@/serverActions/blog/blog-keyword-search";

export default function BlogKeywordSearchPage() {
  const [keyword, setKeyword] = useState("");
  const [count, setCount] = useState(7);
  const [results, setResults] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const result = await searchBlogPosts(keyword, count);
      if (result.success) {
        setResults(result.posts);
      } else {
        setError(result.error || "검색 결과가 없습니다.");
        setResults([]);
      }
    } catch {
      setError("검색 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero Section */}
      <div className="bg-[#0A0A0A] border-b border-white/5 px-4 py-12 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-vzx-card rounded-2xl shadow-sm border border-white/5 text-[#33DB98]">
                <TrendingUp size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  블로그 키워드 분석
                </h1>
                <p className="text-gray-400 font-medium">
                  네이버 블로그의 최신 트렌드를 분석하고 경쟁 포스트를
                  확인하세요
                </p>
                <div className="flex flex-wrap gap-4 mt-3 text-xs font-medium text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="text-[#33DB98]">★</span> 실시간 순위 조회
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-[#33DB98]">★</span> 데이터 기반 분석
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-[#33DB98]">★</span> 경쟁사 벤치마킹
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search Input Section */}
        <div className="bg-vzx-card rounded-2xl border border-white/5 p-8 mb-12 shadow-sm">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-500" />
              </div>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="검색어를 입력하세요 (예: 강남 맛집, 퍼스널 브랜딩)"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#33DB98]/50 transition-colors"
              />
            </div>
            <div className="flex gap-4">
              <div className="w-24 relative">
                <input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  min="1"
                  max="50"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-center text-white focus:outline-none focus:border-[#33DB98]/50 transition-colors"
                />
                <div className="absolute -top-6 left-0 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  가져올 개수
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#33DB98] hover:bg-[#28a87a] disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#33DB98]/20 active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Search size={20} />
                )}
                분석하기
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#33DB98]/20 border-t-[#33DB98] rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Search size={24} className="text-[#33DB98]" />
              </div>
            </div>
            <p className="mt-6 text-gray-400 font-medium animate-pulse">
              네이버 데이터를 분석 중입니다...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-[#33DB98] rounded-full"></div>
                <h2 className="text-xl font-bold">
                  검색 결과{" "}
                  <span className="text-[#33DB98] ml-1">{results.length}</span>
                </h2>
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-bold text-white">
                  &quot;{keyword}&quot;
                </span>{" "}
                키워드 상위 노출 분석 결과
              </div>
            </div>

            {/* Debug Area (Detailed Info) */}
            {/* {results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-vzx-card border border-[#33DB98]/20 rounded-2xl p-6 overflow-hidden">
                  <h3 className="text-[#33DB98] font-bold mb-4 flex items-center gap-2">
                    <BookOpen size={18} /> 1순위 포스트 본문 분석 (Full Content)
                  </h3>
                  <div className="bg-black/50 p-4 rounded-xl text-[11px] text-gray-400 overflow-y-auto max-h-[400px] prose prose-invert prose-sm">
                    {results[0]?.keywords && results[0].keywords.length > 0 && (
                      <div className="w-full bg-[#0D1512] border border-[#33DB98]/10 rounded-xl p-3 mb-4">
                        <div className="flex items-center gap-1.5 text-[10px] text-[#33DB98] font-bold uppercase mb-2 leading-none">
                          <TrendingUp size={12} className="shrink-0" /> AI 핵심
                          키워드
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {results[0].keywords.map((kw, i) => (
                            <span
                              key={i}
                              className="bg-[#33DB98] text-black text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-0.5 shadow-sm shadow-[#33DB98]/20"
                            >
                              <span className="opacity-70 text-[8px]">#</span>
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {results[0]?.fullContent ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: results[0].fullContent,
                        }}
                      />
                    ) : (
                      <p className="italic">
                        본문 내용을 불러오는 중이거나 내용이 없습니다.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-vzx-card border border-[#33DB98]/20 rounded-2xl p-6 overflow-hidden">
                  <h3 className="text-[#33DB98] font-bold mb-4 flex items-center gap-2">
                    <Search size={18} /> 1순위 블로그 정보 (Blog Info)
                  </h3>
                  {results[0]?.blogInfo ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                        <img
                          src={results[0].blogInfo.profileImgUrl}
                          alt="Profile"
                          className="w-16 h-16 rounded-full border-2 border-[#33DB98]/30"
                        />
                        <div>
                          <div className="text-lg font-bold text-white">
                            {results[0].blogInfo.blogName ||
                              results[0].blogName}
                          </div>
                          <div className="text-sm text-[#33DB98] font-medium">
                            @{results[0].blogId}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                          <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                            이웃 수
                          </div>
                          <div className="text-xl font-bold text-white">
                            {results[0].blogInfo.subscriberCount?.toLocaleString() ||
                              0}
                          </div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                          <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                            전체 방문자
                          </div>
                          <div className="text-xl font-bold text-white">
                            {results[0].blogInfo.totalVisitorCount?.toLocaleString() ||
                              0}
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">
                          블로그 소개
                        </div>
                        <div className="text-xs text-gray-300 leading-relaxed">
                          {results[0].blogInfo.blogDirectoryName || "정보 없음"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-500 italic">
                      블로그 정보를 불러오는 중입니다...
                    </div>
                  )}
                </div>
              </div>
            )} */}

            <div className="grid grid-cols-1 gap-4">
              {results.map((post) => (
                <div
                  key={`${post.blogId}_${post.logNo}`}
                  className="bg-vzx-card hover:bg-white/[0.03] border border-white/5 hover:border-[#33DB98]/30 rounded-2xl p-6 transition-all group flex flex-col md:flex-row gap-6 relative overflow-hidden"
                >
                  {/* Rank Badge */}
                  {/* <div className="absolute top-0 left-0 w-12 h-12 flex items-center justify-center">
                    <div className="absolute top-0 left-0 w-full h-full bg-[#33DB98]/10 -rotate-45 -translate-x-1/2 -translate-y-1/2"></div>
                    <span className="relative z-10 font-black text-[#33DB98] text-lg">
                      {index + 1}
                    </span>
                  </div> */}

                  {/* Post Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <h3
                        className="text-lg font-bold text-white line-clamp-1 group-hover:text-[#33DB98] transition-colors"
                        dangerouslySetInnerHTML={{ __html: post.title }}
                      />
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 p-2 bg-white/5 hover:bg-[#33DB98] hover:text-black rounded-lg transition-all text-gray-400"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md">
                        <BookOpen size={14} className="text-[#33DB98]" />
                        <span className="font-semibold text-gray-300">
                          {post.blogName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>{post.publishDate}</span>
                        <span className="text-[10px] text-gray-500">
                          ({post.daysAgo}일 전)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      {post.keywords && post.keywords.length > 0 && (
                        <div className="w-full bg-[#0D1512] border border-[#33DB98]/10 rounded-xl p-3 mb-2">
                          <div className="flex items-center gap-1.5 text-[10px] text-[#33DB98] font-bold uppercase mb-2 leading-none">
                            <TrendingUp size={12} className="shrink-0" /> AI
                            핵심 키워드
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {post.keywords.map((kw, i) => (
                              <span
                                key={i}
                                className="bg-[#33DB98] text-black text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-0.5 shadow-sm shadow-[#33DB98]/20"
                              >
                                <span className="opacity-70 text-[8px]">#</span>
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs">
                        <ImageIcon size={14} className="text-gray-500" />
                        <span className="text-gray-400">이미지</span>
                        <span className="font-bold text-white">
                          {post.imageCount}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <ThumbsUp size={14} className="text-gray-500" />
                        <span className="text-gray-400">공감</span>
                        <span className="font-bold text-white">
                          {post.likeCount}
                        </span>
                      </div>
                      {/* <div className="flex items-center gap-1.5 text-xs">
                        <MessageSquare size={14} className="text-gray-500" />
                        <span className="text-gray-400">댓글</span>
                        <span className="font-bold text-white">
                          {post.commentCount}
                        </span>
                      </div> */}
                      {/* {post.quality && (
                        <div className="bg-[#33DB98]/10 text-[#33DB98] text-[10px] px-2 py-0.5 rounded font-bold border border-[#33DB98]/20">
                          QUALITY SCORE: {post.quality}
                        </div>
                      )} */}
                    </div>

                    {/* Debug: Parsed Content */}
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <details className="group/debug">
                        <summary className="text-[10px] text-gray-500 cursor-pointer hover:text-[#33DB98] transition-colors font-bold uppercase tracking-wider list-none flex items-center gap-1 outline-none">
                          <span className="group-open/debug:rotate-90 transition-transform duration-200">
                            ▶
                          </span>
                          DEBUG: PARSED CONTENT (HTML)
                        </summary>
                        <div className="mt-3 p-4 bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                          <div className="max-h-[300px] overflow-y-auto custom-scrollbar text-[11px] text-gray-400 prose prose-invert prose-xs max-w-none">
                            {post.fullContent ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: post.fullContent,
                                }}
                              />
                            ) : (
                              <p className="italic text-gray-600">
                                본문 내용이 파싱되지 않았습니다.
                              </p>
                            )}
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : hasSearched ? (
          <div className="text-center py-20 bg-vzx-card rounded-2xl border border-dashed border-white/10">
            <Search
              size={48}
              className="mx-auto text-gray-600 mb-4 opacity-50"
            />
            <p className="text-gray-500 font-medium">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-vzx-card border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
                <Search size={24} />
              </div>
              <h3 className="font-bold text-white">상위 노출 확인</h3>
              <p className="text-xs text-gray-500">
                원하는 키워드의 현재 상위 노출 포스트들을 실시간으로 분석합니다.
              </p>
            </div>
            <div className="bg-vzx-card border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-[#33DB98]/10 rounded-full flex items-center justify-center text-[#33DB98]">
                <ImageIcon size={24} />
              </div>
              <h3 className="font-bold text-white">콘텐츠 구성 분석</h3>
              <p className="text-xs text-gray-500">
                상위 노출된 글들의 이미지 수, 발행일, 공감 수 등을 한눈에
                파악하세요.
              </p>
            </div>
            <div className="bg-vzx-card border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400">
                <ArrowRight size={24} />
              </div>
              <h3 className="font-bold text-white">벤치마킹 전략 수립</h3>
              <p className="text-xs text-gray-500">
                데이터를 바탕으로 내 글이 상위에 노출되기 위한 전략을 세울 수
                있습니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
