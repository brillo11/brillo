"use client";

import React, { useEffect } from "react";
import { useBlogForm } from "./BlogFormContext";

const WritingTypeSelector: React.FC = () => {
  const { formData, updateFormData } = useBlogForm();
  const selectedType = formData.writingType;

  const setSelectedType = (type: "CONVERSION" | "INFORMATIONAL") => {
    updateFormData("writingType", type);
  };

  return (
    <div className="bg-vzx-card p-6 rounded-2xl border border-white/5 shadow-sm">
      <div className="flex items-center gap-4 mb-3">
        <span className="font-bold text-white text-lg">글쓰기 유형</span>
      </div>
      <div className="flex bg-white/5 p-1 rounded-xl mb-4 w-fit border border-white/5">
        <button
          onClick={() => setSelectedType("CONVERSION")}
          className={`px-5 py-2 rounded-lg text-sm transition-all duration-300 ${
            selectedType === "CONVERSION"
              ? "bg-[#33DB98] text-black font-bold shadow-lg shadow-[#33DB98]/10"
              : "text-gray-500 font-medium hover:text-white hover:bg-white/5"
          }`}
        >
          전환용
        </button>
        <button
          onClick={() => setSelectedType("INFORMATIONAL")}
          className={`px-5 py-2 rounded-lg text-sm transition-all duration-300 ${
            selectedType === "INFORMATIONAL"
              ? "bg-[#33DB98] text-black font-bold shadow-lg shadow-[#33DB98]/10"
              : "text-gray-500 font-medium hover:text-white hover:bg-white/5"
          }`}
        >
          정보성
        </button>
      </div>
      <p className="text-xs text-gray-500 font-medium leading-relaxed">
        <span className="text-[#33DB98]/80">전환용</span>: 문의/예약 유도 중심{" "}
        <br />
        <span className="text-[#33DB98]/80">정보성</span>: 교육/안내 중심
      </p>
    </div>
  );
};

export default WritingTypeSelector;
