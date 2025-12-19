'use client';

import React, { useState, useEffect } from 'react';
import { useBlogForm } from './BlogFormContext';
import AccordionItem from './AccordionItem';

const StepOptions: React.FC = () => {
  const { formData, updateFormData } = useBlogForm();
  const [tone, setTone] = useState('친절형');
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
    formData.options.disclaimerEnabled
  ]);

  const handleToneChange = (newTone: string) => {
    setTone(newTone);
    updateFormData('options', { ...formData.options, styleReference: newTone });
  };

  const handleImageGenToggle = () => {
    const newValue = !imageGenEnabled;
    setImageGenEnabled(newValue);
    updateFormData('options', { ...formData.options, generateImageWithAi: newValue });
  };

  const handleDisclaimerToggle = () => {
    const newValue = !disclaimerEnabled;
    setDisclaimerEnabled(newValue);
    updateFormData('options', { ...formData.options, disclaimerEnabled: newValue });
  };

  return (
    <AccordionItem title="2단계: 글의 옵션 설정하기" defaultOpen={true}>
      <div className="space-y-6">
        
        {/* Tone */}
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-3">말투</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="tone" checked={tone === '친절형'} onChange={() => handleToneChange('친절형')} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
              <span className="text-sm text-slate-700 font-medium">~해요 (친절형)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="tone" checked={tone === '정중형'} onChange={() => handleToneChange('정중형')} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
              <span className="text-sm text-slate-700">~습니다 (정중형)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="tone" checked={tone === '친근형'} onChange={() => handleToneChange('친근형')} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
              <span className="text-sm text-slate-700">~해 (친근형)</span>
            </label>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Image Generation */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-800">이미지 생성</div>
            <div className="text-xs text-slate-500">글에 어울리는 이미지를 자동 생성</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={imageGenEnabled} onChange={handleImageGenToggle} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <hr className="border-slate-100" />

        {/* Disclaimer */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-800">필수 고지 사항</div>
            <div className="text-xs text-slate-500">2025 의료법 가이드라인 기반 안내 문구 자동 포함</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={disclaimerEnabled} onChange={handleDisclaimerToggle} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

      </div>
    </AccordionItem>
  );
};

export default StepOptions;