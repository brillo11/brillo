"use client";
import React, { useState, useEffect } from "react";
import { HelpCircle, X, Search, Check, Plus } from "lucide-react";
import AccordionItem from "./AccordionItem";
import { useBlogForm } from "./BlogFormContext";

const SPECIALTY_GROUPS = [
  {
    group: "라이프스타일",
    items: ["사진", "애완·반려동물", "육아·결혼", "인테리어", "자동차", "취미"],
  },
  {
    group: "비즈니스 & 테크",
    items: ["IT·컴퓨터", "게임", "비즈니스·경제", "상품·리뷰"],
  },
  {
    group: "푸드 & 여행",
    items: ["맛집", "스포츠"],
  },
  {
    group: "교육 & 학문",
    items: ["건강·의학", "교육·학문", "문학·책", "어학·외국어"],
  },
  {
    group: "문화 & 예술",
    items: ["공연·전시", "미술·디자인", "영화", "음악"],
  },
];

const BrandingSection: React.FC = () => {
  const { formData, updateFormData } = useBlogForm();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [brandingText, setBrandingText] = useState(
    formData.branding.brandingText
  );

  const selectedSpecialties = formData.branding.specialties;
  const setSelectedSpecialties = (specialties: string[]) => {
    updateFormData("branding", { ...formData.branding, specialties });
  };

  const toggleSpecialty = (item: string) => {
    if (selectedSpecialties.includes(item)) {
      setSelectedSpecialties(selectedSpecialties.filter((i) => i !== item));
    } else {
      if (selectedSpecialties.length >= 3) return;
      setSelectedSpecialties([...selectedSpecialties, item]);
    }
  };

  const removeSpecialty = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSpecialties(selectedSpecialties.filter((i) => i !== item));
  };

  // Sync local state when formData changes (e.g., when loading a template)
  useEffect(() => {
    setBrandingText(formData.branding.brandingText);
  }, [formData.branding.brandingText]);

  // Sync branding text to context on change
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFormData("branding", { ...formData.branding, brandingText });
    }, 500);
    return () => clearTimeout(timer);
  }, [brandingText, formData.branding, updateFormData]);

  // Filter groups based on search
  const filteredGroups = SPECIALTY_GROUPS.map((groupData) => {
    const filteredItems = groupData.items.filter(
      (item) =>
        item.toLowerCase().includes(searchQuery.toLowerCase()) ||
        groupData.group.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...groupData, items: filteredItems };
  }).filter((groupData) => groupData.items.length > 0);

  return (
    <AccordionItem title="0단계: 브랜딩 정보" defaultOpen={true}>
      <div className="space-y-6">
        {/* Specialties */}
        <div>
          <label className="text-sm font-bold text-white mb-3 flex justify-between">
            <span>
              활동 분야 선택{" "}
              <span className="text-gray-500 font-normal ml-1">최대 3개</span>
            </span>
          </label>

          {/* Selected Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSpecialties.map((item) => (
              <span
                key={item}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[#33DB98]/10 text-[#33DB98] border border-[#33DB98]/20 animate-in fade-in zoom-in duration-200"
              >
                {item}
                <button
                  onClick={(e) => removeSpecialty(item, e)}
                  className="ml-1.5 hover:text-white text-[#33DB98]/60 rounded-full hover:bg-[#33DB98]/20 p-0.5 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>

          {/* Search & Dropdown */}
          <div className="relative">
            <div className="relative">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#33DB98]/50 focus:border-[#33DB98] text-sm transition-all text-white placeholder:text-gray-600"
                placeholder="검색 (예: IT, 맛집, 테크, 여행)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
              />
              <Search
                className="absolute left-3 top-3.5 text-gray-500"
                size={18}
              />
            </div>

            {/* Dropdown List */}
            {isOpen && (
              <div className="absolute w-full mt-2 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl z-20 max-h-[320px] overflow-y-auto overflow-x-hidden backdrop-blur-xl">
                <div role="listbox" className="py-2">
                  {filteredGroups.length > 0 ? (
                    filteredGroups.map((groupData) => (
                      <div key={groupData.group}>
                        <div className="px-4 py-2 text-[10px] font-bold text-gray-500 bg-white/5 sticky top-0 backdrop-blur-md border-y first:border-t-0 border-white/5 uppercase tracking-wider">
                          {groupData.group}
                        </div>
                        {groupData.items.map((item) => {
                          const isSelected = selectedSpecialties.includes(item);
                          const isMaxReached = selectedSpecialties.length >= 3;
                          const isDisabled = !isSelected && isMaxReached;

                          return (
                            <div
                              key={item}
                              role="option"
                              aria-selected={isSelected}
                              className={`
                                flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition-colors
                                ${isSelected ? "bg-[#33DB98]/10 text-[#33DB98] font-medium" : "text-gray-400 hover:bg-white/5 hover:text-white"}
                                ${isDisabled ? "opacity-30 cursor-not-allowed" : ""}
                              `}
                              onClick={() =>
                                !isDisabled && toggleSpecialty(item)
                              }
                            >
                              <span className="truncate">{item}</span>
                              {isSelected ? (
                                <Check size={16} className="text-[#33DB98]" />
                              ) : (
                                <Plus size={16} className="text-gray-600" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm font-medium">
                      검색 결과가 없습니다.
                    </div>
                  )}
                </div>
                {/* Backdrop to close */}
                <div
                  className="fixed inset-0 z-[-1]"
                  onClick={() => setIsOpen(false)}
                />
              </div>
            )}

            {/* Click outside handler */}
            {isOpen && (
              <div
                className="fixed inset-0 z-10 bg-transparent"
                onClick={() => setIsOpen(false)}
              />
            )}
          </div>
        </div>

        {/* Branding Text */}
        <div>
          <label className="text-sm font-bold text-white mb-3 flex items-center gap-1">
            브랜딩 정보 및 가치 제안
            <HelpCircle size={14} className="text-gray-500" />
          </label>
          <textarea
            className="w-full min-h-[530px] p-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#33DB98]/50 focus:border-[#33DB98] text-sm leading-relaxed resize-none text-gray-300 placeholder:text-gray-600 transition-all scrollbar-hide"
            placeholder="본인만의 전문성과 블로그 독자에게 강조하고 싶은 가치 정보를 입력해주세요."
            value={brandingText}
            onChange={(e) => setBrandingText(e.target.value)}
          />
        </div>
      </div>
    </AccordionItem>
  );
};

export default BrandingSection;
