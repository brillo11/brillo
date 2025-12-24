"use client";

import React, { useState, useEffect, useRef } from "react";
import { useBlogForm } from "./BlogFormContext";
import AccordionItem from "./AccordionItem";
import { Search, Link, FileText, Loader2, Sparkles } from "lucide-react";
import { analyzeStyleFromSource } from "@/serverActions/blog/keyword-search";

const StepDetails: React.FC = () => {
  const { formData, updateFormData } = useBlogForm();
  const [length, setLength] = useState(formData.details.length);
  const [styleText, setStyleText] = useState(formData.details.styleText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 자동 높이 조절 함수
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const [analysisType, setAnalysisType] = useState<
    "MANUAL" | "URL" | "KEYWORD"
  >("MANUAL");
  const [urlInput, setUrlInput] = useState(formData.details.referenceUrl || "");
  const [keywordInput, setKeywordInput] = useState(
    formData.details.referenceKeyword || "",
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sync local states when formData changes
  useEffect(() => {
    setLength(formData.details.length);
    setStyleText(formData.details.styleText);
    setUrlInput(formData.details.referenceUrl || "");
    setKeywordInput(formData.details.referenceKeyword || "");
  }, [formData.details]);

  // styleText가 변경될 때마다 높이 조절
  useEffect(() => {
    adjustHeight();
  }, [styleText]);

  const handleLengthChange = (newLength: string) => {
    setLength(newLength);
    updateFormData("details", { ...formData.details, length: newLength });
  };

  const handleStyleTextChange = (value: string) => {
    setStyleText(value);
    updateFormData("details", { ...formData.details, styleText: value });
  };

  const handleUrlChange = (value: string) => {
    setUrlInput(value);
    updateFormData("details", (prev: any) => ({
      ...prev,
      referenceUrl: value,
    }));
  };

  const handleKeywordChange = (value: string) => {
    setKeywordInput(value);
    updateFormData("details", (prev: any) => ({
      ...prev,
      referenceKeyword: value,
    }));
  };

  const handleAnalyze = async () => {
    const source = analysisType === "URL" ? urlInput : keywordInput;
    if (!source.trim()) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeStyleFromSource(
        analysisType as "URL" | "KEYWORD",
        source,
      );
      if (result.success && result.styleAnalysis) {
        handleStyleTextChange(result.styleAnalysis);
        updateFormData("details", (prev: any) => ({
          ...prev,
          styleText: result.styleAnalysis,
          referenceUrl: analysisType === "URL" ? urlInput : prev.referenceUrl,
          referenceKeyword:
            analysisType === "KEYWORD" ? keywordInput : prev.referenceKeyword,
          styleAnalysisResult: result.styleAnalysis,
        }));
        alert("스타일 분석이 완료되었습니다!");
      } else {
        alert(result.error || "분석에 실패했습니다.");
      }
    } catch (error) {
      console.error("스타일 분석 중 오류:", error);
      alert("분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AccordionItem title="3단계: 글의 세부 설정" defaultOpen={true}>
      <div className="space-y-6">
        {/* Length */}
        <div>
          <label className="block text-sm font-bold text-white mb-4">
            글 길이
          </label>
          <div className="flex gap-4">
            {["500자", "1000자", "2000자"].map((val) => (
              <label
                key={val}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl border transition-all cursor-pointer ${
                  length === val
                    ? "bg-[#33DB98]/10 border-[#33DB98] text-[#33DB98]"
                    : "bg-white/5 border-white/5 text-gray-400 hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="length"
                  checked={length === val}
                  onChange={() => handleLengthChange(val)}
                  className="hidden"
                />
                <span className="text-sm font-bold">{val}</span>
              </label>
            ))}
          </div>
        </div>

        <hr className="border-white/5" />

        {/* Style Reference Analysis Options */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-white mb-3">
            글 스타일 분석 및 적용
          </label>

          <div className="grid grid-cols-3 gap-0 p-1 bg-black/40 rounded-xl border border-white/5">
            <button
              onClick={() => setAnalysisType("MANUAL")}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                analysisType === "MANUAL"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <FileText size={14} /> 직접 입력
            </button>
            <button
              onClick={() => setAnalysisType("URL")}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                analysisType === "URL"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Link size={14} /> 특정 블로그
            </button>
            <button
              onClick={() => setAnalysisType("KEYWORD")}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all break-keep ${
                analysisType === "KEYWORD"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Search size={14} /> 키워드 인기글
            </button>
          </div>

          {analysisType !== "MANUAL" && (
            <>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    {analysisType === "URL" ? (
                      <Link size={16} className="text-gray-500" />
                    ) : (
                      <Search size={16} className="text-gray-500" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={analysisType === "URL" ? urlInput : keywordInput}
                    onChange={(e) =>
                      analysisType === "URL"
                        ? handleUrlChange(e.target.value)
                        : handleKeywordChange(e.target.value)
                    }
                    placeholder={
                      analysisType === "URL"
                        ? "분석할 블로그 주소(Home) 또는 ID를 입력하세요"
                        : "스타일을 벤치마킹할 키워드를 입력하세요"
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#33DB98]/50 transition-colors"
                  />
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={
                    isAnalyzing ||
                    !(analysisType === "URL" ? urlInput : keywordInput).trim()
                  }
                  className="bg-[#33DB98] hover:bg-[#28a87a] disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold px-4 rounded-xl transition-all flex items-center gap-2 shrink-0"
                >
                  {isAnalyzing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  <span className="text-sm">분석</span>
                </button>
              </div>
              {analysisType === "URL" ? (
                <p className="text-xs text-gray-500 leading-relaxed -mt-2 px-2">
                  예시) https://blog.naver.com/itedu119
                </p>
              ) : (
                <p className="text-xs text-gray-500 leading-relaxed -mt-2 px-2"></p>
              )}
            </>
          )}
        </div>

        {/* Style Reference Textarea */}
        <div className="pt-2">
          <label className="text-sm font-bold text-gray-400 mb-3 flex items-center justify-between">
            <span>참고 스타일 가이드</span>
            {styleText && (
              <span className="text-[10px] bg-[#33DB98]/10 text-[#33DB98] px-2 py-0.5 rounded-full font-bold">
                분석 완료
              </span>
            )}
          </label>
          <textarea
            ref={textareaRef}
            value={styleText}
            onChange={(e) => handleStyleTextChange(e.target.value)}
            className="w-full min-h-[128px] p-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#33DB98]/50 focus:border-[#33DB98] text-sm leading-relaxed text-gray-300 placeholder:text-gray-600 transition-all resize-none overflow-hidden"
            placeholder="참고할 글의 스타일이나 특징을 입력해주세요. (위의 분석 기능을 사용하면 자동으로 채워집니다)"
          />
          <p className="mt-2 text-[11px] text-gray-500 leading-relaxed">
            * AI가 이 가이드를 분석하여 말투, 문장 구조, 분위기를 최대한
            비슷하게 재현합니다.
          </p>
        </div>
      </div>
    </AccordionItem>
  );
};

export default StepDetails;
