"use client";

import React, { useState, useEffect, useMemo, memo, useRef } from "react";
import {
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Loader2,
  Copy,
  Download,
  FileText,
  BarChart3,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useBlogForm } from "./BlogFormContext";
import {
  getCompetitorStats,
  CompetitorStats,
} from "@/serverActions/blog/competitor-stats";

// 콘텐츠 표시 컴포넌트를 별도로 분리하고 memo 처리하여 불필요한 재렌더링 방지 (이미지 깜빡임 방지)
const ContentDisplay = memo(({ content }: { content: string }) => {
  return (
    <div
      className="text-black text-[15px] leading-[1.8] tracking-tight"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
});

ContentDisplay.displayName = "ContentDisplay";

interface RightPanelProps {
  generatedContent?: string;
  isGenerating?: boolean;
  error?: string;
  generatedTitles?: string[];
  isGeneratingTitles?: boolean;
  selectedTitle?: string;
  onSelectTitle?: (title: string) => void;
  onGenerateTitles?: () => void;
  isLeftPanelCollapsed?: boolean;
  onRefineContent?: (request: string) => void;
  isRefining?: boolean;
}

const RightPanel: React.FC<RightPanelProps> = ({
  generatedContent = "",
  isGenerating = false,
  error = "",
  generatedTitles = [],
  isGeneratingTitles = false,
  selectedTitle = "",
  onSelectTitle,
  onGenerateTitles,
  isLeftPanelCollapsed = false,
  onRefineContent,
  isRefining = false,
}) => {
  const { formData, templates, loadTemplate, deleteTemplate } = useBlogForm();
  const [isRecentOpen, setIsRecentOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [refineRequest, setRefineRequest] = useState("");

  // 경쟁사 통계 상태
  const [competitorStats, setCompetitorStats] =
    useState<CompetitorStats | null>(null);
  const [isAnalyzingCompetitors, setIsAnalyzingCompetitors] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 키워드 기반 상위 블로그 통계 분석
  useEffect(() => {
    const analyzeCompetitors = async () => {
      const keyword = formData.contentPlanning.keywords[0];
      if (
        !keyword ||
        !generatedContent ||
        isAnalyzingCompetitors ||
        competitorStats?.keyword === keyword
      )
        return;

      setIsAnalyzingCompetitors(true);
      try {
        const stats = await getCompetitorStats(keyword);
        if (stats.success) {
          setCompetitorStats(stats);
        }
      } catch (error) {
        console.error("Competitor analysis failed:", error);
      } finally {
        setIsAnalyzingCompetitors(false);
      }
    };

    analyzeCompetitors();
  }, [
    generatedContent,
    formData.contentPlanning.keywords,
    isAnalyzingCompetitors,
    competitorStats,
  ]);

  // 통계 정보 계산
  const stats = useMemo(() => {
    if (!generatedContent) {
      return { characterCount: 0, imageCount: 0 };
    }

    // HTML 태그 제거하여 텍스트만 추출
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = generatedContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    const characterCount = textContent.length;

    // 이미지 태그 개수 계산
    const imageMatches = generatedContent.match(/<img[^>]*>/gi);
    const imageCount = imageMatches ? imageMatches.length : 0;

    return { characterCount, imageCount };
  }, [generatedContent]);

  const handleLoadTemplate = (id: string) => {
    loadTemplate(id);
    // 템플릿 적용 알림
    const template = templates.find((t) => t.id === id);
    if (template) {
      alert(`"${template.name}" 템플릿이 적용되었습니다!`);
    }
  };

  const handleDeleteTemplate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("정말 이 템플릿을 삭제하시겠습니까?")) {
      deleteTemplate(id);
    }
  };

  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    if (!contentRef.current) return;

    // 1. 현재의 선택 영역을 저장
    const selection = window.getSelection();
    const range = document.createRange();

    // 2. 본문 영역을 범위로 지정
    range.selectNodeContents(contentRef.current);
    selection?.removeAllRanges();
    selection?.addRange(range);

    try {
      // 3. 복사 실행 (마우스 드래그 후 Ctrl+C와 동일)
      document.execCommand("copy");
      alert(
        "전체 내용이 드래그된 상태로 복사되었습니다. 네이버 블로그에 붙여넣어 보세요!",
      );
    } catch (err) {
      console.error("복사 실패:", err);
      // 폴백: 기존 방식 (텍스트만)
      navigator.clipboard.writeText(generatedContent.replace(/<[^>]*>/g, ""));
    } finally {
      // 4. 선택 해제 (사용자 화면에서 블록 표시 제거)
      selection?.removeAllRanges();
    }
  };

  // B와 C 영역을 가로로 배치 (2:1 비율)
  if (isLeftPanelCollapsed && generatedContent) {
    return (
      <div className="grid grid-cols-3 gap-6 animate-fade-in">
        {/* B 영역: 템플릿/제목/본문 (넓게, 2/3) */}
        <div className="col-span-2 space-y-6">
          {/* Recent Templates */}
          <div className="bg-vzx-card rounded-2xl border border-white/5 shadow-sm overflow-hidden transition-all duration-300 hover:border-[#33DB98]/20">
            <button
              onClick={() => setIsRecentOpen(!isRecentOpen)}
              className="w-full flex items-center justify-between p-4 bg-vzx-card hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#33DB98]"></div>
                <h3 className="font-bold text-white">최근 템플릿</h3>
                {mounted && templates.length > 0 && (
                  <span className="text-xs bg-[#33DB98]/10 text-[#33DB98] px-2 py-0.5 rounded-full font-medium">
                    {templates.length}
                  </span>
                )}
              </div>
              {isRecentOpen ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>
            {isRecentOpen && (
              <div className="border-t border-white/5">
                {templates.length === 0 ? (
                  <div className="p-4 min-h-[60px] flex items-center justify-center text-sm text-gray-500">
                    저장된 템플릿이 없습니다.
                  </div>
                ) : (
                  <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
                    {templates.slice(0, 5).map((template) => (
                      <div key={template.id} className="group relative">
                        <button
                          onClick={() => handleLoadTemplate(template.id)}
                          className="w-full text-left p-3 rounded-xl border border-white/5 hover:border-[#33DB98]/30 hover:bg-[#33DB98]/5 transition-all"
                        >
                          <div className="flex items-start gap-2 pr-8">
                            <FileText
                              size={16}
                              className="text-gray-500 group-hover:text-[#33DB98] mt-0.5 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-300 text-sm truncate group-hover:text-white">
                                {template.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(
                                  template.createdAt,
                                ).toLocaleDateString("ko-KR", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={(e) => handleDeleteTemplate(e, template.id)}
                          className="absolute top-1/2 -translate-y-1/2 right-2 p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Blog Title Suggestion */}
          <div className="bg-vzx-card rounded-2xl border border-white/5 shadow-sm overflow-hidden min-h-[150px] transition-all duration-300 hover:border-[#33DB98]/20">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-[#33DB98]">💡</div>
                <h3 className="font-bold text-white">블로그 제목 추천</h3>
                {generatedTitles.length > 0 && (
                  <span className="text-xs bg-[#33DB98]/10 text-[#33DB98] px-2 py-0.5 rounded-full font-medium">
                    {generatedTitles.length}개
                  </span>
                )}
              </div>
              <button
                onClick={onGenerateTitles}
                disabled={isGeneratingTitles}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#33DB98]/10 hover:bg-[#33DB98]/20 border border-[#33DB98]/20 rounded-lg text-[#33DB98] text-xs font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  size={14}
                  className={isGeneratingTitles ? "animate-spin" : ""}
                />
                {generatedTitles.length > 0 ? "다시 생성" : "제목 추천받기"}
              </button>
            </div>

            {isGeneratingTitles ? (
              <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
                <Loader2 size={32} className="text-[#33DB98] animate-spin" />
                <span className="text-sm text-gray-400">제목 생성 중...</span>
              </div>
            ) : generatedTitles.length > 0 ? (
              <div className="p-4 space-y-2">
                {generatedTitles.map((title, index) => (
                  <button
                    key={index}
                    onClick={() => onSelectTitle?.(title)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedTitle === title
                        ? "border-[#33DB98]/50 bg-[#33DB98]/5 shadow-sm"
                        : "border-white/5 hover:border-[#33DB98]/30 hover:bg-[#33DB98]/5"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-gray-500 mt-0.5">
                        {index + 1}
                      </span>
                      <span
                        className={`text-sm flex-1 ${
                          selectedTitle === title
                            ? "text-[#33DB98] font-medium"
                            : "text-gray-300"
                        }`}
                      >
                        {title}
                      </span>
                      {selectedTitle === title && (
                        <span className="text-[#33DB98] text-xs">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center text-center text-gray-500 gap-2 h-full">
                {/* <ArrowLeft size={24} /> */}
                <span className="text-sm">
                  핵심 키워드를 기반으로 제목을 추천받아보세요.
                </span>
              </div>
            )}
          </div>

          {/* Generated Blog Post */}
          <div className="bg-vzx-card rounded-2xl border border-white/5 shadow-sm overflow-hidden min-h-[300px] transition-all duration-300 hover:border-[#33DB98]/20">
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-[#33DB98]">📄</div>
                  <h3 className="font-bold text-white">생성된 블로그 글</h3>
                </div>
                {generatedContent && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                      title="복사"
                    >
                      <span className="text-xs">복사하기</span>
                      <Copy size={16} />
                    </button>
                    {/* <button
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                      title="다운로드"
                    >
                      <Download size={16} />
                    </button> */}
                  </div>
                )}
              </div>
            </div>
            <div className={generatedContent ? "p-0" : "p-6"}>
              {isGenerating && !generatedContent && (
                <div className="flex flex-col items-center justify-center text-center text-gray-500 gap-3 h-60">
                  <Loader2 size={32} className="animate-spin text-[#33DB98]" />
                  <span className="text-sm">
                    AI가 블로그 글을 생성하고 있습니다...
                  </span>
                </div>
              )}
              {error && (
                <div className="flex flex-col items-center justify-center text-center text-red-400 gap-2 h-60 p-6">
                  <span className="text-sm font-medium">
                    오류가 발생했습니다
                  </span>
                  <span className="text-xs text-red-500/70">{error}</span>
                </div>
              )}
              {!isGenerating && !generatedContent && !error && (
                <div className="flex flex-col items-center justify-center text-center text-gray-500 gap-2 h-60 p-6">
                  <ArrowLeft size={24} />
                  <span className="text-sm">
                    좌측 폼을 작성하고 생성 버튼을 눌러주세요
                  </span>
                </div>
              )}
              {generatedContent && (
                <div className="bg-gray-100/80 p-6 border-t border-white/5">
                  <div
                    className="bg-white shadow-xl border border-gray-200 rounded-xl p-8 sm:p-12 prose prose-slate max-w-none"
                    ref={contentRef}
                  >
                    <ContentDisplay content={generatedContent} />
                  </div>
                  {/* <button
                    className="mt-8 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-xs transition-colors"
                    onClick={() => {
                      console.log(generatedContent);
                    }}
                  >
                    내용 로그 출력 (개발용)
                  </button> */}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* C 영역: 통계 정보 (좁게, 1/3) */}
        <div className="col-span-1 sticky top-8 space-y-6 self-start">
          <div className="bg-vzx-card rounded-2xl border border-white/5 shadow-sm overflow-hidden transition-all duration-300 hover:border-[#33DB98]/20">
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 size={20} className="text-[#33DB98]" />
                  <h3 className="font-bold text-white">콘텐츠 통계</h3>
                </div>
                {isAnalyzingCompetitors && (
                  <Loader2 size={14} className="animate-spin text-gray-500" />
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-[#33DB98]/5 rounded-2xl p-4 border border-[#33DB98]/10">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-xs text-[#33DB98] font-medium">
                      본문 글자수 (공백 포함)
                    </div>
                    {competitorStats && (
                      <div className="text-[10px] text-gray-500">
                        상위 평균:{" "}
                        {competitorStats.averageCharacterCount.toLocaleString()}
                        자
                      </div>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                    {stats.characterCount.toLocaleString()}
                    <span className="text-xs text-gray-500 font-normal">
                      자
                    </span>
                    {competitorStats && (
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded ${
                          stats.characterCount >=
                          competitorStats.averageCharacterCount
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {Math.round(
                          (stats.characterCount /
                            competitorStats.averageCharacterCount) *
                            100,
                        )}
                        %
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-blue-500/5 rounded-2xl p-4 border border-blue-500/10">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-xs text-blue-400 font-medium">
                      본문 이미지 수
                    </div>
                    {competitorStats && (
                      <div className="text-[10px] text-gray-400">
                        상위 평균: {competitorStats.averageImageCount}개
                      </div>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                    {stats.imageCount}
                    <span className="text-xs text-gray-500 font-normal">
                      개
                    </span>
                    {competitorStats && (
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded ${
                          stats.imageCount >= competitorStats.averageImageCount
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {stats.imageCount} / {competitorStats.averageImageCount}
                      </span>
                    )}
                  </div>
                </div>

                {competitorStats && (
                  <div className="bg-purple-500/5 rounded-2xl p-4 border border-purple-500/10">
                    <div className="text-xs text-purple-400 font-medium mb-1">
                      상위 노출 포스트 평균 작성일
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {competitorStats.averageDaysAgo}
                      <span className="text-xs text-gray-500 mt-1 pl-1 font-normal">
                        일 전
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      * 키워드: &quot;{competitorStats.keyword}&quot; 기반 분석
                    </div>
                  </div>
                )}

                {!competitorStats && !isAnalyzingCompetitors && (
                  <div className="text-[10px] text-gray-500 text-center py-2">
                    키워드를 입력하면 상위 블로그 통계와 비교해드립니다.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Refinement Request */}
          <div className="bg-vzx-card rounded-2xl border border-white/5 shadow-sm overflow-hidden transition-all duration-300 hover:border-[#33DB98]/20">
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="text-[#33DB98]">✍️</div>
                <h3 className="font-bold text-white">AI 글 수정 요청</h3>
              </div>
            </div>
            <div className="p-4">
              <textarea
                value={refineRequest}
                onChange={(e) => setRefineRequest(e.target.value)}
                placeholder="예: 조금 더 전문적인 느낌으로 수정해줘, 중간에 이 내용을 추가해줘"
                className="w-full h-24 p-3 bg-black/40 border border-white/10 rounded-xl text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-[#33DB98] transition-all resize-none mb-3"
              />
              <button
                onClick={() => {
                  if (refineRequest.trim() && onRefineContent) {
                    onRefineContent(refineRequest);
                    setRefineRequest("");
                  }
                }}
                disabled={
                  isRefining || !refineRequest.trim() || !generatedContent
                }
                className="w-full bg-[#33DB98] hover:bg-[#33DB98]/90 disabled:bg-[#33DB98]/20 disabled:text-gray-500 text-black py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                {isRefining ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    수정 중...
                  </>
                ) : (
                  <>수정하기</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 초기 상태: 세로 배치
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Recent Templates */}
      <div className="bg-vzx-card rounded-2xl border border-white/5 shadow-sm overflow-hidden transition-all duration-300 hover:border-[#33DB98]/20">
        <button
          onClick={() => setIsRecentOpen(!isRecentOpen)}
          className="w-full flex items-center justify-between p-4 bg-vzx-card hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#33DB98]"></div>
            <h3 className="font-bold text-white">최근 템플릿</h3>
            {templates.length > 0 && (
              <span className="text-xs bg-[#33DB98]/10 text-[#33DB98] px-2 py-0.5 rounded-full font-medium">
                {templates.length}
              </span>
            )}
          </div>
          {isRecentOpen ? (
            <ChevronUp size={20} className="text-gray-500" />
          ) : (
            <ChevronDown size={20} className="text-gray-500" />
          )}
        </button>
        {isRecentOpen && (
          <div className="border-t border-white/5">
            {templates.length === 0 ? (
              <div className="p-4 min-h-[60px] flex items-center justify-center text-sm text-gray-500">
                저장된 템플릿이 없습니다.
              </div>
            ) : (
              <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
                {templates.slice(0, 5).map((template) => (
                  <div key={template.id} className="group relative">
                    <button
                      onClick={() => handleLoadTemplate(template.id)}
                      className="w-full text-left p-3 rounded-xl border border-white/5 hover:border-[#33DB98]/30 hover:bg-[#33DB98]/5 transition-all"
                    >
                      <div className="flex items-start gap-2 pr-8">
                        <FileText
                          size={16}
                          className="text-gray-500 group-hover:text-[#33DB98] mt-0.5 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-300 text-sm truncate group-hover:text-white">
                            {template.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(template.createdAt).toLocaleDateString(
                              "ko-KR",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={(e) => handleDeleteTemplate(e, template.id)}
                      className="absolute top-1/2 -translate-y-1/2 right-2 p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="삭제"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Blog Title Suggestion */}
      <div className="bg-vzx-card rounded-2xl border border-white/5 shadow-sm overflow-hidden min-h-[150px] transition-all duration-300 hover:border-[#33DB98]/20">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="text-yellow-500">💡</div>
            <h3 className="font-bold text-white">블로그 제목 추천</h3>
            {generatedTitles.length > 0 && (
              <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full font-medium">
                {generatedTitles.length}개
              </span>
            )}
          </div>
        </div>

        {isGeneratingTitles ? (
          <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
            <Loader2 size={32} className="text-yellow-500 animate-spin" />
            <span className="text-sm text-gray-400">제목 생성 중...</span>
          </div>
        ) : generatedTitles.length > 0 ? (
          <div className="p-4 space-y-2">
            {generatedTitles.map((title, index) => (
              <button
                key={index}
                onClick={() => onSelectTitle?.(title)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedTitle === title
                    ? "border-yellow-500/50 bg-yellow-500/5 shadow-sm"
                    : "border-white/5 hover:border-yellow-500/30 hover:bg-yellow-500/5"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-gray-500 mt-0.5">
                    {index + 1}
                  </span>
                  <span
                    className={`text-sm flex-1 ${
                      selectedTitle === title
                        ? "text-yellow-200 font-medium"
                        : "text-gray-300"
                    }`}
                  >
                    {title}
                  </span>
                  {selectedTitle === title && (
                    <span className="text-yellow-500 text-xs">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center text-center text-gray-500 gap-2 h-full">
            <ArrowLeft size={24} />
            <span className="text-sm">
              좌측 폼을 작성하고 생성 버튼을 눌러주세요
            </span>
          </div>
        )}
      </div>

      {/* Generated Blog Post */}
      <div className="bg-vzx-card rounded-2xl border border-white/5 shadow-sm overflow-hidden min-h-[300px] transition-all duration-300 hover:border-[#33DB98]/20">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-[#33DB98]">📄</div>
              <h3 className="font-bold text-white">생성된 블로그 글</h3>
            </div>
            {generatedContent && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                  title="복사"
                >
                  <Copy size={16} />
                </button>
                <button
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                  title="다운로드"
                >
                  <Download size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className={generatedContent ? "p-0" : "p-6"}>
          {isGenerating && !generatedContent && (
            <div className="flex flex-col items-center justify-center text-center text-gray-500 gap-3 h-60">
              <Loader2 size={32} className="animate-spin text-[#33DB98]" />
              <span className="text-sm">
                AI가 블로그 글을 생성하고 있습니다...
              </span>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center text-center text-red-400 gap-2 h-60 p-6">
              <span className="text-sm font-medium">오류가 발생했습니다</span>
              <span className="text-xs text-red-500/70">{error}</span>
            </div>
          )}
          {!isGenerating && !generatedContent && !error && (
            <div className="flex flex-col items-center justify-center text-center text-gray-500 gap-2 h-60 p-6">
              <ArrowLeft size={24} />
              <span className="text-sm">
                좌측 폼을 작성하고 생성 버튼을 눌러주세요
              </span>
            </div>
          )}
          {generatedContent && (
            <div className="bg-gray-100/80 p-6 border-t border-white/5">
              <div
                className="bg-white shadow-xl border border-gray-200 rounded-xl p-8 sm:p-12 prose prose-slate max-w-none"
                ref={contentRef}
              >
                <ContentDisplay content={generatedContent} />
              </div>
              <button
                className="mt-8 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-xs transition-colors"
                onClick={() => {
                  console.log(generatedContent);
                }}
              >
                내용 로그 출력 (개발용)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Refinement Request (Mobile/Vertical layout) */}
      {generatedContent && (
        <div className="bg-vzx-card rounded-2xl border border-white/5 shadow-sm overflow-hidden transition-all duration-300 hover:border-[#33DB98]/20">
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="text-[#33DB98]">✍️</div>
              <h3 className="font-bold text-white">AI 글 수정 요청</h3>
            </div>
          </div>
          <div className="p-4">
            <textarea
              value={refineRequest}
              onChange={(e) => setRefineRequest(e.target.value)}
              placeholder="예: 조금 더 전문적인 느낌으로 수정해줘, 중간에 이 내용을 추가해줘"
              className="w-full h-24 p-3 bg-black/40 border border-white/10 rounded-xl text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-[#33DB98] transition-all resize-none mb-3"
            />
            <button
              onClick={() => {
                if (refineRequest.trim() && onRefineContent) {
                  onRefineContent(refineRequest);
                  setRefineRequest("");
                }
              }}
              disabled={isRefining || !refineRequest.trim()}
              className="w-full bg-[#33DB98] hover:bg-[#33DB98]/90 disabled:bg-[#33DB98]/20 disabled:text-gray-500 text-black py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              {isRefining ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  수정 중...
                </>
              ) : (
                <>수정하기</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightPanel;
