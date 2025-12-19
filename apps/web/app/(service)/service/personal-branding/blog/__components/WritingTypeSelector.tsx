'use client';

import React, { useEffect } from 'react';
import { useBlogForm } from './BlogFormContext';

const WritingTypeSelector: React.FC = () => {
  const { formData, updateFormData } = useBlogForm();
  const selectedType = formData.writingType;

  const setSelectedType = (type: 'CONVERSION' | 'INFORMATIONAL') => {
    updateFormData('writingType', type);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4 mb-2">
        <span className="font-bold text-slate-900">글쓰기 유형</span>
      </div>
      <div className="flex bg-slate-100 p-1 rounded-lg mb-3 w-fit">
        <button 
          onClick={() => setSelectedType('CONVERSION')}
          className={`px-4 py-1.5 rounded-md text-sm transition-all duration-200 ${
            selectedType === 'CONVERSION' 
              ? 'bg-white text-blue-500 font-bold shadow-sm border border-slate-200/50' 
              : 'text-slate-500 font-medium hover:text-slate-700'
          }`}
        >
          전환용
        </button>
        <button 
          onClick={() => setSelectedType('INFORMATIONAL')}
          className={`px-4 py-1.5 rounded-md text-sm transition-all duration-200 ${
            selectedType === 'INFORMATIONAL' 
              ? 'bg-white text-blue-500 font-bold shadow-sm border border-slate-200/50' 
              : 'text-slate-500 font-medium hover:text-slate-700'
          }`}
        >
          정보성
        </button>
      </div>
      <p className="text-xs text-slate-500 font-medium">
        전환용: 문의/예약 유도 중심 <br /> 정보성: 교육/안내 중심
      </p>
    </div>
  );
};

export default WritingTypeSelector;
