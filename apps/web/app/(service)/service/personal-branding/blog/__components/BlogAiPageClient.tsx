"use client";

import React, { useState, useEffect, useRef } from "react";
import {
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
import {
  getBlogPostHistories,
  saveBlogPostHistory,
  deleteBlogPostHistory,
} from "@/serverActions/blog/blog-storage.actions";
import { toast } from "sonner";

interface BlogAiPageContentProps {
  hideHeader?: boolean;
}

export const BlogAiPageContent: React.FC<BlogAiPageContentProps> = ({
  hideHeader = false,
}) => {
  const { formData, saveTemplate, setFullFormData } = useBlogForm();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [startedSteps, setStartedSteps] = useState<number[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
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
  const progressRef = useRef<HTMLDivElement>(null);

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

  // Load History from DB
  const refreshHistory = async () => {
    try {
      const data = await getBlogPostHistories();
      setHistory(data as any);
    } catch (e) {
      console.error("Failed to fetch history:", e);
    }
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  const saveToHistory = async (content: string, title?: string) => {
    try {
      await saveBlogPostHistory(
        title || `Blog Post - ${new Date().toLocaleTimeString()}`,
        content,
        formData,
      );
      await refreshHistory();
    } catch (error) {
      console.error("Failed to save history to DB:", error);
      toast.error("히스토리 저장에 실패했습니다.");
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      await deleteBlogPostHistory(id);
      await refreshHistory();
      toast.success("히스토리가 삭제되었습니다.");
    } catch (error) {
      console.error("Failed to delete history:", error);
      toast.error("히스토리 삭제에 실패했습니다.");
    }
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

  const handleRefineContent = async (request: string) => {
    if (!generatedContent || !request.trim()) return;

    setIsRefining(true);
    setError("");

    try {
      const response = await fetch("/api/blog/refine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentContent: generatedContent,
          refineRequest: request,
          formData,
        }),
      });

      if (!response.ok) {
        throw new Error("글 수정 실패");
      }

      const data = await response.json();
      if (data.success && data.updatedContent) {
        setGeneratedContent(data.updatedContent);
        toast.success("AI가 요청하신 대로 글을 수정했습니다.");
        // 수정된 내용 히스토리에 저장
        saveToHistory(
          data.updatedContent,
          selectedTitle || formData.contentPlanning.subject,
        );
      } else {
        throw new Error(data.error || "글 수정 실패");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      toast.error("글 수정 중 오류가 발생했습니다.");
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerateBlog = async () => {
    setIsGenerating(true);
    setCurrentStep(0);
    setStartedSteps([]);
    setCompletedSteps([]);
    setGeneratedContent("");
    setError("");

    // 생성이 시작되면 진행 상황 영역으로 부드럽게 스크롤
    progressRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

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
                    setStartedSteps((prev) =>
                      Array.from(new Set([...prev, data.step])),
                    );
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
                    if (data.placeholder === "[DIRECTOR_PHOTO_PLACEHOLDER]") {
                      setCompletedSteps((prev) => [...prev, 5]);
                    }
                  } else if (data.type === "gif-result") {
                    const gifHtml = data.urls
                      .map(
                        (url: string) =>
                          `<img src="${url}" alt="GIF" style="width: 100%; max-width: 600px; margin: 20px auto; display: block; border-radius: 8px;" />`,
                      )
                      .join("");
                    setGeneratedContent((prev) => gifHtml + prev);
                    finalContent = gifHtml + finalContent;
                    setCompletedSteps((prev) => [...prev, 4]);
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
                setStartedSteps((prev) =>
                  Array.from(new Set([...prev, data.step])),
                );
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
                if (data.placeholder === "[DIRECTOR_PHOTO_PLACEHOLDER]") {
                  setCompletedSteps((prev) => [...prev, 5]);
                }
              } else if (data.type === "gif-result") {
                const gifHtml = data.urls
                  .map(
                    (url: string) =>
                      `<img src="${url}" alt="GIF" style="width: 100%; max-width: 600px; margin: 20px auto; display: block; border-radius: 8px;" />`,
                  )
                  .join("");
                setGeneratedContent((prev) => gifHtml + prev);
                finalContent = gifHtml + finalContent;
                setCompletedSteps((prev) => [...prev, 4]);
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
      className={`${hideHeader ? "" : "min-h-screen bg-vzx-bg/80"} relative text-white selection:bg-[#33DB98] selection:text-black`}
    >
      {/* 
        입력 패널과 오버레이를 최상위 계층으로 이동 
        레이아웃의 사이드바/헤더에 가려지는 문제를 해결하기 위해 
        z-index를 최상위급으로 설정하고 애니메이션 컨테이너 바깥에 배치
      */}
      {isLeftPanelCollapsed && isLeftPanelExpanded && (
        <>
          <div
            onClick={handleCollapsePanel}
            className="fixed inset-0 z-[9998]"
            aria-hidden="true"
          />
          <div className="fixed top-0 left-0 h-screen w-[400px] max-w-[400px] bg-vzx-card z-[9999] shadow-2xl overflow-y-auto translate-x-0 transition-transform duration-300 ease-in-out py-8 px-4 border-r border-white/10">
            <button
              onClick={handleCollapsePanel}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors z-50"
              aria-label="입력 영역 접기"
            >
              <ChevronRight size={16} className="rotate-180" />
            </button>
            <WritingTypeSelector />
            <div className="space-y-4">
              <BrandingSection />
              <ContentPlanningSection />
              <StepOptions />
              <StepDetails />
              <StepGif />
              <StepPhoto />
            </div>
            <div className="flex flex-col gap-3 bg-vzx-card pb-4 pt-2 rounded-2xl p-4 border border-white/5 mt-8">
              <div className="flex gap-3">
                <button
                  onClick={handleGenerateBlog}
                  disabled={isGenerating}
                  className="flex-1 bg-[#33DB98] hover:bg-[#33DB98]/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-black py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#33DB98]/10 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99] hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                >
                  <Rocket size={20} />{" "}
                  {isGenerating ? "생성 중..." : "생성하기"}
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
                    생성된 이미지는 30일 동안 보관됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div
        className={`${hideHeader ? "" : "container mx-auto p-6 max-w-5xl space-y-8 animate-fade-in"}`}
      >
        {/* Page Title & Hero */}
        {!hideHeader && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                {/* <div className="p-3 bg-vzx-card rounded-2xl border border-white/5 text-[#33DB98]">
                  <PenTool size={32} />
                </div> */}
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    블로그 포스트 작성
                  </h1>
                  <p className="text-gray-400 font-medium">
                    아이디어만으로 전문적인 블로그 포스트를 작성해보세요.
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
              <div className="flex gap-2 self-end justify-end">
                {/* <div className="bg-[#33DB98]/10 text-[#33DB98] px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1.5 border border-[#33DB98]/20">
                  🎫 보유 크레딧: 3.0
                </div> */}
                <TemplateManager />
                <HistoryManager
                  history={history}
                  onLoad={(item) => {
                    setGeneratedContent(item.content);
                    setSelectedTitle(item.title);
                    setIsLeftPanelCollapsed(true);

                    // 과거 생성 당시의 formData가 있다면 복원
                    const itemAny = item as any;
                    if (itemAny.formData) {
                      try {
                        const savedFormData =
                          typeof itemAny.formData === "string"
                            ? JSON.parse(itemAny.formData)
                            : itemAny.formData;

                        setFullFormData(savedFormData);
                        toast.success("당시 입력 설정을 불러왔습니다.");
                      } catch (e) {
                        console.error("Failed to restore history formData:", e);
                      }
                    }
                  }}
                  onDelete={deleteHistoryItem}
                />
              </div>
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div
          className={`flex flex-col lg:grid gap-8 items-start relative ${
            isLeftPanelCollapsed ? "lg:grid-cols-1" : "lg:grid-cols-3"
          }`}
        >
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

          {/* A 영역: 입력 영역 (일반 모드일 때만 표시) */}
          {!isLeftPanelCollapsed && (
            <div className="space-y-8 w-full lg:col-span-2">
              <WritingTypeSelector />
              <div className="space-y-4">
                <BrandingSection />
                <ContentPlanningSection />
                <StepOptions />
                <StepDetails />
                <StepGif />
                <StepPhoto />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 bg-vzx-card pb-4 pt-2 rounded-2xl p-4 border border-white/5 mt-8">
                <div className="flex gap-3">
                  <button
                    onClick={handleGenerateBlog}
                    disabled={isGenerating}
                    className="flex-1 bg-[#33DB98] hover:bg-[#33DB98]/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-black py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#33DB98]/10 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99] hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Rocket size={20} />{" "}
                    {isGenerating ? "생성 중..." : "생성하기"}
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
                      생성된 이미지는 30일 동안 보관됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B + C 영역: 템플릿/제목/본문 + 통계 */}
          <div className="w-full" ref={progressRef}>
            <ProgressTracker
              currentStep={currentStep}
              startedSteps={startedSteps}
              completedSteps={completedSteps}
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
              onRefineContent={handleRefineContent}
              isRefining={isRefining}
            />
          </div>
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
