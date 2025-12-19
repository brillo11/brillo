'use client'
import React, { useState, useEffect } from 'react';
import { HelpCircle, X, Save, Search, Check, Plus, ChevronDown } from 'lucide-react';
import AccordionItem from './AccordionItem';
import { useBlogForm } from './BlogFormContext';

const SPECIALTY_GROUPS = [
  {
    group: "의학과",
    items: [
      "피부과", "성형외과", "정형외과", "신경외과", "내과", "외과", "흉부외과",
      "마취통증의학과", "소아청소년과", "산부인과", "비뇨의학과", "안과",
      "이비인후과", "정신건강의학과", "재활의학과", "가정의학과",
      "응급의학과", "진단검사의학과", "병리과", "방사선종양학과", "핵의학과"
    ]
  },
  {
    group: "치과 분야",
    items: [
      "치과보존과 (충치 치료)", "치과교정과 (교정)", "치과보철과 (틀니·크라운)",
      "구강악안면외과 (사랑니, 턱 수술)", "소아치과", "치주과 (잇몸)",
      "예방치과", "구강내과", "통합치의학과"
    ]
  },
  {
    group: "한방 분야",
    items: [
      "한방내과", "한방부인과", "한방소아과", "침구과", "한방재활의학과",
      "사상체질과", "한방신경정신과", "한방안·이비인후·피부과"
    ]
  },
  {
    group: "기타 특수분야",
    items: [
      "검진센터 (건강검진 전문)", "종양센터 (암 전문)", "심뇌혈관센터", "불임·난임센터",
      "수면센터", "의료미용센터 (미용성형, 피부시술)", "통증클리닉", "스포츠의학센터"
    ]
  }
];

const BrandingSection: React.FC = () => {
  const { formData, updateFormData } = useBlogForm();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [brandingText, setBrandingText] = useState(formData.branding.brandingText);
  
  const selectedSpecialties = formData.branding.specialties;
  const setSelectedSpecialties = (specialties: string[]) => {
    updateFormData('branding', { ...formData.branding, specialties });
  };

  const toggleSpecialty = (item: string) => {
    if (selectedSpecialties.includes(item)) {
      setSelectedSpecialties(selectedSpecialties.filter(i => i !== item));
    } else {
      if (selectedSpecialties.length >= 3) return;
      setSelectedSpecialties([...selectedSpecialties, item]);
    }
  };

  const removeSpecialty = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSpecialties(selectedSpecialties.filter(i => i !== item));
  };
  
  // Sync local state when formData changes (e.g., when loading a template)
  useEffect(() => {
    setBrandingText(formData.branding.brandingText);
  }, [formData.branding.brandingText]);
  
  // Sync branding text to context on change
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFormData('branding', { ...formData.branding, brandingText });
    }, 500);
    return () => clearTimeout(timer);
  }, [brandingText]);
  
  // Filter groups based on search
  const filteredGroups = SPECIALTY_GROUPS.map(groupData => {
    const filteredItems = groupData.items.filter(item => 
      item.includes(searchQuery) || groupData.group.includes(searchQuery)
    );
    return { ...groupData, items: filteredItems };
  }).filter(groupData => groupData.items.length > 0);

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
          <label className="block text-sm font-medium text-slate-700 mb-2 flex justify-between">
            <span>전문분야 선택 <span className="text-slate-400 font-normal">최대 3개</span></span>
          </label>
          
          {/* Selected Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedSpecialties.map(item => (
              <span key={item} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-600 border border-blue-100 animate-in fade-in zoom-in duration-200">
                {item} 
                <button 
                  onClick={(e) => removeSpecialty(item, e)}
                  className="ml-1.5 hover:text-blue-800 text-blue-400 rounded-full hover:bg-blue-100 p-0.5 transition-colors"
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
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all shadow-sm"
                placeholder="검색 (예: 피부, 정형외과, 한방)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
              />
              <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            </div>

            {/* Dropdown List */}
            {isOpen && (
              <div className="absolute w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-[320px] overflow-y-auto overflow-x-hidden">
                <div role="listbox" className="py-2">
                  {filteredGroups.length > 0 ? (
                    filteredGroups.map((groupData) => (
                      <div key={groupData.group}>
                        <div className="px-4 py-2 text-xs font-bold text-slate-400 bg-slate-50/50 sticky top-0 backdrop-blur-sm border-y first:border-t-0 border-slate-100">
                          {groupData.group}
                        </div>
                        {groupData.items.map(item => {
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
                                ${isSelected ? 'bg-blue-50/60 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}
                                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                              onClick={() => !isDisabled && toggleSpecialty(item)}
                            >
                              <span className="truncate">{item}</span>
                              {isSelected ? (
                                <Check size={16} className="text-blue-600" />
                              ) : (
                                <Plus size={16} className="text-slate-300" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-slate-500 text-sm">
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
            
            {/* Click outside handler needs to be robust, using fixed backdrop for simplicity here inside the conditional or just blur could work but blur is tricky with click items */}
            {isOpen && (
               <div className="fixed inset-0 z-10 bg-transparent" onClick={() => setIsOpen(false)} />
            )}
          </div>
        </div>

        {/* Branding Text */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
            브랜딩 및 가치입증 정보 
            <HelpCircle size={14} className="text-slate-400" />
          </label>
          <textarea
            className="w-full min-h-[530px] p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm leading-relaxed resize-none bg-slate-50 font-sans focus:bg-white transition-colors scrollbar-hide"
            value={brandingText}
            onChange={(e) => setBrandingText(e.target.value)}
          />
        </div>
      </div>
    </AccordionItem>
  );
};

export default BrandingSection;