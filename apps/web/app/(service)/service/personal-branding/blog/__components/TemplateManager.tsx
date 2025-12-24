"use client";

import React, { useState, useEffect } from "react";
import { X, Trash2, Clock, Bookmark } from "lucide-react";
import { useBlogForm, SavedTemplate } from "./BlogFormContext";

const TemplateManager: React.FC = () => {
  const { templates, loadTemplate, deleteTemplate, isLoadingTemplates } =
    useBlogForm();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoad = (id: string) => {
    if (
      confirm(
        "이 템플릿을 불러오시겠습니까? 현재 입력된 내용은 사라질 수 있습니다.",
      )
    ) {
      loadTemplate(id);
      setIsOpen(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("정말 삭제하시겠습니까?")) {
      await deleteTemplate(id);
    }
  };

  const formatDate = (dateValue: Date | string) => {
    const date = new Date(dateValue);
    return date.toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col items-start gap-2 relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-vzx-card px-4 py-3 rounded-full border border-white/10 shadow-lg hover:bg-white/5 transition-all text-white font-bold group backdrop-blur-md text-[14px]"
      >
        <Bookmark
          size={20}
          className="text-[#33DB98] group-hover:scale-110 transition-transform"
        />
        <span>템플릿</span>
        {mounted && (
          <span className="bg-[#33DB98]/10 text-[#33DB98] text-xs px-2 py-0.5 rounded-full min-w-[24px] text-center border border-[#33DB98]/20">
            {templates.length}
          </span>
        )}
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[45]"
            onClick={() => setIsOpen(false)}
          />
          <div className="bg-vzx-card rounded-2xl border border-white/10 shadow-2xl w-80 max-h-[60vh] overflow-hidden flex flex-col animate-accordion-down origin-top-left backdrop-blur-xl absolute top-full mt-2 right-0 z-[50]">
            <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400">
                저장된 템플릿
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-2">
              {isLoadingTemplates ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock
                    size={32}
                    className="mx-auto mb-2 animate-spin opacity-50"
                  />
                  <p className="text-sm">로딩 중...</p>
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bookmark size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">저장된 템플릿이 없습니다</p>
                </div>
              ) : (
                templates.map((template) => {
                  const formData =
                    typeof template.formData === "string"
                      ? JSON.parse(template.formData)
                      : template.formData;

                  return (
                    <div
                      key={template.id}
                      className="group relative bg-white/5 border border-white/5 hover:border-[#33DB98]/30 rounded-xl p-3 transition-all cursor-pointer hover:bg-white/10"
                      onClick={() => handleLoad(template.id)}
                    >
                      <div className="pr-6">
                        <h4 className="text-sm font-semibold text-gray-200 line-clamp-1 mb-1">
                          {template.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock size={10} />
                          {formatDate(template.createdAt)}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="bg-white/5 text-gray-400 px-1.5 py-0.5 rounded text-[10px]">
                            {formData?.writingType === "CONVERSION"
                              ? "전환용"
                              : formData?.writingType === "BALANCED"
                                ? "보통"
                                : "정보성"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, template.id)}
                        className="absolute top-2 right-2 p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TemplateManager;
