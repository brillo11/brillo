"use client";

import { useState, useEffect } from "react";

import {
  Loader2,
  Sparkles,
  Check,
  ChevronRight,
  Play,
  BookOpen,
  MessageCircle,
  Star,
  Zap,
} from "lucide-react";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Button } from "@repo/ui/components/button";
import MarkdownRenderer from "./MarkdownRenderer";
import type { Step, VideoStyle } from "./types";

const VIDEO_STYLES: {
  id: VideoStyle;
  title: string;
  desc: string;
  detail: string;
  icon: any;
}[] = [
  {
    id: "INFO",
    title: "정보 전달 (Info)",
    desc: "명확한 정보와 노하우 전달",
    detail: "How-to, 꿀팁, 강의식 구성. 신뢰감을 주는 구조.",
    icon: BookOpen,
  },
  {
    id: "STORY",
    title: "스토리텔링 (Story)",
    desc: "경험과 감정을 공유하는 서사",
    detail: "개인의 경험, 실패/성공담, 브이로그. 공감을 유도하는 구조.",
    icon: MessageCircle,
  },
  {
    id: "REVIEW",
    title: "리뷰/분석 (Review)",
    desc: "장단점 분석과 솔직한 평가",
    detail: "제품/서비스/트렌드 분석. 객관적이고 날카로운 시각.",
    icon: Star,
  },
  {
    id: "MOTIVATION",
    title: "동기부여 (Motivation)",
    desc: "행동을 이끌어내는 설득",
    detail: "마인드셋, 자기계발. 감정을 고무시키는 구조.",
    icon: Zap,
  },
];

interface Step1PlanningProps {
  topic: string;
  onTopicChange: (topic: string) => void;
  targetAudience: string;
  onTargetAudienceChange: (value: string) => void;
  keyInsights: string;
  onKeyInsightsChange: (value: string) => void;
  selectedStyle: VideoStyle | null;
  onStyleChange: (style: VideoStyle) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  titleResponses?: any;
  selectedTitleIndex: number | null;
  onSelectTitle: (index: number) => void;
  onStepChange: (step: Step) => void;
  isNextLoading: boolean;
}

export function Step1Planning({
  topic,
  onTopicChange,
  targetAudience,
  onTargetAudienceChange,
  keyInsights,
  onKeyInsightsChange,
  selectedStyle,
  onStyleChange,
  onGenerate,
  isGenerating,
  titleResponses,
  selectedTitleIndex,
  onSelectTitle,
  onStepChange,
  isNextLoading,
}: Step1PlanningProps) {
  const titles = titleResponses?.sets || [];

  const [progress, setProgress] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const [nextStepProgress, setNextStepProgress] = useState(0);
  const [nextStepSeconds, setNextStepSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setProgress(0);
      setSeconds(0);
      const duration = 15000; // 15 seconds
      const startTime = Date.now();

      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setProgress(newProgress);
        setSeconds(Math.floor(elapsed / 1000));
      }, 100); // UI update interval
    } else {
      setProgress(0);
      setSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isNextLoading) {
      setNextStepProgress(0);
      setNextStepSeconds(0);
      const duration = 15000; // 15 seconds
      const startTime = Date.now();

      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setNextStepProgress(newProgress);
        setNextStepSeconds(Math.floor(elapsed / 1000));
      }, 100); // UI update interval
    } else {
      setNextStepProgress(0);
      setNextStepSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isNextLoading]);

  return (
    <div className="grid gap-8 md:grid-cols-2 animate-fade-in">
      {/* Left Column: Inputs */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white mb-4">
            썸네일 가이드 생성하기
          </h2>
          <p className="text-gray-400">
            주제와 타겟, 핵심 메시지를 입력하여 매력적인 썸네일 이미지 가이드를
            선택해보세요.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-gray-300">
              주제 <span className="text-red-400">*</span>
            </Label>
            <Input
              id="topic"
              placeholder="예: 2026년 마케팅 트렌드, 건강한 다이어트 비법"
              value={topic}
              onChange={(e) => onTopicChange(e.target.value)}
              disabled={isGenerating}
              className="bg-vzx-bg border-white/10 text-white placeholder:text-gray-500 focus-visible:border-[var(--vzx-accent)] focus-visible:ring-1 focus-visible:ring-[var(--vzx-accent)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAudience" className="text-gray-300">
                대상 고객 <span className="text-gray-500 text-xs">(선택)</span>
              </Label>
              <Input
                id="targetAudience"
                placeholder="예: 30대 직장인, 워킹맘"
                value={targetAudience}
                onChange={(e) => onTargetAudienceChange(e.target.value)}
                disabled={isGenerating}
                className="bg-vzx-bg border-white/10 text-white placeholder:text-gray-500 focus-visible:border-[var(--vzx-accent)] focus-visible:ring-1 focus-visible:ring-[var(--vzx-accent)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyInsights" className="text-gray-300">
                핵심 인사이트{" "}
                <span className="text-gray-500 text-xs">(선택)</span>
              </Label>
              <Input
                id="keyInsights"
                placeholder="예: 꾸준함이 정답이다, 결국 기본기"
                value={keyInsights}
                onChange={(e) => onKeyInsightsChange(e.target.value)}
                disabled={isGenerating}
                className="bg-vzx-bg border-white/10 text-white placeholder:text-gray-500 focus-visible:border-[var(--vzx-accent)] focus-visible:ring-1 focus-visible:ring-[var(--vzx-accent)]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">
              스타일 선택 <span className="text-red-400">*</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VIDEO_STYLES.map((style) => (
                <div
                  key={style.id}
                  onClick={() =>
                    !isGenerating && !isNextLoading && onStyleChange(style.id)
                  }
                  className={`
                      relative cursor-pointer transition-all duration-300 border rounded-2xl p-4
                      ${
                        selectedStyle === style.id
                          ? "bg-[#33DB98]/10 border-[#33DB98] ring-1 ring-[#33DB98]/50"
                          : "bg-vzx-card border-white/5 hover:border-[#33DB98]/50 text-gray-400 hover:text-white"
                      }
                    `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        selectedStyle === style.id
                          ? "bg-[#33DB98] text-black"
                          : "bg-white/5 text-gray-400"
                      }`}
                    >
                      <style.icon size={20} />
                    </div>
                    {selectedStyle === style.id && (
                      <div className="w-2 h-2 rounded-full bg-[#33DB98] animate-pulse" />
                    )}
                  </div>
                  <h3
                    className={`font-bold mb-1 transition-colors ${
                      selectedStyle === style.id
                        ? "text-[#33DB98]"
                        : "text-gray-200"
                    }`}
                  >
                    {style.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium mb-1">
                    {style.desc}
                  </p>
                  <p className="text-[10px] text-gray-500 leading-tight border-t border-white/5 pt-2 mt-2">
                    {style.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={onGenerate}
            disabled={
              !topic.trim() || !selectedStyle || isGenerating || isNextLoading
            }
            className="w-full h-12 text-lg bg-[#33DB98] text-black hover:bg-[#33DB98]/90 font-bold border-none"
          >
            {isGenerating ? (
              <>
                <div className="relative mr-2 w-6 h-6 flex items-center justify-center">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      className="text-black/10"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 10}
                      strokeDashoffset={2 * Math.PI * 10 * (1 - progress / 100)}
                      strokeLinecap="round"
                      className="text-black transition-all duration-100 ease-linear"
                    />
                  </svg>
                </div>
                <span>썸네일 가이드 생성 중... ({seconds}초)</span>
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                썸네일 가이드 생성
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Right Column: Output & Selection */}
      <div className="relative border border-white/5 rounded-2xl bg-[#1E1E1E] p-6 min-h-[500px]">
        {titles.length > 0 ? (
          <div className="space-y-4 h-full flex flex-col">
            <h2 className="text-xl font-semibold text-white mb-4">
              썸네일 가이드 선택
            </h2>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {titles.map((set: any, idx: number) => {
                const isSelected = selectedTitleIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => !isNextLoading && onSelectTitle(idx)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 group ${
                      isSelected
                        ? "border-[#33DB98] bg-[#33DB98]/10"
                        : "border-white/10 bg-white/5 hover:border-[#33DB98]/50"
                    } ${
                      isNextLoading
                        ? "opacity-50 cursor-not-allowed pointer-events-none"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all mt-1 ${
                        isSelected
                          ? "border-[#33DB98] bg-[#33DB98] text-black"
                          : "border-white/20 text-transparent"
                      }`}
                    >
                      <Check size={14} strokeWidth={4} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                          영상 제목
                        </span>
                        <h4
                          className={`font-bold text-base leading-tight ${
                            isSelected ? "text-white" : "text-gray-200"
                          }`}
                        >
                          <MarkdownRenderer content={set.videoTitle} />
                        </h4>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#33DB98] uppercase tracking-wider block mb-1">
                          썸네일 텍스트
                        </span>
                        <p
                          className={`text-sm mb-2 ${isSelected ? "text-gray-200" : "text-gray-400"}`}
                        >
                          {set.thumbnailTitle || set.thumbnailText}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedTitleIndex !== null && (
              <div className="pt-4 mt-auto border-t border-white/10 animate-fade-in">
                <Button
                  onClick={() => onStepChange(2)} // Move to Step 2 (Thumb Guide)
                  disabled={isNextLoading}
                  className="w-full h-12 text-lg bg-[#33DB98] text-black hover:bg-[#33DB98]/90 font-bold border-none"
                >
                  {isNextLoading ? (
                    <>
                      <div className="relative mr-2 w-6 h-6 flex items-center justify-center">
                        <svg
                          className="w-full h-full transform -rotate-90"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="transparent"
                            className="text-black/10"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 10}
                            strokeDashoffset={
                              2 * Math.PI * 10 * (1 - nextStepProgress / 100)
                            }
                            strokeLinecap="round"
                            className="text-black transition-all duration-100 ease-linear"
                          />
                        </svg>
                      </div>
                      <span>기획 정리중... ({nextStepSeconds}초)</span>
                    </>
                  ) : (
                    <>
                      다음 단계로 이동
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-6 text-center">
            <div className="mb-4 rounded-full bg-vzx-bg p-4 border border-white/5">
              <Play className="h-8 w-8 text-[#33DB98]/80" />
            </div>
            <p className="font-medium text-gray-300">
              기획된 내용이 여기에 표시됩니다.
            </p>
            <p className="text-sm mt-1">
              주제를 입력하고 생성 버튼을 눌러주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
