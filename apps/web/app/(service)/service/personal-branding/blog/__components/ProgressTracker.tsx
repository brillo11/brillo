"use client";

import React from "react";
import { Check, Loader2 } from "lucide-react";

interface ProgressStep {
  step: number;
  message: string;
}

interface ProgressTrackerProps {
  currentStep: number;
  isGenerating: boolean;
}

const STEPS: ProgressStep[] = [
  { step: 1, message: "요청 접수" },
  { step: 2, message: "프롬프트 생성" },
  { step: 3, message: "본문 생성" },
  { step: 4, message: "유튜브 GIF 생성" },
  { step: 5, message: "인물 사진 처리" },
  { step: 6, message: "완성" },
];

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentStep,
  isGenerating,
}) => {
  if (!isGenerating && currentStep === 0) return null;

  return (
    <div className="bg-vzx-card rounded-2xl border border-white/5 p-6 shadow-xl mb-6 backdrop-blur-sm">
      <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#33DB98] animate-pulse" />
        생성 진행 상황
      </h3>
      <div className="space-y-4">
        {STEPS.map((step) => {
          const isCompleted =
            currentStep > step.step ||
            (currentStep === step.step && !isGenerating);
          const isCurrent = currentStep === step.step && isGenerating;

          return (
            <div key={step.step} className="flex items-center gap-4 group">
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
                  <span className="text-sm font-bold">{step.step}</span>
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
