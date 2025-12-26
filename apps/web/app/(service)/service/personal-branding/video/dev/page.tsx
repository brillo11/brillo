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
      thumbnailGuide: "미래지향적인 AI 로봇이 돈다발을 들고 있는 모습. 네온 사인이 빛나는 사이버펑크 배경. 로봇은 전문적인 포즈를 취하고 있음."
    },
    {
      videoTitle: "초보자도 가능한 AI 영상 제작 가이드",
      thumbnailTitle: "1시간 만에 완성",
      thumbnailGuide: "노트북 앞에 앉아 즐거워하는 크리에이터. 화면에는 화려한 유튜브 대시보드가 보임. 밝고 경쾌한 조명."
    },
    {
      videoTitle: "챗GPT가 알려주는 유튜브 대박 비법",
      thumbnailTitle: "조회수 떡상 비밀",
      thumbnailGuide: "스마트폰 화면에서 로켓이 발사되는 이미지. 상승하는 그래프가 배경에 깔려있음. 붉은색 강조."
    }
  ]
};

const MOCK_GUIDES = {
  thumbnailGuides: [
    {
      guideTitle: "미래지향적 스타일",
      guideDescription: "A futuristic AI robot holding a pile of cash, glowing neon background, cyberpunk style, high detail, 8k resolution.",
      guideSummary: "사이버펑크풍의 화려한 네온 컬러와 로봇 이미지로 시선을 끕니다."
    },
    {
      guideTitle: "심플 & 모던",
      guideDescription: "Minimalist desk setup, clean white background, laptop with youtube logo, soft lighting, professional look.",
      guideSummary: "깔끔하고 신뢰감을 주는 미니멀한 구성입니다."
    },
    {
      guideTitle: "감성 브이로그",
      guideDescription: "Warm sunlight, cozy room, coffee mug, hands typing on keyboard, aesthetic filter, emotional vibe.",
      guideSummary: "따뜻하고 감성적인 분위기로 공감을 유도합니다."
    }
  ]
};

const MOCK_SCRIPT = {
  intro: "안녕하세요! 오늘은 AI를 활용해 유튜브 채널을 자동화하고 수익을 창출하는 방법에 대해 알아보겠습니다. 이 영상만 보시면 여러분도 바로 시작하실 수 있습니다. 지금 바로 공개합니다.",
  selfIntro: "저는 5년차 AI 수익화 전문가 김아무개입니다. 수많은 시행착오 끝에 발견한 노하우를 공유합니다.",
  chapters: [
    { title: "시장 조사", content: "먼저 어떤 주제가 돈이 되는지 알아봐야 합니다. 챗GPT에게 물어보면 인기 있는 니치 마켓을 금방 찾을 수 있죠. 경쟁 강도와 검색량을 분석하는 것이 핵심입니다." },
    { title: "콘텐츠 제작", content: "이제 영상을 만들어볼까요? Vrew나 Fliki 같은 툴을 쓰면 대본만 넣어도 영상이 뚝딱 나옵니다. 저작권 걱정 없는 이미지와 음악도 자동으로 배정해주죠." },
    { title: "채널 성장 전략", content: "영상을 올리고 끝이 아닙니다. 썸네일과 제목 최적화, 그리고 커뮤니티 탭 활용까지. 알고리즘의 선택을 받는 비결을 알려드립니다." }
  ],
  outro: "오늘 내용이 도움이 되셨다면 구독과 좋아요 부탁드립니다. 다음 영상에서는 더 구체적인 수익 인증을 가져오겠습니다. 감사합니다!"
};

const MOCK_METADATA = {
  description: "이 영상에서는 AI 툴을 활용하여 얼굴 없는 유튜브 채널을 운영하고 수익을 내는 노하우를 전격 공개합니다. 초보자도 쉽게 따라 할 수 있는 단계별 가이드를 제공합니다. \n\n00:00 인트로\n01:30 시장 조사\n02:50 콘텐츠 제작\n04:10 채널 성장 전략\n05:30 마무리",
  timestamps: [
    { time: "0:00", title: "인트로" },
    { time: "1:30", title: "시장 조사" },
    { time: "2:50", title: "콘텐츠 제작" },
    { time: "4:10", title: "채널 성장 전략" },
    { time: "5:30", title: "마무리" }
  ],
  tags: ["AI", "유튜브", "부업", "수익화", "자동화", "챗GPT", "영상편집"],
  hashtags: ["#AI", "#유튜브", "#돈벌기", "#부업"]
};

const MOCK_SHORTS_TITLES = {
  shortsTitles: [
    { chapterTitle: "시장 조사", titles: ["돈 되는 유튜브 주제 찾는 법", "이거 모르면 유튜브 망합니다", "조회수 보장하는 니치 마켓"] },
    { chapterTitle: "콘텐츠 제작", titles: ["AI로 5분 만에 영상 만들기", "얼굴 없이 유튜버 데뷔하기", "무료 AI 영상 편집 툴 추천"] },
    { chapterTitle: "채널 성장 전략", titles: ["알고리즘이 사랑하는 채널 비밀", "구독자 1000명 빨리 찍는 법", "수익 창출 승인 꿀팁"] }
  ]
};

const MOCK_THUMBNAIL_URL = "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop";

// Complete Mock Data depending on step
const getMockDataForStep = (step: Step) => {
  const baseData = {
    titleResponses: MOCK_TITLES,
    selectedTitleIndex: 0,
    selectedTitle: MOCK_TITLES.sets[0]!.videoTitle
  };

  if (step === 1) return {};
  
  if (step === 2) return { 
    ...baseData,
    thumbnailGuideResponses: MOCK_GUIDES,
    // selectedThumbnailGuideIndex: 0 // Optional: Let user select
  };
  
  // Design Step needs Guide
  if (step === 5) return { 
    ...baseData, 
    thumbnailGuideResponses: MOCK_GUIDES, 
    selectedThumbnailGuideIndex: 0,
    thumbnailUrls: MOCK_THUMBNAIL_URL,
    // Step 5 chat/generation context
    step: "THUMBNAIL"
  };
  
  // Script Step needs Thumbnail
  if (step === 6) return { 
     ...baseData,
     thumbnailGuideResponses: MOCK_GUIDES,
     selectedThumbnailGuideIndex: 0,
     thumbnailUrls: MOCK_THUMBNAIL_URL,
     scriptResponses: MOCK_SCRIPT // Optional: provide pre-generated script
  };
  
  // Metadata Step needs Script
  if (step === 7) return {
    ...baseData,
    thumbnailGuideResponses: MOCK_GUIDES,
    selectedThumbnailGuideIndex: 0,
    thumbnailUrls: MOCK_THUMBNAIL_URL,
    scriptResponses: MOCK_SCRIPT,
    metadataResponses: MOCK_METADATA
  };
  
  // Final Step needs Everything
  if (step === 8) return {
    ...baseData,
    thumbnailGuideResponses: MOCK_GUIDES,
    selectedThumbnailGuideIndex: 0,
    thumbnailUrls: MOCK_THUMBNAIL_URL,
    scriptResponses: MOCK_SCRIPT,
    metadataResponses: MOCK_METADATA,
    shortsTitlesResponses: MOCK_SHORTS_TITLES,
    generatedVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // Mock Result Video
    generatedVideoType: "HEYGEN"
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
