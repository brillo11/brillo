"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  saveBlogTemplate as saveTemplateAction,
  getBlogTemplates,
  deleteBlogTemplate as deleteTemplateAction,
} from "@/serverActions/blog/blog-storage.actions";
import { toast } from "sonner";

// TypeScript interfaces for form data
export interface BlogFormData {
  brandingMode: "MINIMAL" | "BALANCED" | "STRONG";
  branding: {
    specialties: string[];
    brandingText: string;
  };
  contentPlanning: {
    youtubeUrl: string;
    blogUrl: string;
    subject: string;
    targetAudience: string;
    keyMessage: string;
    keywords: string[];
  };
  options: {
    generateImageWithAi: boolean;
    disclaimerEnabled: boolean;
    styleReference: string;
  };
  details: {
    length: string;
    styleText: string;
    referenceUrl?: string;
    referenceKeyword?: string;
    styleAnalysisResult?: string;
  };
  gif: {
    youtubeUrl: string;
    startTimes: string[];
  };
  photo: {
    uploadedFile: string;
    originalUrl?: string;
    editedUrl?: string;
    instruction?: string;
  };
}

export interface SavedTemplate {
  id: string;
  name: string;
  formData: any; // DB에서 가져올 때 Json 타입
  createdAt: Date | string;
}

interface BlogFormContextType {
  formData: BlogFormData;
  updateFormData: (section: keyof BlogFormData, data: any) => void;
  templates: SavedTemplate[];
  isLoadingTemplates: boolean;
  saveTemplate: (name: string) => Promise<void>;
  loadTemplate: (id: string) => void;
  setFullFormData: (data: Partial<BlogFormData>) => void;
  deleteTemplate: (id: string) => Promise<void>;
  refreshTemplates: () => Promise<void>;
}

// Default form data
const defaultFormData: BlogFormData = {
  brandingMode: "BALANCED",
  branding: {
    specialties: [],
    brandingText: `[자기소개 및 브랜드 슬로건]


[주요 전문 분야 및 경력]


[나만의 핵심 가치 및 차별점]
1. 
2. 
3. 

[대표적인 성과 및 포트폴리오]


[독자 혜택 및 문의 링크]`,
  },
  contentPlanning: {
    youtubeUrl: "",
    blogUrl: "",
    subject: "",
    targetAudience: "",
    keyMessage: "",
    keywords: [],
  },
  options: {
    generateImageWithAi: false,
    disclaimerEnabled: false,
    styleReference: "친절형",
  },
  details: {
    length: "1000자",
    styleText: "",
  },
  gif: {
    youtubeUrl: "",
    startTimes: [],
  },
  photo: {
    uploadedFile: "",
  },
};

// Create context
const BlogFormContext = createContext<BlogFormContextType | undefined>(
  undefined,
);

// Provider component
export const BlogFormProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [formData, setFormData] = useState<BlogFormData>(defaultFormData);
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  const refreshTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const data = await getBlogTemplates();
      setTemplates(data as any);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  useEffect(() => {
    refreshTemplates();
  }, []);

  const updateFormData = (section: keyof BlogFormData, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: typeof data === "function" ? data(prev[section]) : data,
    }));
  };

  const saveTemplate = async (name: string) => {
    try {
      await saveTemplateAction(name, formData);
      await refreshTemplates();
      toast.success("템플릿이 저장되었습니다.");
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error("템플릿 저장에 실패했습니다.");
    }
  };

  const setFullFormData = (loadedData: Partial<BlogFormData>) => {
    // 기본값과 병합하여 누락된 필드가 없도록 보장
    const mergedData = {
      ...defaultFormData,
      ...loadedData,
      brandingMode: loadedData.brandingMode || defaultFormData.brandingMode,
      branding: { ...defaultFormData.branding, ...loadedData.branding },
      contentPlanning: {
        ...defaultFormData.contentPlanning,
        ...loadedData.contentPlanning,
      },
      options: { ...defaultFormData.options, ...loadedData.options },
      details: { ...defaultFormData.details, ...loadedData.details },
      gif: { ...defaultFormData.gif, ...loadedData.gif },
      photo: { ...defaultFormData.photo, ...loadedData.photo },
    } as BlogFormData;

    setFormData(mergedData);
  };

  const loadTemplate = (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (template) {
      // formData가 DB에서 올 때 string이면 파싱, 아니면 그대로 사용
      const loadedData =
        typeof template.formData === "string"
          ? JSON.parse(template.formData)
          : template.formData;

      setFullFormData(loadedData);
      toast.success(`'${template.name}' 템플릿을 불러왔습니다.`);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await deleteTemplateAction(id);
      await refreshTemplates();
      toast.success("템플릿이 삭제되었습니다.");
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast.error("템플릿 삭제에 실패했습니다.");
    }
  };

  return (
    <BlogFormContext.Provider
      value={{
        formData,
        updateFormData,
        templates,
        isLoadingTemplates,
        saveTemplate,
        loadTemplate,
        setFullFormData,
        deleteTemplate,
        refreshTemplates,
      }}
    >
      {children}
    </BlogFormContext.Provider>
  );
};

// Custom hook to use the context
export const useBlogForm = () => {
  const context = useContext(BlogFormContext);
  if (context === undefined) {
    throw new Error("useBlogForm must be used within a BlogFormProvider");
  }
  return context;
};
