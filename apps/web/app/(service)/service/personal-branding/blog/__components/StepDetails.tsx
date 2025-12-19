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
          <label className="block text-sm font-medium text-slate-800 mb-3">
            글 길이
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="length"
                checked={length === "500자"}
                onChange={() => handleLengthChange("500자")}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">500자 (짧은 글)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="length"
                checked={length === "1000자"}
                onChange={() => handleLengthChange("1000자")}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 font-medium">
                1000자 (표준 길이)
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="length"
                checked={length === "2000자"}
                onChange={() => handleLengthChange("2000자")}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">2000자 (긴 글)</span>
            </label>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Style Reference */}
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-2">
            글 스타일 참고 (선택사항)
          </label>
          <textarea
            value={styleText}
            onChange={(e) => handleStyleTextChange(e.target.value)}
            className="w-full h-24 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm leading-relaxed resize-none bg-slate-50 focus:bg-white transition-colors"
            placeholder="참고할 글의 일부분을 여기에 붙여넣어주세요. AI가 이 글의 스타일과 톤을 분석하여 비슷하게 작성합니다."
          />
        </div>
      </div>
    </AccordionItem>
  );
};

export default StepDetails;
