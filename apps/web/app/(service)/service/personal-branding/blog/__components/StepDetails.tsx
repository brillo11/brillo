"use client";

import React, { useState, useEffect } from "react";
import { useBlogForm } from "./BlogFormContext";
import AccordionItem from "./AccordionItem";

const StepDetails: React.FC = () => {
  const { formData, updateFormData } = useBlogForm();
  const [length, setLength] = useState(formData.details.length);
  const [styleText, setStyleText] = useState(formData.details.styleText);

  // Sync local states when formData changes (e.g., when loading a template)
  useEffect(() => {
    setLength(formData.details.length);
    setStyleText(formData.details.styleText);
  }, [formData.details.length, formData.details.styleText]);

  const handleLengthChange = (newLength: string) => {
    setLength(newLength);
    updateFormData("details", { ...formData.details, length: newLength });
  };

  const handleStyleTextChange = (value: string) => {
    setStyleText(value);
    updateFormData("details", { ...formData.details, styleText: value });
  };

  return (
    <AccordionItem title="3단계: 글의 세부 설정" defaultOpen={true}>
      <div className="space-y-6">
        {/* Length */}
        <div>
          <label className="block text-sm font-bold text-white mb-4">
            글 길이
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="length"
                checked={length === "500자"}
                onChange={() => handleLengthChange("500자")}
                className="w-4 h-4 text-[#33DB98] bg-white/5 border-white/10 focus:ring-[#33DB98] focus:ring-offset-[#0A0A0A]"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                500자 (짧은 글)
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="length"
                checked={length === "1000자"}
                onChange={() => handleLengthChange("1000자")}
                className="w-4 h-4 text-[#33DB98] bg-white/5 border-white/10 focus:ring-[#33DB98] focus:ring-offset-[#0A0A0A]"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors font-medium">
                1000자 (표준 길이)
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="length"
                checked={length === "2000자"}
                onChange={() => handleLengthChange("2000자")}
                className="w-4 h-4 text-[#33DB98] bg-white/5 border-white/10 focus:ring-[#33DB98] focus:ring-offset-[#0A0A0A]"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                2000자 (긴 글)
              </span>
            </label>
          </div>
        </div>

        <hr className="border-white/5" />

        {/* Style Reference */}
        <div className="pt-2">
          <label className="block text-sm font-bold text-white mb-3">
            글 스타일 참고 (선택사항)
          </label>
          <textarea
            value={styleText}
            onChange={(e) => handleStyleTextChange(e.target.value)}
            className="w-full h-32 p-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#33DB98]/50 focus:border-[#33DB98] text-sm leading-relaxed resize-none text-gray-300 placeholder:text-gray-600 transition-all"
            placeholder="참고할 글의 일부분을 여기에 붙여넣어주세요. AI가 이 글의 스타일과 톤을 분석하여 비슷하게 작성합니다."
          />
        </div>
      </div>
    </AccordionItem>
  );
};

export default StepDetails;
