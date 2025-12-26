"use client";

import { useState } from "react";
import { AIAssistantClient } from "../_components/ai-assistant-client";
import { Button } from "@repo/ui/components/button";
import { Step } from "../_components/types";

// Mock Data
const MOCK_TITLES = {
  sets: [
    {
      videoTitle: "AI로 유튜브 자동화 수익 창출하기 (월 1000만원)",
      thumbnailTitle: "월 1000만원 버는 법",
    }
  ]
};

const MOCK_GUIDES = {
  thumbnailGuides: [
    {
      guideDescription: "A futuristic AI robot holding a pile of cash, glowing neon background.",
    }
  ]
};

const MOCK_SCRIPT = {
  intro: "안녕하세요! 오늘은 AI를 활용해 유튜브 채널을 자동화하고 수익을 창출하는 방법에 대해 알아보겠습니다. 이 영상만 보시면 여러분도 바로 시작하실 수 있습니다.",
  selfIntro: "저는 5년차 AI 수익화 전문가 김아무개입니다.",
  chapters: [
    { title: "시장 조사", content: "먼저 어떤 주제가 돈이 되는지 알아봐야 합니다." },
    { title: "콘텐츠 제작", content: "ChatGPT와 Vrew를 이용해 영상을 뚝딱 만들어봅시다." }
  ],
  outro: "도움이 되셨다면 구독과 좋아요 부탁드립니다. 감사합니다!"
};

const MOCK_METADATA = {
  description: "이 영상에서는 AI 툴을 활용하여 얼굴 없는 유튜브 채널을 운영하고 수익을 내는 노하우를 전격 공개합니다. #AI #부업 #유튜브",
  tags: ["AI", "유튜브", "부업", "수익화", "자동화"],
  hashtags: ["#AI", "#유튜브", "#돈벌기"]
};

// Complete Mock Data depending on step
const getMockDataForStep = (step: Step) => {
  const baseData = {
    titleResponses: MOCK_TITLES,
    selectedTitleIndex: 0,
    selectedTitle: MOCK_TITLES.sets[0]!.videoTitle
  };

  if (step === 1) return {};
  if (step === 2) return { ...baseData };
  if (step === 5) return { 
    ...baseData, 
    thumbnailGuideResponses: MOCK_GUIDES, 
    selectedThumbnailGuideIndex: 0,
    thumbnailUrls: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop" 
  };
  if (step === 6) return { 
     ...baseData,
     thumbnailUrls: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop" 
  };
  if (step === 7) return {
    ...baseData,
    thumbnailUrls: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop",
    scriptResponses: MOCK_SCRIPT
  };
  if (step === 8) return {
    ...baseData,
    thumbnailUrls: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop",
    scriptResponses: MOCK_SCRIPT,
    metadataResponses: MOCK_METADATA
  };

  return baseData;
};

export default function DevPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const steps: Step[] = [1, 2, 5, 6, 7, 8];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Dev Controls */}
      <div className="sticky top-0 z-50 bg-[#1E1E1E] border-b border-white/10 p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="font-mono text-sm font-bold text-[#33DB98]">DEV MODE: Step Viewer</h1>
          <div className="flex gap-2">
            {steps.map((step) => (
              <Button
                key={step}
                variant={currentStep === step ? "default" : "secondary"}
                onClick={() => setCurrentStep(step)}
                className={`text-xs px-3 py-1 h-8 ${currentStep === step ? "bg-[#33DB98] text-black hover:bg-[#33DB98]/90" : "bg-white/5 hover:bg-white/10 text-gray-400"}`}
              >
                Step {step}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div key={currentStep} className="animate-in fade-in duration-300">
           <AIAssistantClient 
             hideHeader={true}
             initialStep={currentStep}
             initialSessionData={getMockDataForStep(currentStep)}
             // Initialize inputs for convenience
             initialTopic="AI로 돈버는 법"
             initialTargetAudience="2030 직장인"
             initialKeyInsights="쉽게 따라할 수 있는 방법"
           />
        </div>
      </div>
    </div>
  );
}
