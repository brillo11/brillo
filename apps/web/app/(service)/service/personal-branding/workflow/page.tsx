"use client";

import React, { useState, Suspense } from "react";
import {
  Sparkles,
  FileText,
  Share2,
  Video,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Play,
  Instagram,
  ArrowLeft,
} from "lucide-react";
import {
  BlogFormProvider,
  useBlogForm,
} from "../blog/__components/BlogFormContext";
import { BlogAiPageContent } from "../blog/__components/BlogAiPageClient";
import { AIAssistantClient } from "../video/_components/ai-assistant-client";
import {
  ThreadsGeneratorClient,
  ThreadsGeneratorState,
} from "@/features/personalBranding/ThreadsGeneratorClient";
import {
  InstagramGeneratorClient,
  InstagramGeneratorState,
} from "@/features/personalBranding/InstagramGeneratorClient";
import { ThreadsIcon } from "@/shared/icons/ThreadsIcon";

// Mock Services
const generateBlogPost = async (topic: string) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve(
        `# Introduction to ${topic}\n\nThis is a generated blog post content about ${topic}.\n\n## Key Takeaway\nThis is the main point of the article.\n\n## Conclusion\nWrap up of the concept.`,
      );
    }, 1500);
  });
};

const generateShortsPlan = async (instagramContent: string) => {
  return new Promise<{ script: string; visualPrompt: string }>((resolve) => {
    setTimeout(() => {
      resolve({
        script:
          "Video Hook: Did you know this? ... Body: Here are 3 tips ... Call to Action: Follow for more!",
        visualPrompt:
          "A futuristic workspace with glowing screens displaying data charts about the topic.",
      });
    }, 1500);
  });
};

const steps = [
  { id: 1, label: "아이디어", icon: Sparkles },
  { id: 2, label: "블로그", icon: FileText },
  { id: 3, label: "쓰레드", icon: Share2 },
  { id: 4, label: "인스타그램", icon: Instagram },
  { id: 5, label: "영상", icon: Video },
];

import { useSearchParams } from "next/navigation";

function BrandingWorkflowContent() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { updateFormData } = useBlogForm();

  // Data State
  const [topic, setTopic] = useState(searchParams.get("topic") || "");
  const [targetAudience, setTargetAudience] = useState("");
  const [insight, setInsight] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [threadTweets, setThreadTweets] = useState<string[]>([]);
  const [instagramContent, setInstagramContent] = useState("");

  // Persisted Step Data
  const [threadsData, setThreadsData] = useState<ThreadsGeneratorState>({
    topic: "",
    targetAudience: "",
    insight: "",
    selectedStyle: null,
    selectedTone: "AUTO",
    posts: [],
  });

  const [instagramData, setInstagramData] = useState<InstagramGeneratorState>({
    topic: "",
    targetAudience: "",
    keyInsights: "",
    selectedStyle: null,
    pages: [],
    aspectRatio: "1:1",
  });

  // Keep internal state in sync with step 1 inputs if they are empty
  // effective "flow down" of initial data
  const syncInitialData = () => {
    setThreadsData((prev) => ({
      ...prev,
      topic: prev.topic || topic,
      targetAudience: prev.targetAudience || targetAudience,
      insight: prev.insight || insight,
    }));
    setInstagramData((prev) => ({
      ...prev,
      topic: prev.topic || topic,
      targetAudience: prev.targetAudience || targetAudience,
      keyInsights: prev.keyInsights || insight,
    }));
  };

  const [videoAssets, setVideoAssets] = useState<{
    script: string;
    visualPrompt: string;
  } | null>(null);

  const handleStep1Submit = async () => {
    if (!topic) return;

    // 블로그 폼 데이터에 Step 1 입력값 주입
    updateFormData("contentPlanning", (prev: any) => ({
      ...prev,
      subject: topic,
      targetAudience: targetAudience,
      keyMessage: insight,
    }));

    syncInitialData();

    // 화면 전환 (이제 실제 블로그 생성 컴포넌트가 Step 2에 표시됨)
    setCurrentStep(2);
  };

  const handleStep2Submit = async () => {
    setCurrentStep(3);
  };

  const handleStep3Submit = async () => {
    setCurrentStep(4);
  };

  const handleStep4Submit = async () => {
    setCurrentStep(5);
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">워크플로우</h1>
        <p className="text-gray-400">
          하나의 아이디어를 시작으로, 완벽한 컨텐츠 생태계를 구축해드립니다.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex justify-between items-center mb-12 relative px-10">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-400 -z-10 transform -translate-y-1/2" />
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center bg-transparent px-2 z-10"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center bg-vzx-card justify-center border-2 transition-all duration-300 ${
                  isActive || isCompleted
                    ? "border-[#33DB98] bg-[#33DB98]/10 text-[#33DB98] shadow-[0_0_15px_rgba(51,219,152,0.3)]"
                    : "border-gray-700 bg-vzx-card text-gray-500"
                }`}
              >
                {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
              </div>
              <span
                className={`mt-3 text-sm font-medium ${
                  isActive || isCompleted ? "text-white" : "text-gray-600"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-vzx-bg border border-white/10 rounded-3xl p-8 flex-1 shadow-2xl relative overflow-hidden min-h-[500px]">
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-[#33DB98] animate-spin mb-4" />
            <p className="text-white font-medium animate-pulse">
              Generating magic...
            </p>
          </div>
        )}

        {/* Step 1: Topic */}
        {currentStep === 1 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 pt-20">
            <div className="p-4 bg-[#33DB98]/10 rounded-full mb-2">
              <Sparkles className="w-8 h-8 text-[#33DB98]" />
            </div>
            <h2 className="text-2xl font-semibold text-white">
              오늘 공유하고 싶은 아이디어는 무엇인가요?
            </h2>
            <div className="w-full max-w-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                  주제
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="ex. 2026년에 시작하는 유튜브 채널"
                  className="w-full bg-vzx-bg border border-gray-700 rounded-xl px-6 py-4 text-white placeholder-gray-500 focus:border-[#33DB98] focus:ring-1 focus:ring-[#33DB98] outline-none transition-all text-lg"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                    대상 고객
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="(선택) ex. 직장인 부업러"
                    className="w-full bg-vzx-bg border border-gray-700 rounded-xl px-6 py-4 text-white placeholder-gray-500 focus:border-[#33DB98] focus:ring-1 focus:ring-[#33DB98] outline-none transition-all text-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                    핵심 인사이트
                  </label>
                  <input
                    type="text"
                    value={insight}
                    onChange={(e) => setInsight(e.target.value)}
                    placeholder="(선택) ex. 진정성의 가치"
                    className="w-full bg-vzx-bg border border-gray-700 rounded-xl px-6 py-4 text-white placeholder-gray-500 focus:border-[#33DB98] focus:ring-1 focus:ring-[#33DB98] outline-none transition-all text-lg"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleStep1Submit}
              disabled={!topic}
              className="mt-4 px-8 py-3 bg-[#33DB98] hover:bg-[#2bb880] text-black font-bold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
            >
              워크플로우 시작하기 <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Blog */}
        {currentStep === 2 && (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="text-[#33DB98]" /> 블로그 포스트 생성
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  onClick={handleStep2Submit}
                  className="text-sm font-bold text-black bg-[#33DB98] px-6 py-2.5 rounded-xl hover:bg-[#2bb880] transition flex items-center gap-2 shadow-lg shadow-[#33DB98]/20"
                >
                  블로그 확정 & 쓰레드 생성으로 이동
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-8 -mb-8 px-4 pb-8">
              <BlogAiPageContent hideHeader={true} />
            </div>
          </div>
        )}

        {/* Step 3: Thread */}
        {currentStep === 3 && (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ThreadsIcon className="text-[#33DB98]" /> 쓰레드 생성
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  onClick={handleStep3Submit}
                  className="text-sm font-bold text-black bg-[#33DB98] px-4 py-2 rounded-lg hover:bg-[#2bb880] transition flex items-center gap-2"
                >
                  인스타그램 캐러셀 생성 <ArrowRight size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-8 -mb-8 px-4 pb-8">
              <ThreadsGeneratorClient
                initialTopic={topic}
                initialTargetAudience={targetAudience}
                initialInsight={insight}
                initialData={threadsData}
                onDataChange={setThreadsData}
                hideHeader={true}
              />
            </div>
          </div>
        )}

        {/* Step 4: Instagram */}
        {currentStep === 4 && (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Instagram className="text-[#33DB98]" /> 캐러셀 생성
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  onClick={handleStep4Submit}
                  className="text-sm font-bold text-black bg-[#33DB98] px-4 py-2 rounded-lg hover:bg-[#2bb880] transition flex items-center gap-2"
                >
                  영상 생성 <ArrowRight size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-8 -mb-8 px-4 pb-8">
              <InstagramGeneratorClient
                initialTopic={topic}
                initialTargetAudience={targetAudience}
                initialInsight={insight}
                initialData={instagramData}
                onDataChange={setInstagramData}
                hideHeader={true}
              />
            </div>
          </div>
        )}

        {/* Step 5: Video (AI Assistant) */}
        {currentStep === 5 && (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Video className="text-[#33DB98]" /> 영상 생성
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition"
                >
                  <ArrowLeft size={20} />
                </button>
              </div>
            </div>
            {/* 
              Wrap AIAssistantClient in a container similar to Step 2 
              Use negative margins to extend to full width of the parent padding
            */}
            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-8 -mb-8 px-4 pb-8">
              <AIAssistantClient
                initialTopic={topic}
                initialTargetAudience={targetAudience}
                initialKeyInsights={insight}
                hideHeader={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrandingWorkflow() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-white">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <BlogFormProvider>
        <BrandingWorkflowContent />
      </BlogFormProvider>
    </Suspense>
  );
}
