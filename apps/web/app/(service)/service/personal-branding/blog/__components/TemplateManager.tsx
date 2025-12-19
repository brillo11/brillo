'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, FileText, Clock } from 'lucide-react';
import { useBlogForm, SavedTemplate } from './BlogFormContext';

interface TemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ isOpen, onClose }) => {
  const { getSavedTemplates, loadTemplate, deleteTemplate } = useBlogForm();
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTemplates(getSavedTemplates());
    }
  }, [isOpen, getSavedTemplates]);

  const handleLoad = (id: string) => {
    loadTemplate(id);
    onClose();
  };

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    setTemplates(getSavedTemplates());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="text-blue-600" size={28} />
            저장된 템플릿
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">저장된 템플릿이 없습니다</p>
              <p className="text-slate-400 text-sm mt-2">
                템플릿을 저장하면 여기에 표시됩니다
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-lg mb-2 truncate">
                        {template.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock size={14} />
                        <span>{formatDate(template.createdAt)}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
                          {template.formData.writingType === 'CONVERSION' ? '전환용' : '정보성'}
                        </span>
                        {template.formData.branding.specialties.length > 0 && (
                          <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-medium">
                            {template.formData.branding.specialties.join(', ')}
                          </span>
                        )}
                        {template.formData.contentPlanning.keywords.length > 0 && (
                          <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md font-medium">
                            키워드 {template.formData.contentPlanning.keywords.length}개
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleLoad(template.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        불러오기
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateManager;
