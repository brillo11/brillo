"use client";

import React, { useState, useEffect } from "react";
import { useBlogForm } from "./BlogFormContext";
import AccordionItem from "./AccordionItem";

const StepOptions: React.FC = () => {
  const { formData, updateFormData } = useBlogForm();
  const [tone, setTone] = useState("친절형");
  const [imageGenEnabled, setImageGenEnabled] = useState(false);
  const [disclaimerEnabled, setDisclaimerEnabled] = useState(false);

  // Sync local states when formData changes (e.g., when loading a template)
  useEffect(() => {
    setTone(formData.options.styleReference);
    setImageGenEnabled(formData.options.generateImageWithAi);
    setDisclaimerEnabled(formData.options.disclaimerEnabled);
  }, [
    formData.options.styleReference,
    formData.options.generateImageWithAi,
    formData.options.disclaimerEnabled,
  ]);

  const handleToneChange = (newTone: string) => {
    setTone(newTone);
    updateFormData("options", { ...formData.options, styleReference: newTone });
  };

  const handleImageGenToggle = () => {
    const newValue = !imageGenEnabled;
    setImageGenEnabled(newValue);
    updateFormData("options", {
      ...formData.options,
      generateImageWithAi: newValue,
    });
  };

  const handleDisclaimerToggle = () => {
    const newValue = !disclaimerEnabled;
    setDisclaimerEnabled(newValue);
    updateFormData("options", {
      ...formData.options,
      disclaimerEnabled: newValue,
    });
  };

  return (
    <AccordionItem title="2단계: 글의 옵션 설정하기" defaultOpen={true}>
      <div className="space-y-6">
        {/* Tone */}
        <div>
          <label className="block text-sm font-bold text-white mb-4">
            말투
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="tone"
                checked={tone === "친절형"}
                onChange={() => handleToneChange("친절형")}
                className="w-4 h-4 text-[#33DB98] bg-white/5 border-white/10 focus:ring-[#33DB98] focus:ring-offset-[#0A0A0A]"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                ~해요 (친절형)
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="tone"
                checked={tone === "정중형"}
                onChange={() => handleToneChange("정중형")}
                className="w-4 h-4 text-[#33DB98] bg-white/5 border-white/10 focus:ring-[#33DB98] focus:ring-offset-[#0A0A0A]"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                ~습니다 (정중형)
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="tone"
                checked={tone === "친근형"}
                onChange={() => handleToneChange("친근형")}
                className="w-4 h-4 text-[#33DB98] bg-white/5 border-white/10 focus:ring-[#33DB98] focus:ring-offset-[#0A0A0A]"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                ~해 (친근형)
              </span>
            </label>
          </div>
        </div>

        <hr className="border-white/5" />

        {/* Image Generation */}
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-sm font-bold text-white">이미지 생성</div>
            <div className="text-[11px] text-gray-500 mt-1">
              글에 어울리는 이미지를 자동 생성
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={imageGenEnabled}
              onChange={handleImageGenToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#33DB98]"></div>
          </label>
        </div>

        <hr className="border-white/5" />

        {/* Disclaimer */}
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-sm font-bold text-white">표기 사항 추가</div>
            <div className="text-[11px] text-gray-500 mt-1">
              광고성 포스팅 문구 또는 법적 면책 조항 자동 포함
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={disclaimerEnabled}
              onChange={handleDisclaimerToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#33DB98]"></div>
          </label>
        </div>
      </div>
    </AccordionItem>
  );
};

export default StepOptions;
