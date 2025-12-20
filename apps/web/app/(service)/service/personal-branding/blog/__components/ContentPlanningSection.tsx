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
} from "lucide-react";
import {
  searchBlogPosts,
  BlogPost,
  generateContentPlansFromKeywords,
} from "@/serverActions/blog/blog-keyword-search";

interface GeneratedPlan {
  subject: string;
  targetAudience: string;
  keyMessage: string;
  keywords: string[];
}

const ContentPlanningSection: React.FC = () => {
  const { formData, updateFormData } = useBlogForm();

  // 기본 입력 필드 상태
  const [youtubeUrl, setYoutubeUrl] = useState(
    formData.contentPlanning.youtubeUrl
  );
  const [blogUrl, setBlogUrl] = useState(formData.contentPlanning.blogUrl);
  const [subject, setSubject] = useState(formData.contentPlanning.subject);
  const [targetAudience, setTargetAudience] = useState(
    formData.contentPlanning.targetAudience
  );
  const [keyMessage, setKeyMessage] = useState(
    formData.contentPlanning.keyMessage
  );
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>(
    formData.contentPlanning.keywords || []
  );

  // 상위 노출 분석 및 AI 기획 관련 상태
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearchingBlogs, setIsSearchingBlogs] = useState(false);
  const [blogResults, setBlogResults] = useState<BlogPost[]>([]);
  const [isGeneratingPlans, setIsGeneratingPlans] = useState(false);
  const [generatedPlans, setGeneratedPlans] = useState<GeneratedPlan[]>([]);
  const [selectedBlogIdx, setSelectedBlogIdx] = useState<number | null>(null);

  // Sync local states when formData changes
  useEffect(() => {
    setYoutubeUrl(formData.contentPlanning.youtubeUrl);
    setBlogUrl(formData.contentPlanning.blogUrl);
    setSubject(formData.contentPlanning.subject);
    setTargetAudience(formData.contentPlanning.targetAudience);
    setKeyMessage(formData.contentPlanning.keyMessage);
    setKeywords(formData.contentPlanning.keywords || []);
  }, [formData.contentPlanning]);

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

  // 1. 블로그 상위 노출 분석 검색
  const handleBlogAnalysis = async () => {
    if (!searchKeyword.trim()) return;
    setIsSearchingBlogs(true);
    setBlogResults([]);
    setGeneratedPlans([]);
    setSelectedBlogIdx(null);
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
    blogKeywords: string[]
  ) => {
    setSelectedBlogIdx(idx);
    setIsGeneratingPlans(true);
    setGeneratedPlans([]);
    try {
      const result = await generateContentPlansFromKeywords(blogKeywords);
      if (result.success) {
        setGeneratedPlans(result.plans);
      }
    } catch (error) {
      console.error("기획안 생성 오류:", error);
    } finally {
      setIsGeneratingPlans(false);
    }
  };

  // 3. 기획안 최종 선택 및 적용
  const applyContentPlan = (plan: GeneratedPlan) => {
    setSubject(plan.subject);
    setTargetAudience(plan.targetAudience);
    setKeyMessage(plan.keyMessage);
    setKeywords(plan.keywords);

    updateFormData("contentPlanning", {
      ...formData.contentPlanning,
      subject: plan.subject,
      targetAudience: plan.targetAudience,
      keyMessage: plan.keyMessage,
      keywords: plan.keywords,
    });

    // 적용 후 추천 결과 초기화 (선택 사항)
    // setGeneratedPlans([]);
    // setBlogResults([]);
    // setSearchKeyword("");
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
        new Set([...keywords, ...completedKeywords])
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
    <AccordionItem title="1단계: 글의 뼈대 세우기" defaultOpen={true}>
      <div className="space-y-6">
        {/* [NEW] AI 추천 기획 섹션 (최상단) */}
        <div className="bg-[#0D1512]/50 border border-[#33DB98]/20 rounded-2xl p-6 shadow-xl shadow-[#33DB98]/5">
          <label className="flex text-base font-bold text-[#33DB98] mb-4 items-center gap-2">
            <Sparkles size={20} className="animate-pulse" /> AI 상위 노출 전략
            기획
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
                  <TrendingUp size={14} className="text-[#33DB98]" /> 1. 상위
                  노출 블로그 키워드 (클릭하여 기획 생성)
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                {blogResults.map(
                  (post, idx) =>
                    post.keywords &&
                    post.keywords.length > 0 && (
                      <button
                        key={idx}
                        onClick={() =>
                          handleSelectBlogAndGeneratePlans(idx, post.keywords!)
                        }
                        className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
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
                          {selectedBlogIdx === idx && (
                            <Check size={12} className="text-[#33DB98]" />
                          )}
                        </div>
                      </button>
                    )
                )}
              </div>
            </div>
          )}

          {/* Step 2: AI 기획안 결과 */}
          {(isGeneratingPlans || generatedPlans.length > 0) && (
            <div className="mt-8 pt-6 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <p className="text-xs text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles size={14} className="text-[#33DB98]" /> 2. AI 추천
                글쓰기 기획안
              </p>

              {isGeneratingPlans ? (
                <div className="flex flex-col items-center py-10 space-y-3">
                  <Loader2 size={32} className="animate-spin text-[#33DB98]" />
                  <p className="text-sm text-gray-400 animate-pulse">
                    최적의 블로그 기획안을 생성 중입니다...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {generatedPlans.map((plan, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyContentPlan(plan)}
                      className="w-full text-left p-5 rounded-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-[#33DB98]/50 hover:from-[#33DB98]/10 hover:to-transparent transition-all group relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-white group-hover:text-[#33DB98] transition-colors leading-snug">
                          {plan.subject}
                        </h4>
                        <div className="shrink-0 p-1.5 bg-[#33DB98] text-black rounded-lg opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                          <ArrowRight size={14} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] bg-white/5 text-gray-500 px-1.5 py-0.5 rounded shrink-0 mt-0.5 uppercase font-bold">
                            Target
                          </span>
                          <span className="text-xs text-gray-400 line-clamp-1">
                            {plan.targetAudience}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] bg-white/5 text-gray-500 px-1.5 py-0.5 rounded shrink-0 mt-0.5 uppercase font-bold">
                            Message
                          </span>
                          <span className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                            {plan.keyMessage}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {plan.keywords.map((kw, i) => (
                            <span
                              key={i}
                              className="text-[10px] text-[#33DB98]/70 font-medium"
                            >
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 p-2 bg-[#33DB98]/10 text-[#33DB98] text-[9px] font-black rounded-bl-xl opacity-50">
                        OPTION {idx + 1}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 py-2">
          <div className="h-[1px] flex-1 bg-white/5"></div>
          <span className="text-[13px] text-gray-400 font-black uppercase tracking-widest">
            or manually input below
          </span>
          <div className="h-[1px] flex-1 bg-white/5"></div>
        </div>

        {/* YouTube Link */}

        <div>
          <label className="flex text-sm font-bold text-white mb-3 items-center gap-2">
            <span className="w-1 h-3 bg-red-500 rounded-full"></span> 유튜브
            링크로 자동 입력
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => handleYoutubeChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#33DB98]/30 transition-all text-white"
            />
            <button className="bg-[#33DB98] hover:bg-[#33DB98]/90 text-black px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap active:scale-95">
              자동 입력
            </button>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex text-sm font-bold text-white mb-3 items-center gap-2">
            <span className="w-1 h-3 bg-green-500 rounded-full"></span> 블로그
            링크로 자동 입력
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={blogUrl}
              onChange={(e) => handleBlogChange(e.target.value)}
              placeholder="https://blog.naver.com/계정명/글번호"
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#33DB98]/30 transition-all text-white"
            />
            <button className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-6 py-3 rounded-xl text-sm font-bold transition-all border border-emerald-500/30 active:scale-95">
              확인
            </button>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-bold text-white mb-3">
            포스팅 주제
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            placeholder="예: 임플란트 수명 늘리는 법, 목 디스크와 거북목 증후군 차이"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#33DB98] transition-all text-white"
          />
        </div>

        {/* Target Audience */}
        <div className="pt-2">
          <label className="block text-sm font-bold text-white mb-3">
            타겟 독자
          </label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => handleTargetAudienceChange(e.target.value)}
            placeholder="예: 40-50대 남성 직장인, 자녀의 충치 때문에 걱정인 30대 부모"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#33DB98] transition-all text-white"
          />
        </div>

        {/* Key Message */}
        <div className="pt-2">
          <label className="block text-sm font-bold text-white mb-3">
            핵심 메시지 및 강조점
          </label>
          <textarea
            value={keyMessage}
            onChange={(e) => handleKeyMessageChange(e.target.value)}
            placeholder="예: 임플란트는 초기 관리만 잘하면 반영구적으로 쓸 수 있다는 점을 강조해 줘"
            className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#33DB98] transition-all text-white placeholder:text-gray-600 resize-none leading-relaxed"
          />
        </div>

        {/* Keywords */}
        <div className="pt-2">
          <label className="flex text-sm font-bold text-white mb-3 justify-between items-center">
            <span>
              핵심 키워드{" "}
              <span className="text-gray-500 font-normal ml-1">최대 5개</span>
            </span>
            {keywords.length > 0 && (
              <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full border border-white/5">
                {keywords.length}/5
              </span>
            )}
          </label>

          <div className="flex flex-wrap gap-2 mb-4 min-h-[42px] p-2 bg-white/5 rounded-xl border border-dashed border-white/10">
            {keywords.length > 0 ? (
              keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-[#33DB98]/10 text-[#33DB98] border border-[#33DB98]/20"
                >
                  #{keyword}
                  <button
                    onClick={() => removeKeyword(index)}
                    className="ml-2 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-600 self-center ml-2">
                선택된 키워드가 없습니다.
              </span>
            )}
          </div>

          <input
            type="text"
            value={keywordInput}
            onChange={handleKeywordChange}
            onKeyDown={handleKeywordKeyDown}
            placeholder={
              keywords.length >= 5
                ? "최대 개수에 도달했습니다"
                : "직접 입력 (쉼표 또는 엔터)"
            }
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#33DB98] transition-all text-white"
            disabled={keywords.length >= 5}
          />
        </div>
      </div>
    </AccordionItem>
  );
};

export default ContentPlanningSection;
