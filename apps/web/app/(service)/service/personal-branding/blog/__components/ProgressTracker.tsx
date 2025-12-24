"use client";

import React, { useMemo } from "react";
import { Check, Loader2 } from "lucide-react";
import { useBlogForm } from "./BlogFormContext";

interface ProgressStep {
  id: number;
  message: string;
}

interface ProgressTrackerProps {
  currentStep: number;
  startedSteps?: number[];
  completedSteps?: number[];
  isGenerating: boolean;
}

const ALL_STEPS: ProgressStep[] = [
  { id: 1, message: "요청 접수" },
  { id: 2, message: "프롬프트 생성" },
  { id: 3, message: "본문 생성" },
  { id: 5, message: "인물 사진 처리" },
  { id: 4, message: "유튜브 GIF 생성" },
  { id: 6, message: "완성" },
];

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentStep,
  startedSteps = [],
  completedSteps = [],
  isGenerating,
}) => {
  const { formData } = useBlogForm();

  const activeSteps = useMemo(() => {
    return ALL_STEPS.filter((step) => {
      if (step.id === 4) {
        return !!(
          formData.gif?.youtubeUrl && formData.gif?.startTimes?.length > 0
        );
      }
      if (step.id === 5) {
        return !!formData.photo?.originalUrl;
      }
      return true;
    });
  }, [formData.gif, formData.photo]);

  if (!isGenerating && currentStep === 0) return null;

  return (
    <div className="bg-vzx-card rounded-2xl border border-white/5 p-6 shadow-xl mb-6 backdrop-blur-sm">
      <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#33DB98] animate-pulse" />
        생성 진행 상황
      </h3>
      <div className="space-y-4">
        {activeSteps.map((step, index) => {
          // 완료 상태 정의:
          // 1. 명시적으로 완료 신호(completedSteps)를 받았거나
          // 2. 전체 프로세스가 완료되었거나 (currentStep 6)
          // 3. 선형적인 단계(1,2,3)에서 현재 단계가 그 이후를 가리킬 때
          const isCompleted =
            completedSteps.includes(step.id) ||
            currentStep === 6 ||
            (currentStep > step.id && step.id !== 4 && step.id !== 5);

          // 진행 중 상태 정의:
          // 1. 아직 완료되지 않았고
          // 2. 시작 신호를 받았거나 현재 단계(currentStep)인 경우
          const isCurrent =
            isGenerating &&
            !isCompleted &&
            (startedSteps.includes(step.id) || currentStep === step.id);

          return (
            <div key={step.id} className="flex items-center gap-4 group">
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-500 border ${
                  isCompleted
                    ? "bg-[#33DB98] border-[#33DB98] text-black shadow-[0_0_15px_rgba(51,219,152,0.3)]"
                    : isCurrent
                      ? "bg-[#33DB98]/10 border-[#33DB98] text-[#33DB98] shadow-[0_0_10px_rgba(51,219,152,0.1)]"
                      : "bg-white/5 border-white/10 text-gray-600"
                }`}
              >
                {isCompleted ? (
                  <Check size={18} strokeWidth={3} />
                ) : isCurrent ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-bold transition-colors duration-300 ${
                    isCompleted
                      ? "text-[#33DB98]"
                      : isCurrent
                        ? "text-white"
                        : "text-gray-600"
                  }`}
                >
                  {step.message}
                </span>
                {isCurrent && (
                  <span className="text-[10px] text-[#33DB98]/60 animate-pulse font-medium">
                    AI가 작업을 처리 중입니다...
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;
