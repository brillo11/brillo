"use client";

import React, { useState } from "react";
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
} from "lucide-react";

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

const generateThreadFromBlog = async (content: string) => {
  return new Promise<string[]>((resolve) => {
    setTimeout(() => {
      resolve([
        "🧵 1/5 Here is a thread based on the blog post!",
        "2/5 The first key point is fascinating.",
        "3/5 Don't forget about this second aspect.",
        "4/5 This changes everything about the topic.",
        "5/5 Conclusion: Start today! #Growth",
      ]);
    }, 1500);
  });
};

const generateInstagramPlan = async (tweets: string[]) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve(
        "📸 [Instagram Carousel Plan]\n\n" +
          "Slide 1: Hook - Catchy Title\n" +
          "Slide 2: Context - Why this matters\n" +
          "Slide 3: Insight 1 - Detailed point\n" +
          "Slide 4: Insight 2 - Another point\n" +
          "Slide 5: Summary & CTA - Save this post!",
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

export default function BrandingWorkflow() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Data State
  const [topic, setTopic] = useState(searchParams.get("topic") || "");
  const [targetAudience, setTargetAudience] = useState("");
  const [insight, setInsight] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [threadTweets, setThreadTweets] = useState<string[]>([]);
  const [instagramContent, setInstagramContent] = useState("");
  const [videoAssets, setVideoAssets] = useState<{
    script: string;
    visualPrompt: string;
  } | null>(null);

  const handleStep1Submit = async () => {
    if (!topic) return;
    setIsLoading(true);
    try {
      const result = await generateBlogPost(topic);
      setBlogContent(result);
      setCurrentStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async () => {
    setIsLoading(true);
    try {
      const result = await generateThreadFromBlog(blogContent);
      setThreadTweets(result);
      setCurrentStep(3);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Submit = async () => {
    setIsLoading(true);
    try {
      const result = await generateInstagramPlan(threadTweets);
      setInstagramContent(result);
      setCurrentStep(4);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep4Submit = async () => {
    setIsLoading(true);
    try {
      const result = await generateShortsPlan(instagramContent);
      setVideoAssets(result);
      setCurrentStep(5);
    } finally {
      setIsLoading(false);
    }
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
      <div className="bg-vzx-card border border-white/10 rounded-3xl p-8 flex-1 shadow-2xl relative overflow-hidden min-h-[500px]">
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
                    placeholder="(선택) ex. 취준생"
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
              <h2 className="text-xl font-semibold text-white">
                Review Blog Post
              </h2>
              <button
                onClick={handleStep2Submit}
                className="text-sm font-bold text-black bg-[#33DB98] px-4 py-2 rounded-lg hover:bg-[#2bb880] transition flex items-center gap-2"
              >
                Approve & Generate Thread <ArrowRight size={16} />
              </button>
            </div>
            <textarea
              value={blogContent}
              onChange={(e) => setBlogContent(e.target.value)}
              className="flex-1 w-full bg-vzx-bg border border-white/10 rounded-xl p-6 text-gray-300 font-mono text-sm leading-relaxed resize-none focus:border-[#33DB98] outline-none min-h-[400px]"
            />
          </div>
        )}

        {/* Step 3: Thread */}
        {currentStep === 3 && (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                Review Twitter Thread
              </h2>
              <button
                onClick={handleStep3Submit}
                className="text-sm font-bold text-black bg-[#33DB98] px-4 py-2 rounded-lg hover:bg-[#2bb880] transition flex items-center gap-2"
              >
                Generate Video Assets <ArrowRight size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {threadTweets.map((tweet, index) => (
                <div
                  key={index}
                  className="bg-vzx-bg border border-white/5 p-4 rounded-xl flex gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-white">
                        VZX Instructor
                      </span>
                      <span className="text-gray-500 text-xs">
                        {index + 1}/{threadTweets.length}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">
                      {tweet}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Instagram */}
        {currentStep === 4 && (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                Review Instagram Plan
              </h2>
              <button
                onClick={handleStep4Submit}
                className="text-sm font-bold text-black bg-[#33DB98] px-4 py-2 rounded-lg hover:bg-[#2bb880] transition flex items-center gap-2"
              >
                Generate Video Assets <ArrowRight size={16} />
              </button>
            </div>
            <textarea
              value={instagramContent}
              onChange={(e) => setInstagramContent(e.target.value)}
              className="flex-1 w-full bg-vzx-bg border border-white/10 rounded-xl p-6 text-gray-300 font-mono text-sm leading-relaxed resize-none focus:border-[#33DB98] outline-none min-h-[400px]"
            />
          </div>
        )}

        {/* Step 5: Assets */}
        {currentStep === 5 && videoAssets && (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Final Assets</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-sm font-medium text-white border border-white/20 px-4 py-2 rounded-lg hover:bg-white/5 transition"
                >
                  Start New
                </button>
                <button className="text-sm font-bold text-black bg-[#33DB98] px-4 py-2 rounded-lg hover:bg-[#2bb880] transition shadow-[0_0_15px_rgba(51,219,152,0.4)]">
                  Export All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
              {/* Script Column */}
              <div className="bg-vzx-bg border border-white/5 rounded-xl p-4 flex flex-col">
                <h3 className="text-[#33DB98] font-medium mb-3 flex items-center gap-2">
                  <FileText size={16} /> Shorts Script
                </h3>
                <div className="flex-1 overflow-y-auto text-sm text-gray-400 leading-relaxed max-h-[400px]">
                  {videoAssets.script}
                </div>
              </div>

              {/* Thumbnail Column */}
              <div className="bg-vzx-bg border border-white/5 rounded-xl p-4 flex flex-col">
                <h3 className="text-[#33DB98] font-medium mb-3 flex items-center gap-2">
                  <Sparkles size={16} /> AI Thumbnail
                </h3>
                <div className="flex-1 bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden group h-[300px]">
                  {/* <img
                    src="https://picsum.photos/400/600"
                    alt="Generated Thumbnail"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  /> */}
                  <div className="text-gray-500 flex flex-col items-center">
                    <span>Thumbnail Preview</span>
                    <span className="text-xs mt-2 text-gray-600">
                      (Mock Image)
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-black/70 p-2 rounded text-xs text-white">
                    Prompt: {videoAssets.visualPrompt.substring(0, 50)}...
                  </div>
                </div>
              </div>

              {/* HeyGen Footage Column */}
              <div className="bg-vzx-bg border border-white/5 rounded-xl p-4 flex flex-col">
                <h3 className="text-[#33DB98] font-medium mb-3 flex items-center gap-2">
                  <Video size={16} /> HeyGen Avatar
                </h3>
                <div className="flex-1 bg-gray-800 rounded-lg flex items-center justify-center relative group cursor-pointer h-[300px]">
                  {/* <img
                    src="https://picsum.photos/401/601"
                    alt="HeyGen Avatar"
                    className="w-full h-full object-cover opacity-60"
                  /> */}
                  <div className="text-gray-500 flex flex-col items-center">
                    <span>Avatar Preview</span>
                    <span className="text-xs mt-2 text-gray-600">
                      (Mock Video)
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-[#33DB98] rounded-full flex items-center justify-center pl-1 shadow-lg group-hover:scale-110 transition-transform">
                      <Play fill="black" stroke="none" size={24} />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-[#33DB98] text-xs rounded border border-[#33DB98]/30">
                    Generating Lip Sync...
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
