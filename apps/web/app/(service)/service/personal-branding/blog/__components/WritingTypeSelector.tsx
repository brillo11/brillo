"use client";

import React, { useState, useEffect, useRef } from "react";
import { useBlogForm } from "./BlogFormContext";
import {
  Sparkles,
  Info,
  Target,
  Info as InfoIcon,
  PenTool,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const MODES = [
  {
    id: "MINIMAL",
    label: "최소",
    subLabel: "정보 집중",
    icon: <InfoIcon size={14} />,
    description: "독자가 필요한 정보를 빠르고 정확하게 전달하는 데 집중합니다.",
    effects: ["빠른 정보 습득", "객관적 신뢰도 확보", "거부감 없는 정보 전달"],
  },
  {
    id: "BALANCED",
    label: "보통",
    subLabel: "경험 공유",
    icon: <Sparkles size={14} />,
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
    icon: <Target size={14} />,
    description:
      "작성자의 전문성, 성과, 철학을 강력하게 드러내 가치를 입증합니다.",
    effects: ["전문가 입지 강화", "서비스 전환율 극대화", "강력한 팬덤 형성"],
  },
] as const;

const WritingTypeSelector: React.FC = () => {
  const { formData, updateFormData } = useBlogForm();
  const currentIntensity = formData.brandingMode || "MINIMAL";
  const [brandingText, setBrandingText] = useState(
    formData.branding.brandingText,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 수동 토글 상태 (초기값은 모드에 따라 결정)
  const [isManualExpanded, setIsManualExpanded] = useState(
    currentIntensity === "BALANCED" || currentIntensity === "STRONG",
  );

  // 높이 자동 조절 함수
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // 모드가 변경될 때 자동으로 열어주되, '최소'로 돌아가면 닫기 (유저가 원하면 다시 열 수 있음)
  useEffect(() => {
    if (currentIntensity === "BALANCED" || currentIntensity === "STRONG") {
      setIsManualExpanded(true);
    } else {
      // 최소 모드로 변경 시, 내용이 비어있거나 기본 템플릿인 경우에만 닫아줌 (깔끔함을 위해)
      if (
        !brandingText ||
        brandingText.trim() === "" ||
        brandingText.includes("[자기소개")
      ) {
        setIsManualExpanded(false);
      }
    }
  }, [currentIntensity, brandingText]);

  // 입력 내용이나 확장 상태가 바뀔 때 높이 재조절
  useEffect(() => {
    adjustHeight();
  }, [brandingText, isManualExpanded]);

  // 브랜딩 정보 동기화 (디바운싱 적용)
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFormData("branding", { ...formData.branding, brandingText });
    }, 500);
    return () => clearTimeout(timer);
  }, [brandingText, formData.branding, updateFormData]);

  // 외부에서 데이터가 변경되었을 때 (템플릿 불러오기 등) 로컬 상태 업데이트
  useEffect(() => {
    setBrandingText(formData.branding.brandingText);
  }, [formData.branding.brandingText]);

  const handleModeChange = (modeId: (typeof MODES)[number]["id"]) => {
    updateFormData("brandingMode", modeId);
  };

  return (
    <div className="bg-vzx-card p-6 rounded-2xl border border-[#33DB98]/60 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-bold text-white text-lg">브랜딩 모드 설정</span>
      </div>

      {/* 3-Way Toggle */}
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
        {MODES.map((mode) => (
          <div key={mode.id} className="flex-1 relative group">
            <button
              onClick={() => handleModeChange(mode.id)}
              className={`w-full flex items-center justify-center gap-1.5 py-3 rounded-lg text-sm transition-all duration-300 cursor-pointer ${
                currentIntensity === mode.id
                  ? "bg-[#33DB98] text-black font-bold shadow-lg shadow-[#33DB98]/10"
                  : "text-gray-500 font-medium hover:text-white hover:bg-white/5"
              }`}
            >
              {mode.label}
              <div className="text-current opacity-60 hover:opacity-100 transition-opacity">
                <Info size={14} />
              </div>
            </button>

            {/* Tooltip on Hover */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 p-4 bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] pointer-events-none">
              <div className="flex items-center gap-2 mb-2 text-[#33DB98]">
                {mode.icon}
                <span className="text-xs font-bold">{mode.subLabel}</span>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed mb-3">
                {mode.description}
              </p>
              <div className="space-y-1.5 border-t border-white/5 pt-2">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                  기대 효과
                </p>
                <div className="flex flex-wrap gap-1">
                  {mode.effects.map((effect, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/5"
                    >
                      • {effect}
                    </span>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-8 border-transparent border-b-[#1A1A1A]/95"></div>
            </div>
          </div>
        ))}
      </div>

      {/* 최소 모드에서도 수동으로 열 수 있는 버튼 */}
      <button
        onClick={() => setIsManualExpanded(!isManualExpanded)}
        className="flex items-center gap-1.5 text-[11px] font-bold text-[#33DB98] transition-colors cursor-pointer"
      >
        {isManualExpanded ? (
          <>
            브랜딩 정보 접기 <ChevronUp size={14} />
          </>
        ) : (
          <>
            브랜딩 정보 추가하기 <ChevronDown size={14} />
          </>
        )}
      </button>

      {/* Expandable Branding Text Area */}
      {isManualExpanded && (
        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="p-4 bg-[#33DB98]/5 border border-[#33DB98]/10 rounded-xl flex items-start gap-3">
            <Sparkles size={18} className="text-[#33DB98] mt-0.5 shrink-0" />
            <div className="text-sm text-[#33DB98]/90 leading-relaxed font-medium">
              작성자 정보가 있으면 훨씬 설득력 있는 글이 됩니다.{" "}
              <span className="text-[12px] opacity-60 font-medium">
                (선택 사항)
              </span>
              <span className="block text-xs text-gray-500 mt-1 font-normal">
                아래의 항목은 예시입니다. 포스팅할 내용과 관련된 정보를 자유로운
                형식으로 작성해주세요 !<br />
                비워두셔도 AI가 최적의 논리로 글을 완성합니다.
              </span>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute top-4 left-4 text-[#33DB98]/20 group-focus-within:text-[#33DB98]/40 transition-colors">
              <PenTool size={18} />
            </div>
            <textarea
              ref={textareaRef}
              className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#33DB98]/30 focus:border-[#33DB98] text-sm leading-relaxed resize-none text-gray-300 placeholder:text-gray-600 transition-all overflow-hidden"
              placeholder="[자기소개 및 브랜드 슬로건]&#10;&#10;[주요 전문 분야 및 경력]&#10;&#10;[나만의 핵심 가치 및 차별점]..."
              value={brandingText}
              onChange={(e) => setBrandingText(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingTypeSelector;
