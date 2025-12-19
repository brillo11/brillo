"use client";

import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, ArrowLeft, Loader2, Copy, Download, FileText } from 'lucide-react';
import { useBlogForm } from './BlogFormContext';

interface RightPanelProps {
  generatedContent?: string;
  isGenerating?: boolean;
  error?: string;
  generatedTitles?: string[];
  isGeneratingTitles?: boolean;
  selectedTitle?: string;
  onSelectTitle?: (title: string) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ 
  generatedContent = '', 
  isGenerating = false, 
  error = '',
  generatedTitles = [],
  isGeneratingTitles = false,
  selectedTitle = '',
  onSelectTitle
}) => {
  const { getSavedTemplates, loadTemplate } = useBlogForm();
  const [isRecentOpen, setIsRecentOpen] = useState(true);
  const [templates, setTemplates] = useState<ReturnType<typeof getSavedTemplates>>([]);

  useEffect(() => {
    setTemplates(getSavedTemplates());
  }, [getSavedTemplates]);

  const handleLoadTemplate = (id: string) => {
    loadTemplate(id);
    // 템플릿 적용 알림
    const template = templates.find(t => t.id === id);
    if (template) {
      alert(`"${template.name}" 템플릿이 적용되었습니다!`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  return (
    <div className="space-y-6">
      
      {/* Recent Templates */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <button 
          onClick={() => setIsRecentOpen(!isRecentOpen)}
          className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <h3 className="font-bold text-slate-800">최근 템플릿</h3>
            {templates.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {templates.length}
              </span>
            )}
          </div>
          {isRecentOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
        </button>
        {isRecentOpen && (
          <div className="border-t border-slate-100">
            {templates.length === 0 ? (
              <div className="p-4 min-h-[60px] flex items-center justify-center text-sm text-slate-400">
                저장된 템플릿이 없습니다.
              </div>
            ) : (
              <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
                {templates.slice(0, 5).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleLoadTemplate(template.id)}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <FileText size={16} className="text-slate-400 group-hover:text-blue-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate group-hover:text-blue-700">
                          {template.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(template.createdAt).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Blog Title Suggestion */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden min-h-[150px]">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
             <div className="text-yellow-500">💡</div>
             <h3 className="font-bold text-slate-800">블로그 제목 추천</h3>
             {generatedTitles.length > 0 && (
               <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                 {generatedTitles.length}개
               </span>
             )}
          </div>
        </div>
        
        {isGeneratingTitles ? (
          <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
            <Loader2 size={32} className="text-yellow-500 animate-spin" />
            <span className="text-sm text-slate-600">제목 생성 중...</span>
          </div>
        ) : generatedTitles.length > 0 ? (
          <div className="p-4 space-y-2">
            {generatedTitles.map((title, index) => (
              <button
                key={index}
                onClick={() => onSelectTitle?.(title)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedTitle === title
                    ? 'border-yellow-500 bg-yellow-50 shadow-sm'
                    : 'border-slate-200 hover:border-yellow-300 hover:bg-yellow-50/50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-slate-400 mt-0.5">
                    {index + 1}
                  </span>
                  <span className={`text-sm flex-1 ${
                    selectedTitle === title ? 'text-yellow-900 font-medium' : 'text-slate-700'
                  }`}>
                    {title}
                  </span>
                  {selectedTitle === title && (
                    <span className="text-yellow-500 text-xs">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center text-center text-slate-400 gap-2 h-full">
             <ArrowLeft size={24} />
             <span className="text-sm">좌측 폼을 작성하고 생성 버튼을 눌러주세요</span>
          </div>
        )}
      </div>

      {/* Generated Blog Post */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
         <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="text-blue-500">📄</div>
               <h3 className="font-bold text-slate-800">생성된 블로그 글</h3>
            </div>
            {generatedContent && (
              <div className="flex gap-2">
                <button onClick={handleCopy} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="복사">
                  <Copy size={16} className="text-slate-600" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="다운로드">
                  <Download size={16} className="text-slate-600" />
                </button>
              </div>
            )}
          </div>
        </div>
         <div className="p-6">
           {isGenerating && !generatedContent && (
             <div className="flex flex-col items-center justify-center text-center text-slate-400 gap-3 h-60">
               <Loader2 size={32} className="animate-spin text-blue-500" />
               <span className="text-sm">AI가 블로그 글을 생성하고 있습니다...</span>
             </div>
           )}
           {error && (
             <div className="flex flex-col items-center justify-center text-center text-red-500 gap-2 h-60">
               <span className="text-sm font-medium">오류가 발생했습니다</span>
               <span className="text-xs text-red-400">{error}</span>
             </div>
           )}
           {!isGenerating && !generatedContent && !error && (
             <div className="flex flex-col items-center justify-center text-center text-slate-400 gap-2 h-60">
               <ArrowLeft size={24} />
               <span className="text-sm">좌측 폼을 작성하고 생성 버튼을 눌러주세요</span>
             </div>
           )}
           {generatedContent && (
            <>
             <div className="prose prose-slate max-w-none">
              {/* <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                 {generatedContent}
               </div> */}
               <div 
                 className="text-sm leading-relaxed"
                 dangerouslySetInnerHTML={{ __html: generatedContent }}
               />
               
             </div>
             <button onClick={() => {console.log(generatedContent)}}>
              테스트
             </button>
             </>
           )}
        </div>
      </div>

    </div>
  );
};

export default RightPanel;