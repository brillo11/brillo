'use client';

import React, { useState, useEffect } from 'react';
import { useBlogForm } from './BlogFormContext';
import AccordionItem from './AccordionItem';

const ContentPlanningSection: React.FC = () => {
  const { formData, updateFormData } = useBlogForm();
  const [youtubeUrl, setYoutubeUrl] = useState(formData.contentPlanning.youtubeUrl);
  const [blogUrl, setBlogUrl] = useState(formData.contentPlanning.blogUrl);
  const [subject, setSubject] = useState(formData.contentPlanning.subject);
  const [targetAudience, setTargetAudience] = useState(formData.contentPlanning.targetAudience);
  const [keyMessage, setKeyMessage] = useState(formData.contentPlanning.keyMessage);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>(formData.contentPlanning.keywords || []);

  // Sync local states when formData changes (e.g., when loading a template)
  useEffect(() => {
    setYoutubeUrl(formData.contentPlanning.youtubeUrl);
    setBlogUrl(formData.contentPlanning.blogUrl);
    setSubject(formData.contentPlanning.subject);
    setTargetAudience(formData.contentPlanning.targetAudience);
    setKeyMessage(formData.contentPlanning.keyMessage);
    setKeywords(formData.contentPlanning.keywords || []);
  }, [
    formData.contentPlanning.youtubeUrl,
    formData.contentPlanning.blogUrl,
    formData.contentPlanning.subject,
    formData.contentPlanning.targetAudience,
    formData.contentPlanning.keyMessage,
    formData.contentPlanning.keywords
  ]);

  const handleYoutubeChange = (value: string) => {
    setYoutubeUrl(value);
    updateFormData('contentPlanning', { ...formData.contentPlanning, youtubeUrl: value });
  };

  const handleBlogChange = (value: string) => {
    setBlogUrl(value);
    updateFormData('contentPlanning', { ...formData.contentPlanning, blogUrl: value });
  };

  const handleSubjectChange = (value: string) => {
    setSubject(value);
    updateFormData('contentPlanning', { ...formData.contentPlanning, subject: value });
  };

  const handleTargetAudienceChange = (value: string) => {
    setTargetAudience(value);
    updateFormData('contentPlanning', { ...formData.contentPlanning, targetAudience: value });
  };

  const handleKeyMessageChange = (value: string) => {
    setKeyMessage(value);
    updateFormData('contentPlanning', { ...formData.contentPlanning, keyMessage: value });
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeywordInput(value);
    
    // Parse only completed keywords (those followed by comma)
    const parts = value.split(',');
    const completedKeywords = parts
      .slice(0, -1) // Exclude the last part (currently being typed)
      .map(k => k.trim().replace(/^#+/, '')) // Remove leading # and trim
      .filter(k => k.length > 0)
      .slice(0, 5); // Limit to 5 keywords
    
    setKeywords(completedKeywords);
    updateFormData('contentPlanning', { ...formData.contentPlanning, keywords: completedKeywords });
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent default Enter behavior
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const removeKeyword = (index: number) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords);
    updateFormData('contentPlanning', { ...formData.contentPlanning, keywords: newKeywords });
  };

  return (
    <AccordionItem title="1단계: 글의 뼈대 세우기" defaultOpen={true}>
      <div className="space-y-5">
        
        {/* YouTube Link */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">유튜브 링크로 자동 입력</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => handleYoutubeChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm shadow-blue-200">
              자동 입력
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">자막을 기반으로 주제/타겟/핵심메시지/키워드를 AI가 생성해 채웁니다.</p>
        </div>

        {/* Blog Link */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">블로그 링크로 자동 입력</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={blogUrl}
              onChange={(e) => handleBlogChange(e.target.value)}
              placeholder="https://blog.naver.com/계정명/글번호"
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm shadow-emerald-200">
              확인
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            네이버 블로그는 모바일 형식으로 청구됩니다. 예) 입력: blog.naver.com/... → 출력: https://m.blog.naver.com/계정/글번호
          </p>
        </div>

        <hr className="border-slate-200" />

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">포스팅 주제</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            placeholder="예: 임플란트 수명 늘리는 법, 목 디스크와 거북목 증후군 차이"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all"
          />
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">타겟 독자</label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => handleTargetAudienceChange(e.target.value)}
            placeholder="예: 40-50대 남성 직장인, 자녀의 충치 때문에 걱정인 30대 부모"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all"
          />
        </div>

        {/* Key Message */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">핵심 메시지 및 강조점</label>
          <textarea
            value={keyMessage}
            onChange={(e) => handleKeyMessageChange(e.target.value)}
            placeholder="예: 임플란트는 초기 관리만 잘하면 반영구적으로 쓸 수 있다는 점을 강조해 줘"
            className="w-full h-24 px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all resize-none"
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            핵심 키워드 <span className="text-slate-400 font-normal">(최대 5개)</span>
          </label>
          
          {/* Keyword Tags */}
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {keywords.map((keyword, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-600 border border-blue-100">
                  #{keyword}
                  <button 
                    onClick={() => removeKeyword(index)}
                    className="ml-1.5 hover:text-blue-800 text-blue-400 rounded-full hover:bg-blue-100 p-0.5 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <input
            type="text"
            value={keywordInput}
            onChange={handleKeywordChange}
            onKeyDown={handleKeywordKeyDown}
            placeholder="예: 강남역치과, 임플란트가격, 허리디스크초기증상"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all"
            disabled={keywords.length >= 5}
          />
          <p className="text-xs text-slate-400 mt-1">
           쉼표(,)로 키워드를 구분하세요. ({keywords.length}/5)
          </p>
        </div>

      </div>
    </AccordionItem>
  );
};

export default ContentPlanningSection;