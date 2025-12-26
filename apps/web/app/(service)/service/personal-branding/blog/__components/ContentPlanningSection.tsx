"use client";

import React, { useState, useEffect } from "react";
import { useBlogForm } from "./BlogFormContext";
import AccordionItem from "./AccordionItem";
import {
  Search,
  TrendingUp,
  Loader2,
  Sparkles,
  Check,
  ArrowRight,
  Link as LinkIcon,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import {
  searchBlogPosts,
  BlogPost,
  generateContentPlansFromKeywords,
  generateContentPlanFromUrl,
  generateContentPlanFromYoutube,
  analyzeToneAndStyleFromContent,
} from "@/serverActions/blog/keyword-search";
import { toast } from "sonner";

interface GeneratedPlan {
  subject: string;
  targetAudience: string;
  keyMessage: string;
  keywords: string[];
  tone?: string;
  styleAnalysis?: string;
}

interface ContentPlanningSectionProps {
  isWorkflow?: boolean;
}

const ContentPlanningSection: React.FC<ContentPlanningSectionProps> = ({
  isWorkflow = false,
}) => {
  const {
    formData,
    updateFormData,
    lastAutoFillTimestamp,
    triggerAutoFillFeedback,
  } = useBlogForm();
  const [activeTab, setActiveTab] = useState<"STRATEGY" | "LINK">("STRATEGY");

  // 피드백 상태
  const [showAutoFillMessage, setShowAutoFillMessage] = useState(false);
  const [highlightTrigger, setHighlightTrigger] = useState(0);

  // auto-fill 피드백 감지
  useEffect(() => {
    if (lastAutoFillTimestamp > 0) {
      setShowAutoFillMessage(true);
      setHighlightTrigger(lastAutoFillTimestamp);
    }
  }, [lastAutoFillTimestamp]);

  // 기본 입력 필드 상태
  const [youtubeUrl, setYoutubeUrl] = useState(
    formData.contentPlanning.youtubeUrl,
  );
  const [blogUrl, setBlogUrl] = useState(formData.contentPlanning.blogUrl);
  const [subject, setSubject] = useState(formData.contentPlanning.subject);
  const [targetAudience, setTargetAudience] = useState(
    formData.contentPlanning.targetAudience,
  );
  const [keyMessage, setKeyMessage] = useState(
    formData.contentPlanning.keyMessage,
  );
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>(
    formData.contentPlanning.keywords || [],
  );

  // 상위 노출 분석 및 AI 기획 관련 상태
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearchingBlogs, setIsSearchingBlogs] = useState(false);
  const [blogResults, setBlogResults] = useState<BlogPost[]>([]);
  const [isGeneratingPlans, setIsGeneratingPlans] = useState(false);
  const [generatedPlans, setGeneratedPlans] = useState<GeneratedPlan[]>([]);
  const [selectedBlogIdx, setSelectedBlogIdx] = useState<number | null>(null);
  const [selectedPlanIdx, setSelectedPlanIdx] = useState<number | null>(null);

  // 선택된 블로그의 스타일/말투 분석 데이터
  const [analyzedTone, setAnalyzedTone] = useState<string | null>(null);
  const [analyzedStyle, setAnalyzedStyle] = useState<string | null>(null);

  // 직접 수정 영역 확장 상태
  const [isManualEditExpanded, setIsManualEditExpanded] = useState(false);

  // 블로그 URL 자동 입력 관련 상태
  const [isGeneratingFromBlog, setIsGeneratingFromBlog] = useState(false);
  const [isGeneratingFromYoutube, setIsGeneratingFromYoutube] = useState(false);

  // Sync local states when formData changes
  useEffect(() => {
    setYoutubeUrl(formData.contentPlanning.youtubeUrl);
    setBlogUrl(formData.contentPlanning.blogUrl);
    setSubject(formData.contentPlanning.subject);
    setTargetAudience(formData.contentPlanning.targetAudience);
    setKeyMessage(formData.contentPlanning.keyMessage);
    setKeywords(formData.contentPlanning.keywords || []);
  }, [formData.contentPlanning]);

  // 워크플로우에서 진입했을 때만 초기 주제를 AI 검색창에 자동 입력
  useEffect(() => {
    if (isWorkflow && formData.contentPlanning.subject) {
      setSearchKeyword(formData.contentPlanning.subject);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 시점에만 실행

  const handleYoutubeChange = (value: string) => {
    setYoutubeUrl(value);
    updateFormData("contentPlanning", {
      ...formData.contentPlanning,
      youtubeUrl: value,
    });
  };

  const handleBlogChange = (value: string) => {
    setBlogUrl(value);
    updateFormData("contentPlanning", {
      ...formData.contentPlanning,
      blogUrl: value,
    });
  };

  const handleSubjectChange = (value: string) => {
    setSubject(value);
    updateFormData("contentPlanning", {
      ...formData.contentPlanning,
      subject: value,
    });
  };

  const handleTargetAudienceChange = (value: string) => {
    setTargetAudience(value);
    updateFormData("contentPlanning", {
      ...formData.contentPlanning,
      targetAudience: value,
    });
  };

  const handleKeyMessageChange = (value: string) => {
    setKeyMessage(value);
    updateFormData("contentPlanning", {
      ...formData.contentPlanning,
      keyMessage: value,
    });
  };

  // AI가 응답한 말투 텍스트를 정제 (예: "친절형 (~해요)" -> "친절형")
  const sanitizeTone = (toneText: string | undefined): string => {
    if (!toneText) return "친절형";
    if (toneText.includes("정중")) return "정중형";
    if (toneText.includes("친근")) return "친근형";
    return "친절형";
  };

  // 1. 블로그 상위 노출 분석 검색
  const handleBlogAnalysis = async () => {
    if (!searchKeyword.trim()) return;
    setIsSearchingBlogs(true);
    setBlogResults([]);
    setGeneratedPlans([]);
    setSelectedBlogIdx(null);
    setSelectedPlanIdx(null);
    try {
      const result = await searchBlogPosts(searchKeyword, 7);
      if (result.success) {
        setBlogResults(result.posts);
      }
    } catch (error) {
      console.error("블로그 검색 오류:", error);
    } finally {
      setIsSearchingBlogs(false);
    }
  };

  // 2. 선택한 블로그 키워드를 기반으로 AI 기획안 생성
  const handleSelectBlogAndGeneratePlans = async (
    idx: number,
    blogKeywords: string[],
  ) => {
    setSelectedBlogIdx(idx);
    setIsGeneratingPlans(true);
    setGeneratedPlans([]);
    setSelectedPlanIdx(null);
    setAnalyzedTone(null);
    setAnalyzedStyle(null);

    try {
      // 1. 키워드 기반 기획안 생성과 본문 스타일 분석을 병렬로 진행
      const selectedPost = blogResults[idx];

      const promises: [Promise<any>, Promise<any> | null] = [
        generateContentPlansFromKeywords(
          blogKeywords,
          formData.initialPlanning,
        ),
        selectedPost?.fullContent
          ? analyzeToneAndStyleFromContent(selectedPost.fullContent)
          : null,
      ];

      const [planResult, styleResult] = await Promise.all(promises);

      if (planResult.success) {
        setGeneratedPlans(planResult.plans);
      }

      if (styleResult?.success) {
        const sanitizedTone = sanitizeTone(styleResult.tone);
        setAnalyzedTone(sanitizedTone);
        setAnalyzedStyle(styleResult.styleAnalysis);

        // 블로그 분석 완료 즉시 2, 3단계 선제 업데이트
        updateFormData("options", (prev: any) => ({
          ...prev,
          styleReference: sanitizedTone,
          generateImageWithAi: true,
        }));

        updateFormData("details", (prev: any) => ({
          ...prev,
          length: "1000자",
          styleText: styleResult.styleAnalysis || "",
        }));

        setIsManualEditExpanded(true);
        triggerAutoFillFeedback();
      }
    } catch (error) {
      console.error("기획안 생성 및 분석 오류:", error);
    } finally {
      setIsGeneratingPlans(false);
    }
  };

  // 3. 기획안 최종 선택 및 적용 (자동 채우기 로직 추가)
  const applyContentPlan = (plan: GeneratedPlan, idx: number | null = null) => {
    setSelectedPlanIdx(idx);
    setIsManualEditExpanded(true);

    // 1단계 내용 업데이트 (AI가 사용자의 초기 의도를 이미 통합하여 생성함)
    updateFormData("contentPlanning", {
      ...formData.contentPlanning,
      subject: plan.subject,
      targetAudience: plan.targetAudience,
      keyMessage: plan.keyMessage,
      keywords: plan.keywords,
    });

    // [중요] 워크플로우 초기 기획안 고정 (상단 요약용)
    if (!formData.initialPlanning.subject) {
      updateFormData("initialPlanning", {
        subject: plan.subject,
        targetAudience: plan.targetAudience,
        keyMessage: plan.keyMessage,
      });
    }

    // 적용할 톤과 스타일 결정 (기획안 자체 데이터 우선, 없으면 분석된 데이터 사용, 그것도 없으면 기본값)
    const finalTone = sanitizeTone(plan.tone || analyzedTone || "친절형");
    const finalStyle = plan.styleAnalysis || analyzedStyle || "";

    // [Auto-fill] 2, 3단계 자동 채우기
    updateFormData("options", (prev: any) => ({
      ...prev,
      styleReference: finalTone,
      generateImageWithAi: true,
    }));

    updateFormData("details", (prev: any) => ({
      ...prev,
      length: "1000자",
      styleText: finalStyle,
    }));

    triggerAutoFillFeedback();
    toast.success("기획안에 맞춰 세부 설정이 자동으로 업데이트되었습니다.");
  };

  // 블로그 URL을 기반으로 기획안 생성 및 자동 채우기
  const handleBlogUrlAnalysis = async () => {
    if (!blogUrl.trim()) return;
    setIsGeneratingFromBlog(true);
    try {
      const result = await generateContentPlanFromUrl(
        blogUrl,
        formData.initialPlanning,
      );
      if (result.success && result.plan) {
        applyContentPlan(result.plan);
        triggerAutoFillFeedback();
      } else {
        alert(result.error || "블로그 분석 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("블로그 URL 분석 오류:", error);
      alert("기획안 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingFromBlog(false);
    }
  };

  // YouTube URL을 기반으로 기획안 생성 및 자동 채우기
  const handleYoutubeUrlAnalysis = async () => {
    if (!youtubeUrl.trim()) return;
    setIsGeneratingFromYoutube(true);
    try {
      const result = await generateContentPlanFromYoutube(
        youtubeUrl,
        formData.initialPlanning,
      );
      if (result.success && result.plan) {
        applyContentPlan(result.plan);
        triggerAutoFillFeedback();
      } else {
        alert(result.error || "YouTube 분석 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("YouTube URL 분석 오류:", error);
      alert("기획안 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingFromYoutube(false);
    }
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeywordInput(value);
    const parts = value.split(",");
    if (parts.length > 1) {
      const completedKeywords = parts
        .slice(0, -1)
        .map((k) => k.trim().replace(/^#+/, ""))
        .filter((k) => k.length > 0);
      const mergedKeywords = Array.from(
        new Set([...keywords, ...completedKeywords]),
      ).slice(0, 5);
      setKeywords(mergedKeywords);
      setKeywordInput(parts[parts.length - 1] || "");
      updateFormData("contentPlanning", {
        ...formData.contentPlanning,
        keywords: mergedKeywords,
      });
    }
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = keywordInput.trim().replace(/^#+/, "");
      if (value && keywords.length < 5 && !keywords.includes(value)) {
        const newKeywords = [...keywords, value];
        setKeywords(newKeywords);
        setKeywordInput("");
        updateFormData("contentPlanning", {
          ...formData.contentPlanning,
          keywords: newKeywords,
        });
      }
    }
  };

  const removeKeyword = (index: number) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords);
    updateFormData("contentPlanning", {
      ...formData.contentPlanning,
      keywords: newKeywords,
    });
  };

  return (
    <AccordionItem title="1단계: 뼈대 및 아이디어 도출" defaultOpen={true}>
      <div className="space-y-6">
        {/* Workflow Data Summary */}
        {isWorkflow &&
          (formData.contentPlanning.subject ||
            formData.contentPlanning.targetAudience ||
            formData.contentPlanning.keyMessage) && (
            <div className="bg-[#33DB98]/5 border border-[#33DB98]/10 rounded-2xl p-5 mb-2 space-y-3 animate-in fade-in slide-in-from-top-1 duration-500">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-[#33DB98]" />
                <span className="text-[10px] font-black text-[#33DB98] uppercase tracking-widest">
                  현재 아이디어
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {(formData.initialPlanning.subject ||
                  formData.contentPlanning.subject) && (
                  <div className="flex gap-3">
                    <span className="text-[10px] font-bold text-gray-500 w-16 shrink-0 mt-0.5">
                      주제
                    </span>
                    <p className="text-xs text-gray-300 font-medium line-clamp-1">
                      {formData.initialPlanning.subject ||
                        formData.contentPlanning.subject}
                    </p>
                  </div>
                )}
                {(formData.initialPlanning.targetAudience ||
                  formData.contentPlanning.targetAudience) && (
                  <div className="flex gap-3">
                    <span className="text-[10px] font-bold text-gray-500 w-16 shrink-0 mt-0.5">
                      대상고객
                    </span>
                    <p className="text-xs text-gray-300 font-medium line-clamp-1">
                      {formData.initialPlanning.targetAudience ||
                        formData.contentPlanning.targetAudience}
                    </p>
                  </div>
                )}
                {(formData.initialPlanning.keyMessage ||
                  formData.contentPlanning.keyMessage) && (
                  <div className="flex gap-3">
                    <span className="text-[10px] font-bold text-gray-500 w-16 shrink-0 mt-0.5">
                      핵심 인사이트
                    </span>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                      {formData.initialPlanning.keyMessage ||
                        formData.contentPlanning.keyMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Tab Switcher */}
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
          <div className="flex-1 relative group">
            <button
              onClick={() => setActiveTab("STRATEGY")}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "STRATEGY"
                  ? "bg-[#33DB98]/10 text-[#33DB98] shadow-sm"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <TrendingUp size={14} /> 상위 노출 전략
            </button>
            {/* Tooltip on Hover */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 p-4 bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] pointer-events-none">
              <div className="flex items-center gap-2 mb-2 text-[#33DB98]">
                <TrendingUp size={14} />
                <span className="text-xs font-bold">상위 노출 전략</span>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                키워드로 상위 노출 블로그 포스트들을 확인하고, 핵심 키워드를
                선택해보세요. 기획안까지 작성해드립니다 !
              </p>
              {/* Tooltip Arrow */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-8 border-transparent border-b-[#1A1A1A]/95"></div>
            </div>
          </div>

          <div className="flex-1 relative group">
            <button
              onClick={() => setActiveTab("LINK")}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "LINK"
                  ? "bg-[#33DB98]/10 text-[#33DB98] shadow-sm"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <LinkIcon size={14} /> 외부 링크 분석
            </button>
            {/* Tooltip on Hover */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 p-4 bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] pointer-events-none">
              <div className="flex items-center gap-2 mb-2 text-[#33DB98]">
                <LinkIcon size={14} />
                <span className="text-xs font-bold">외부 링크 분석</span>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                마음에 드는 컨텐츠를 발견하셨나요? 링크만으로 컨텐츠를 분석하고
                글감으로 사용해보세요 !
              </p>
              {/* Tooltip Arrow */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-8 border-transparent border-b-[#1A1A1A]/95"></div>
            </div>
          </div>
        </div>

        {activeTab === "STRATEGY" ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* [NEW] AI 추천 기획 섹션 */}
            <div className="bg-[#0D1512]/50 border border-[#33DB98]/20 rounded-2xl p-6 shadow-xl shadow-[#33DB98]/5">
              <label className="flex text-base font-bold text-[#33DB98] mb-4 items-center gap-2">
                <Sparkles size={20} className="animate-pulse" /> AI 상위 노출
                전략 기획
              </label>

              <div className="flex flex-col gap-2 mb-6">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleBlogAnalysis()}
                    placeholder="어떤 주제로 글을 쓰실 건가요? (예: 라부부 키링)"
                    className="w-full pl-11 pr-4 py-3.5 bg-black/60 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#33DB98] transition-all text-white"
                  />
                </div>
                <button
                  onClick={handleBlogAnalysis}
                  disabled={isSearchingBlogs || !searchKeyword.trim()}
                  className="bg-[#33DB98] hover:bg-[#33DB98]/90 disabled:bg-[#33DB98]/50 disabled:text-gray-400 text-black px-8 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 min-w-[120px] justify-center shadow-lg shadow-[#33DB98]/20"
                >
                  {isSearchingBlogs ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "상위 블로그 분석"
                  )}
                </button>
              </div>

              {/* Step 1: 블로그 분석 결과 */}
              {blogResults.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                      <TrendingUp size={14} className="text-[#33DB98]" /> 1.
                      상위 노출 키워드 (클릭하여 기획 생성)
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                    {blogResults.map(
                      (post, idx) =>
                        post.keywords &&
                        post.keywords.length > 0 && (
                          <div key={idx} className="relative group">
                            <button
                              onClick={() =>
                                handleSelectBlogAndGeneratePlans(
                                  idx,
                                  post.keywords!,
                                )
                              }
                              className={`w-full text-left p-4 rounded-xl border transition-all overflow-hidden cursor-pointer ${
                                selectedBlogIdx === idx
                                  ? "bg-[#33DB98]/10 border-[#33DB98] shadow-inner shadow-[#33DB98]/10"
                                  : "bg-white/5 border-white/5 hover:border-[#33DB98]/40 hover:bg-[#33DB98]/5"
                              }`}
                            >
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {post.keywords.map((kw, i) => (
                                  <span
                                    key={i}
                                    className={`text-[11px] font-bold ${selectedBlogIdx === idx ? "text-[#33DB98]" : "text-gray-400 group-hover:text-[#33DB98]"}`}
                                  >
                                    #{kw}
                                  </span>
                                ))}
                              </div>
                              <div className="text-[10px] text-gray-600 flex justify-between items-center">
                                <span className="truncate max-w-[150px]">
                                  {post.blogName}
                                </span>
                                {/* {selectedBlogIdx === idx && (
                                  <Check size={12} className="text-[#33DB98]" />
                                )} */}
                              </div>
                            </button>
                            {/* 원문 링크 버튼 */}
                            <a
                              href={post.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute right-3 top-3 p-1.5 bg-white/5 hover:bg-[#33DB98]/20 text-gray-500 hover:text-[#33DB98] rounded-lg transition-all z-10"
                              title="원문 보기"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        ),
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: AI 기획안 결과 */}
              {(isGeneratingPlans || generatedPlans.length > 0) && (
                <div className="mt-8 pt-6 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <p className="text-xs text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles size={14} className="text-[#33DB98]" /> 2. AI 추천
                    글쓰기 기획안 (클릭하여 기획 선택)
                  </p>

                  {isGeneratingPlans ? (
                    <div className="flex flex-col items-center py-10 space-y-3">
                      <Loader2
                        size={32}
                        className="animate-spin text-[#33DB98]"
                      />
                      <p className="text-sm text-gray-400 animate-pulse">
                        최적의 블로그 기획안을 생성 중입니다...
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {generatedPlans.map((plan, idx) => (
                        <button
                          key={idx}
                          onClick={() => applyContentPlan(plan, idx)}
                          className={`w-full text-left p-5 rounded-2xl transition-all group relative overflow-hidden cursor-pointer border ${
                            selectedPlanIdx === idx
                              ? "bg-[#33DB98]/10 border-[#33DB98] shadow-inner shadow-[#33DB98]/10"
                              : "bg-gradient-to-br from-white/[0.07] to-white/[0.02] border-white/10 hover:border-[#33DB98]/50 hover:from-[#33DB98]/10 hover:to-transparent"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4
                              className={`font-bold transition-colors leading-snug ${
                                selectedPlanIdx === idx
                                  ? "text-[#33DB98]"
                                  : "text-white group-hover:text-[#33DB98]"
                              }`}
                            >
                              {plan.subject}
                            </h4>
                            <div
                              className={`shrink-0 p-1.5 rounded-lg transition-all ${
                                selectedPlanIdx === idx
                                  ? "bg-[#33DB98] text-black scale-110"
                                  : "bg-[#33DB98] text-black opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
                              }`}
                            >
                              {selectedPlanIdx === idx ? (
                                <Check size={14} />
                              ) : (
                                <ArrowRight size={14} />
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 mt-0.5 uppercase font-bold ${
                                  selectedPlanIdx === idx
                                    ? "bg-[#33DB98]/20 text-[#33DB98]"
                                    : "bg-white/5 text-gray-500"
                                }`}
                              >
                                Target
                              </span>
                              <span
                                className={`text-xs line-clamp-1 ${
                                  selectedPlanIdx === idx
                                    ? "text-gray-300"
                                    : "text-gray-400"
                                }`}
                              >
                                {plan.targetAudience}
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 mt-0.5 uppercase font-bold ${
                                  selectedPlanIdx === idx
                                    ? "bg-[#33DB98]/20 text-[#33DB98]"
                                    : "bg-white/5 text-gray-500"
                                }`}
                              >
                                Message
                              </span>
                              <span
                                className={`text-xs line-clamp-2 leading-relaxed ${
                                  selectedPlanIdx === idx
                                    ? "text-gray-300"
                                    : "text-gray-400"
                                }`}
                              >
                                {plan.keyMessage}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {plan.keywords.map((kw, i) => (
                                <span
                                  key={i}
                                  className={`text-[10px] font-medium ${
                                    selectedPlanIdx === idx
                                      ? "text-[#33DB98]"
                                      : "text-[#33DB98]/70"
                                  }`}
                                >
                                  #{kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 트랙 2: 링크 분석 탭 */
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-5 animate-in fade-in duration-300">
            {/* YouTube Link */}
            <div>
              <label className="flex text-xs font-bold text-gray-400 mb-2.5 items-center gap-2">
                <span className="w-1 h-3 bg-red-500 rounded-full"></span> 유튜브
                링크로 자동 입력
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => handleYoutubeChange(e.target.value)}
                  placeholder="유튜브 주소를 입력하세요"
                  className="flex-1 min-w-0 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#33DB98] transition-all text-white placeholder:text-gray-600"
                />
                <button
                  onClick={handleYoutubeUrlAnalysis}
                  disabled={isGeneratingFromYoutube || !youtubeUrl.trim()}
                  className="shrink-0 bg-[#33DB98] hover:bg-[#33DB98]/90 disabled:bg-[#33DB98]/20 disabled:text-[#33DB98]/40 text-black px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap active:scale-95 flex items-center justify-center min-w-[60px]"
                >
                  {isGeneratingFromYoutube ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "분석"
                  )}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <label className="flex text-xs font-bold text-gray-400 mb-2.5 items-center gap-2">
                <span className="w-1 h-3 bg-green-500 rounded-full"></span>{" "}
                블로그 링크로 자동 입력
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={blogUrl}
                  onChange={(e) => handleBlogChange(e.target.value)}
                  placeholder="블로그 주소를 입력하세요"
                  className="flex-1 min-w-0 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#33DB98] transition-all text-white placeholder:text-gray-600"
                />
                <button
                  onClick={handleBlogUrlAnalysis}
                  disabled={isGeneratingFromBlog || !blogUrl.trim()}
                  className="shrink-0 bg-[#33DB98] hover:bg-[#33DB98]/90 disabled:bg-[#33DB98]/20 disabled:text-[#33DB98]/40 text-black px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap active:scale-95 flex items-center justify-center min-w-[60px]"
                >
                  {isGeneratingFromBlog ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "분석"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsManualEditExpanded(!isManualEditExpanded)}
          className="flex items-center gap-4 py-2 text-gray-500 w-full hover:text-gray-300 transition-colors group"
        >
          <div className="h-[1px] flex-1 bg-white/5 group-hover:bg-white/10"></div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest opacity-50 group-hover:opacity-80">
              직접 수정 또는 보완
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${isManualEditExpanded ? "rotate-180" : ""}`}
            />
          </div>
          <div className="h-[1px] flex-1 bg-white/5 group-hover:bg-white/10"></div>
        </button>

        {/* 직접 수정 영역 */}
        {isManualEditExpanded && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {showAutoFillMessage && (
              <div className="bg-[#33DB98]/10 border border-[#33DB98]/20 rounded-xl p-3 flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                <Sparkles size={14} className="text-[#33DB98]" />
                <p className="text-[11px] font-bold text-[#33DB98]">
                  분석 내용을 바탕으로 자동 완성되었습니다. 원한다면 자유롭게
                  수정해보세요 !
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-white mb-3">
                포스팅 주제
              </label>
              <input
                key={`subject-${highlightTrigger}`}
                type="text"
                value={subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                placeholder="주제를 입력하세요"
                className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#33DB98] transition-all text-white ${highlightTrigger > 0 ? "animate-glow-fade" : ""}`}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-3">
                타겟 독자
              </label>
              <input
                key={`target-${highlightTrigger}`}
                type="text"
                value={targetAudience}
                onChange={(e) => handleTargetAudienceChange(e.target.value)}
                placeholder="누구에게 필요한 글인가요?"
                className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#33DB98] transition-all text-white ${highlightTrigger > 0 ? "animate-glow-fade" : ""}`}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-3">
                핵심 메시지
              </label>
              <textarea
                key={`message-${highlightTrigger}`}
                value={keyMessage}
                onChange={(e) => handleKeyMessageChange(e.target.value)}
                placeholder="글을 통해 전달하고 싶은 가치는 무엇인가요?"
                className={`w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#33DB98] transition-all text-white placeholder:text-gray-600 resize-none leading-relaxed ${highlightTrigger > 0 ? "animate-glow-fade" : ""}`}
              />
            </div>

            <div>
              <label className="flex text-sm font-bold text-white mb-3 justify-between items-center">
                <span>
                  핵심 키워드{" "}
                  <span className="text-gray-500 font-normal ml-1">
                    최대 5개
                  </span>
                </span>
              </label>
              <div
                className={`flex flex-wrap gap-2 mb-4 min-h-[42px] p-2 bg-white/5 rounded-xl border border-dashed border-white/10 ${highlightTrigger > 0 ? "animate-glow-fade" : ""}`}
              >
                {keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-[#33DB98]/10 text-[#33DB98] border border-[#33DB98]/20"
                  >
                    #{keyword}
                    <button
                      onClick={() => removeKeyword(index)}
                      className="ml-2 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={keywordInput}
                onChange={handleKeywordChange}
                onKeyDown={handleKeywordKeyDown}
                placeholder="키워드 입력 (쉼표 또는 엔터)"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#33DB98] transition-all text-white"
                disabled={keywords.length >= 5}
              />
            </div>
          </div>
        )}
      </div>
    </AccordionItem>
  );
};

export default ContentPlanningSection;
