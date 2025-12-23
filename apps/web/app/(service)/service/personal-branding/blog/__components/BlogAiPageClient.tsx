"use client";

import React, { useState, useEffect } from "react";
import {
  PenTool,
  Search,
  Palette,
  Brain,
  Rocket,
  Save,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { BlogFormProvider, useBlogForm } from "./BlogFormContext";
import BrandingSection from "./BrandingSection";
import ContentPlanningSection from "./ContentPlanningSection";
import StepOptions from "./StepOptions";
import StepDetails from "./StepDetails";
import StepGif from "./StepGif";
import StepPhoto from "./StepPhoto";
import RightPanel from "./RightPanel";
import WritingTypeSelector from "./WritingTypeSelector";
import ProgressTracker from "./ProgressTracker";
import TemplateManager from "./TemplateManager";
import HistoryManager, { HistoryItem } from "./HistoryManager";
import { v4 as uuidv4 } from "uuid";

interface BlogAiPageContentProps {
  hideHeader?: boolean;
}

export const BlogAiPageContent: React.FC<BlogAiPageContentProps> = ({
  hideHeader = false,
}) => {
  const { formData, saveTemplate } = useBlogForm();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedContent, setGeneratedContent] = useState("");
  const [error, setError] = useState("");

  // 제목 생성 관련 상태
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Left Panel Collapse State
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isLeftPanelExpanded, setIsLeftPanelExpanded] = useState(false); // 확장 버튼으로 열린 상태

  // Auto-collapse when generation is complete
  useEffect(() => {
    if (!isGenerating && generatedContent) {
      setIsLeftPanelCollapsed(true);
      setIsLeftPanelExpanded(false);
    }
  }, [isGenerating, generatedContent]);

  const handleExpandPanel = () => {
    setIsLeftPanelExpanded(true);
  };

  const handleCollapsePanel = () => {
    setIsLeftPanelExpanded(false);
  };

  // Load History on Mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("blog-generation-history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history:", e);
      }
    }
  }, []);

  const saveToHistory = (content: string, title?: string) => {
    const newItem: HistoryItem = {
      id: uuidv4(),
      timestamp: Date.now(),
      title: title || `Blog Post - ${new Date().toLocaleTimeString()}`,
      content: content,
    };

    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(
      "blog-generation-history",
      JSON.stringify(updatedHistory),
    );
  };

  const deleteHistoryItem = (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(
      "blog-generation-history",
      JSON.stringify(updatedHistory),
    );
  };

  // 제목 생성 함수
  const handleGenerateTitles = async () => {
    setIsGeneratingTitles(true);
    setGeneratedTitles([]);
    setSelectedTitle("");
    setError("");

    try {
      const response = await fetch("/api/blog/generate-titles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("제목 생성 실패");
      }

      const data = await response.json();

      if (data.success && data.titles) {
        setGeneratedTitles(data.titles);
        if (data.titles.length > 0) {
          setSelectedTitle(data.titles[0]); // 첫 번째 제목 자동 선택
        }
      } else {
        throw new Error(data.error || "제목 생성 실패");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const handleGenerateBlog = async () => {
    setIsGenerating(true);
    setCurrentStep(0);
    setGeneratedContent("");
    setError("");

    // 생성이 시작되면 페이지 최상단으로 부드럽게 스크롤
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const response = await fetch("/api/blog/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("포스트 생성 실패");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("리더 없음");
      }

      let buffer = "";
      let finalContent = ""; // To accumulate content for saving

      while (true) {
        const { done, value } = await reader.read();

        if (value) {
          buffer += decoder.decode(value, { stream: true });
        }

        if (done) {
          // Process any remaining buffer
          if (buffer.trim()) {
            const lines = buffer.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === "progress") {
                    setCurrentStep(data.step);
                  } else if (data.type === "content") {
                    setGeneratedContent((prev) => prev + data.content);
                    finalContent += data.content;
                  } else if (data.type === "image-data") {
                    setGeneratedContent((prev) =>
                      prev.replace(data.placeholder, data.imageUrl),
                    );
                    finalContent = finalContent.replace(
                      data.placeholder,
                      data.imageUrl,
                    );
                  } else if (data.type === "gif-result") {
                    const gifHtml = data.urls
                      .map(
                        (url: string) =>
                          `<img src="${url}" alt="GIF" style="width: 100%; max-width: 600px; margin: 20px auto; display: block; border-radius: 8px;" />`,
                      )
                      .join("");
                    setGeneratedContent((prev) => gifHtml + prev);
                    finalContent = gifHtml + finalContent;
                  } else if (data.type === "done") {
                    setCurrentStep(6);
                    setIsGenerating(false);
                    // Save to history when done
                    saveToHistory(
                      finalContent,
                      selectedTitle || formData.contentPlanning.subject,
                    );
                  } else if (data.type === "error") {
                    setError(data.message);
                    setIsGenerating(false);
                  }
                } catch (e) {
                  console.error("JSON Parse Error (Final):", e);
                }
              }
            }
          }
          break;
        }

        const lines = buffer.split("\n");
        // Keep the last part in the buffer as it might be incomplete
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "") continue;

          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "progress") {
                setCurrentStep(data.step);
              } else if (data.type === "content") {
                setGeneratedContent((prev) => prev + data.content);
                finalContent += data.content;
              } else if (data.type === "image-data") {
                setGeneratedContent((prev) =>
                  prev.replace(data.placeholder, data.imageUrl),
                );
                finalContent = finalContent.replace(
                  data.placeholder,
                  data.imageUrl,
                );
              } else if (data.type === "gif-result") {
                const gifHtml = data.urls
                  .map(
                    (url: string) =>
                      `<img src="${url}" alt="GIF" style="width: 100%; max-width: 600px; margin: 20px auto; display: block; border-radius: 8px;" />`,
                  )
                  .join("");
                setGeneratedContent((prev) => gifHtml + prev);
                finalContent = gifHtml + finalContent;
              } else if (data.type === "done") {
                setCurrentStep(6);
                setIsGenerating(false);
                // Save to history when done
                saveToHistory(
                  finalContent,
                  selectedTitle || formData.contentPlanning.subject,
                );
              } else if (data.type === "error") {
                setError(data.message);
                setIsGenerating(false);
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks (should normally be handled by buffering logic,
              // but helpful for debugging if a line is malformed)
              console.error("JSON Parse Error:", e);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      setIsGenerating(false);
    }
  };

  const handleSaveTemplate = () => {
    const name = prompt("템플릿 이름을 입력하세요:");
    if (name && name.trim()) {
      saveTemplate(name.trim());
      alert("템플릿이 저장되었습니다!");
    }
  };

  return (
    <div
      className={`${hideHeader ? "" : "min-h-screen bg-[#0A0A0A]"} relative text-white`}
    >
      {/* Current State */}
      {/* <CurrentState /> */}
      {/* Page Title & Hero */}
      {!hideHeader && (
        <div className="bg-[#0A0A0A] border-b border-white/5 px-4 py-8 lg:px-8 relative z-[30]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 max-w-screen-xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-vzx-card rounded-2xl border border-white/5 text-[#33DB98]">
                <PenTool size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  블로그 AI
                </h1>
                <p className="text-gray-400 font-medium">
                  전문적인 블로그 글을 AI가 작성해드립니다
                </p>
                <div className="flex flex-wrap gap-4 mt-3 text-xs font-medium text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="text-[#33DB98]">★</span> 고품질 콘텐츠
                  </span>
                  <span className="flex items-center gap-1">
                    <Search size={12} className="text-[#33DB98]" /> SEO 최적화
                  </span>
                  <span className="flex items-center gap-1">
                    <Palette size={12} className="text-[#33DB98]" /> 다양한
                    톤앤매너
                  </span>
                  <span className="flex items-center gap-1">
                    <Brain size={12} className="text-[#33DB98]" /> 맞춤형 구조
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 self-end md:self-center">
              <div className="bg-[#33DB98]/10 text-[#33DB98] px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1.5 border border-[#33DB98]/20">
                🎫 보유 크레딧: 3.0
              </div>
              {/* Template Manager */}
              <TemplateManager />
              {/* History Manager */}
              <HistoryManager
                history={history}
                onLoad={(item) => {
                  setGeneratedContent(item.content);
                  setSelectedTitle(item.title);
                  setIsLeftPanelCollapsed(true);
                }}
                onDelete={deleteHistoryItem}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div
        className={`flex flex-col lg:grid gap-8 items-start py-8 relative ${
          hideHeader ? "w-full px-0" : "max-w-screen-xl mx-auto px-4"
        } ${isLeftPanelCollapsed ? "lg:grid-cols-1" : "lg:grid-cols-3"}`}
      >
        {/* Overlay (when A is expanded as absolute) */}
        {isLeftPanelCollapsed && isLeftPanelExpanded && (
          <div
            onClick={handleCollapsePanel}
            className="fixed inset-0 bg-black/60 z-40 lg:block hidden backdrop-blur-sm"
            aria-hidden="true"
          />
        )}

        {/* Expand Button (shown when A is collapsed) */}
        {isLeftPanelCollapsed && !isLeftPanelExpanded && (
          <button
            onClick={handleExpandPanel}
            className="fixed left-[240px] top-1/2 -translate-y-1/2 z-[45] bg-[#33DB98] hover:bg-[#33DB98]/90 text-black p-3 rounded-full shadow-lg transition-all hover:scale-110 flex items-center gap-2 pr-5 font-bold ml-6"
            aria-label="입력 영역 펼치기"
          >
            <ChevronRight size={20} />
            <span className="text-sm font-bold">입력 내용 확인</span>
          </button>
        )}

        {/* A 영역: 입력 영역 */}
        <div
          className={`space-y-8 w-full transition-all duration-300 ${
            isLeftPanelCollapsed
              ? isLeftPanelExpanded
                ? // 접혀있지만 확장 버튼으로 열린 상태: absolute로 슬라이드
                  "hidden lg:block lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:w-[400px] lg:max-w-[400px] lg:bg-vzx-card lg:z-40 lg:shadow-2xl lg:overflow-y-auto lg:translate-x-0 lg:transition-transform lg:duration-300 lg:ease-in-out lg:py-8 lg:px-4 lg:border-r lg:border-white/10"
                : // 접혀있고 닫힌 상태: 숨김
                  "hidden lg:block lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:w-[400px] lg:max-w-[400px] lg:bg-vzx-card lg:z-40 lg:shadow-2xl lg:overflow-y-auto lg:-translate-x-full lg:transition-transform lg:duration-300 lg:ease-in-out lg:py-8 lg:px-4 lg:border-r lg:border-white/10"
              : // 초기 상태: 일반 레이아웃
                "block"
          }`}
        >
          {/* Close Button (A 영역이 absolute로 열려있을 때) */}
          {isLeftPanelCollapsed && isLeftPanelExpanded && (
            <button
              onClick={handleCollapsePanel}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors z-50"
              aria-label="입력 영역 접기"
            >
              <ChevronRight size={16} className="rotate-180" />
            </button>
          )}
          {/* Writing Type Selection */}
          <WritingTypeSelector />

          {/* Steps Accordions */}
          <div className="space-y-4">
            <BrandingSection />
            <ContentPlanningSection />
            <StepOptions />
            <StepDetails />
            <StepGif />
            <StepPhoto />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 bg-[#121212] pb-4 pt-2 rounded-2xl p-4 border border-white/5 mt-8">
            <div className="flex gap-3">
              <button
                onClick={handleGenerateBlog}
                disabled={isGenerating}
                className="flex-1 bg-[#33DB98] hover:bg-[#33DB98]/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-black py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#33DB98]/10 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99] hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
              >
                <Rocket size={20} /> {isGenerating ? "생성 중..." : "생성하기"}
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-6 border border-white/10 hover:bg-white/5 bg-vzx-card text-white rounded-xl font-bold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Save size={20} /> 템플릿 저장
              </button>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-3 items-start">
              <AlertTriangle
                size={16}
                className="text-yellow-500 mt-0.5 shrink-0"
              />
              <div className="text-xs text-yellow-500/80 leading-relaxed">
                <p className="font-bold mb-1 text-yellow-500">
                  생성된 이미지는 30일 동안 보관되며, 그 이후에는 다운로드
                  받으실 수 없으니, 필요한 이미지의 경우 미리 다운로드를 통해
                  저장 부탁드립니다.
                </p>
                <p>
                  html로 다운로드한 파일도 동일하게 적용되오니 유의해 주세요.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* B + C 영역: 템플릿/제목/본문 + 통계 */}
        <div className="w-full lg:col-span-2">
          <ProgressTracker
            currentStep={currentStep}
            isGenerating={isGenerating}
          />
          <RightPanel
            generatedContent={generatedContent}
            isGenerating={isGenerating}
            error={error}
            generatedTitles={generatedTitles}
            isGeneratingTitles={isGeneratingTitles}
            selectedTitle={selectedTitle}
            onSelectTitle={setSelectedTitle}
            onGenerateTitles={handleGenerateTitles}
            isLeftPanelCollapsed={isLeftPanelCollapsed}
          />
        </div>
      </div>
    </div>
  );
};

const BlogAiPageClient: React.FC = () => {
  return (
    <BlogFormProvider>
      <BlogAiPageContent />
    </BlogFormProvider>
  );
};

export default BlogAiPageClient;
