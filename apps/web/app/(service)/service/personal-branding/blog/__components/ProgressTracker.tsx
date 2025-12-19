'use client';

import React from 'react';
import { Check, Loader2 } from 'lucide-react';

interface ProgressStep {
  step: number;
  message: string;
}

interface ProgressTrackerProps {
  currentStep: number;
  isGenerating: boolean;
}

const STEPS: ProgressStep[] = [
  { step: 1, message: '요청 접수' },
  { step: 2, message: '프롬프트 생성' },
  { step: 3, message: '본문 생성' },
  { step: 4, message: '유튜브 GIF 생성' },
  { step: 5, message: '원장님 사진 처리' },
  { step: 6, message: '완성' },
];

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ currentStep, isGenerating }) => {
  if (!isGenerating && currentStep === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">생성 진행 상황</h3>
      <div className="space-y-3">
        {STEPS.map((step) => {
          const isCompleted = currentStep > step.step || (currentStep === step.step && !isGenerating);
          const isCurrent = currentStep === step.step && isGenerating;
          const isPending = currentStep < step.step;

          return (
            <div key={step.step} className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-200 text-slate-400'
              }`}>
                {isCompleted ? (
                  <Check size={16} />
                ) : isCurrent ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <span className="text-sm font-medium">{step.step}</span>
                )}
              </div>
              <span className={`text-sm font-medium ${
                isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'
              }`}>
                {step.message}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;
