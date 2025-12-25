"use client";

import React from "react";
import { useBlogForm } from "./BlogFormContext";
import { Sparkles, Info, Target } from "lucide-react";

const MODES = [
  {
    id: "MINIMAL",
    label: "최소",
    subLabel: "정보 집중",
    icon: <Info size={16} />,
    description: "독자가 필요한 정보를 빠르고 정확하게 전달하는 데 집중합니다.",
    effects: ["빠른 정보 습득", "객관적 신뢰도 확보", "거부감 없는 정보 전달"],
  },
  {
    id: "BALANCED",
    label: "보통",
    subLabel: "경험 공유",
    icon: <Sparkles size={16} />,
    description: "정보와 함께 작성자의 개인적인 경험과 통찰을 적절히 섞습니다.",
    effects: [
      "독자와의 유대감 형성",
      "브랜드 호감도 상승",
      "자연스러운 인지 확대",
    ],
  },
  {
    id: "STRONG",
    label: "강함",
    subLabel: "전문성 강조",
    icon: <Target size={16} />,
    description:
      "작성자의 전문성, 성과, 철학을 강력하게 드러내 가치를 입증합니다.",
    effects: ["전문가 입지 강화", "서비스 전환율 극대화", "강력한 팬덤 형성"],
  },
] as const;

const WritingTypeSelector: React.FC = () => {
  const { formData, updateFormData } = useBlogForm();
  const currentIntensity = formData.brandingMode || "BALANCED";

  // MODES[1]을 기본값으로 명시하여 undefined 방지
  const selectedMode = MODES.find((m) => m.id === currentIntensity) ?? MODES[1];

  const handleModeChange = (mode: (typeof MODES)[number]) => {
    // 브랜딩 모드 업데이트
    updateFormData("brandingMode", mode.id);
  };

  return (
    <div className="bg-vzx-card p-6 rounded-2xl border border-white/5 shadow-sm space-y-6">
      <div>
        <div className="flex items-center gap-4 mb-4">
          <span className="font-bold text-white text-lg">브랜딩 모드 설정</span>
        </div>

        {/* 3-Way Toggle Style Selector */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 mb-6">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all duration-300 ${
                currentIntensity === mode.id
                  ? "bg-[#33DB98] text-black font-bold shadow-lg shadow-[#33DB98]/10"
                  : "text-gray-500 font-medium hover:text-white hover:bg-white/5"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Selected Mode Details */}
        <div className="bg-black/40 rounded-xl p-4 border border-white/5 animate-in fade-in slide-in-from-top-1 duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-[#33DB98]">{selectedMode.icon}</div>
            <span className="text-sm font-bold text-white">
              {selectedMode.subLabel}
            </span>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            {selectedMode.description}
          </p>

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              기대 효과
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedMode.effects.map((effect, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-white/5 text-gray-300 px-2 py-1 rounded-md border border-white/5"
                >
                  • {effect}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingTypeSelector;
