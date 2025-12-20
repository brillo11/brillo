"use client";
import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  X,
  Save,
  Search,
  Check,
  Plus,
  ChevronDown,
} from "lucide-react";
import AccordionItem from "./AccordionItem";
import { useBlogForm } from "./BlogFormContext";

const SPECIALTY_GROUPS = [
  {
    group: "의학과",
    items: [
      "피부과",
      "성형외과",
      "정형외과",
      "신경외과",
      "내과",
      "외과",
      "흉부외과",
      "마취통증의학과",
      "소아청소년과",
      "산부인과",
      "비뇨의학과",
      "안과",
      "이비인후과",
      "정신건강의학과",
      "재활의학과",
      "가정의학과",
      "응급의학과",
      "진단검사의학과",
      "병리과",
      "방사선종양학과",
      "핵의학과",
    ],
  },
  {
    group: "치과 분야",
    items: [
      "치과보존과 (충치 치료)",
      "치과교정과 (교정)",
      "치과보철과 (틀니·크라운)",
      "구강악안면외과 (사랑니, 턱 수술)",
      "소아치과",
      "치주과 (잇몸)",
      "예방치과",
      "구강내과",
      "통합치의학과",
    ],
  },
  {
    group: "한방 분야",
    items: [
      "한방내과",
      "한방부인과",
      "한방소아과",
      "침구과",
      "한방재활의학과",
      "사상체질과",
      "한방신경정신과",
      "한방안·이비인후·피부과",
    ],
  },
  {
    group: "기타 특수분야",
    items: [
      "검진센터 (건강검진 전문)",
      "종양센터 (암 전문)",
      "심뇌혈관센터",
      "불임·난임센터",
      "수면센터",
      "의료미용센터 (미용성형, 피부시술)",
      "통증클리닉",
      "스포츠의학센터",
    ],
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
  }, [brandingText]);

  // Filter groups based on search
  const filteredGroups = SPECIALTY_GROUPS.map((groupData) => {
    const filteredItems = groupData.items.filter(
      (item) =>
        item.includes(searchQuery) || groupData.group.includes(searchQuery)
    );
    return { ...groupData, items: filteredItems };
  }).filter((groupData) => groupData.items.length > 0);

  return (
    <AccordionItem
      title="0단계: 브랜딩 정보"
      defaultOpen={true}
      // headerRight={
      //   <div
      //     onClick={(e) => {
      //       e.stopPropagation();
      //       handleSaveTemplate();
      //     }}
      //     className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 hover:bg-blue-100 transition-colors border border-blue-100 cursor-pointer"
      //   >
      //     <Save size={14} /> 템플릿 저장
      //   </div>
      // }
    >
      <div className="space-y-6">
        {/* Specialties */}
        <div>
          <label className="text-sm font-bold text-white mb-3 flex justify-between">
            <span>
              전문분야 선택{" "}
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
                placeholder="검색 (예: 피부, 정형외과, 한방)..."
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
            브랜딩 및 가치입증 정보
            <HelpCircle size={14} className="text-gray-500" />
          </label>
          <textarea
            className="w-full min-h-[530px] p-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#33DB98]/50 focus:border-[#33DB98] text-sm leading-relaxed resize-none text-gray-300 placeholder:text-gray-600 transition-all scrollbar-hide"
            placeholder="원장님만의 전문성과 블로그에서 강조하고 싶은 가치 정보를 입력해주세요."
            value={brandingText}
            onChange={(e) => setBrandingText(e.target.value)}
          />
        </div>
      </div>
    </AccordionItem>
  );
};

export default BrandingSection;
