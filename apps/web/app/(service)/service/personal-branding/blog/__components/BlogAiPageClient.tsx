"use client";

import React, { useState, useEffect } from "react";
import {
  PenTool,
  Search,
  Palette,
  Brain,
  History,
  Rocket,
  Save,
  AlertTriangle,
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
import CurrentState from "./CurrentState";
import ProgressTracker from "./ProgressTracker";
import TemplateManager from "./TemplateManager";
import HistoryManager, { HistoryItem } from "./HistoryManager";
import { v4 as uuidv4 } from "uuid";

const BlogAiPageContent: React.FC = () => {
  const { formData, saveTemplate } = useBlogForm();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedContent, setGeneratedContent] = useState("");
  const [error, setError] = useState("");
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);

  // 제목 생성 관련 상태
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

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
      JSON.stringify(updatedHistory)
    );
  };

  const deleteHistoryItem = (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(
      "blog-generation-history",
      JSON.stringify(updatedHistory)
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
                      prev.replace(data.placeholder, data.imageUrl)
                    );
                    finalContent = finalContent.replace(
                      data.placeholder,
                      data.imageUrl
                    );
                  } else if (data.type === "gif-result") {
                    const gifHtml = data.urls
                      .map(
                        (url: string) =>
                          `<img src="${url}" alt="GIF" style="width: 100%; max-width: 600px; margin: 20px auto; display: block; border-radius: 8px;" />`
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
                      selectedTitle || formData.contentPlanning.subject
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
                  prev.replace(data.placeholder, data.imageUrl)
                );
                finalContent = finalContent.replace(
                  data.placeholder,
                  data.imageUrl
                );
              } else if (data.type === "gif-result") {
                const gifHtml = data.urls
                  .map(
                    (url: string) =>
                      `<img src="${url}" alt="GIF" style="width: 100%; max-width: 600px; margin: 20px auto; display: block; border-radius: 8px;" />`
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
                  selectedTitle || formData.contentPlanning.subject
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
    <div className="min-h-screen bg-slate-50 relative text-black">
      {/* Current State */}
      <CurrentState />
      {/* History Manager (Floating below CurrentState) */}
      <HistoryManager
        history={history}
        onLoad={() => {}}
        onDelete={deleteHistoryItem}
      />
      {/* Page Title & Hero */}
      <div className="bg-white border-b border-slate-100 px-4 py-8 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4  max-w-7xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-blue-600">
              <PenTool size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-1">
                블로그 AI
              </h1>
              <p className="text-slate-500 font-medium">
                전문적인 블로그 글을 AI가 작성해드립니다
              </p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="text-blue-600">★</span> 고품질 콘텐츠
                </span>
                <span className="flex items-center gap-1">
                  <Search size={12} className="text-blue-500" /> SEO 최적화
                </span>
                <span className="flex items-center gap-1">
                  <Palette size={12} className="text-blue-500" /> 다양한
                  톤앤매너
                </span>
                <span className="flex items-center gap-1">
                  <Brain size={12} className="text-blue-500" /> 맞춤형 구조
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 self-end md:self-center">
            <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1.5">
              🎫 보유 크레딧: 3.0
            </div>
            <button
              onClick={() => setIsTemplateManagerOpen(true)}
              className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors"
            >
              <History size={16} /> 템플릿 관리
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex flex-col lg:grid grid-cols-1 lg:grid-cols-3 gap-8 items-start py-8 max-w-7xl mx-auto px-4">
        {/* Left Column (Forms) */}
        <div className="lg:col-span-1 space-y-8 w-full">
          {/* Writing Type Selection */}
          <WritingTypeSelector />

          {/* Steps Accordions */}
          <div>
            <BrandingSection />
            <ContentPlanningSection />
            <StepOptions />
            <StepDetails />
            <StepGif />
            <StepPhoto />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 bg-[#F8F9FA] pb-4 pt-2">
            <div className="flex gap-3">
              <button
                onClick={handleGenerateBlog}
                disabled={isGenerating}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99] hover:shadow-xl hover:-translate-y-0.5"
              >
                <Rocket size={20} />{" "}
                {isGenerating ? "생성 중..." : "블로그 글 생성하기"}
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-6 border-2 border-slate-200 hover:border-blue-500 hover:text-blue-600 bg-white text-slate-600 rounded-xl font-bold transition-colors flex items-center gap-2"
              >
                <Save size={20} /> 템플릿 저장
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex gap-3 items-start">
              <AlertTriangle
                size={16}
                className="text-yellow-600 mt-0.5 shrink-0"
              />
              <div className="text-xs text-yellow-700 leading-relaxed">
                <p className="font-bold mb-1">
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

        {/* Right Column (Widgets) */}
        <div className="lg:col-span-2 w-full">
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
          />
        </div>
      </div>

      {/* Template Manager Modal */}
      <TemplateManager
        isOpen={isTemplateManagerOpen}
        onClose={() => setIsTemplateManagerOpen(false)}
      />
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
