"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// TypeScript interfaces for form data
export interface BlogFormData {
  writingType: "INFORMATIONAL" | "BALANCED" | "CONVERSION";
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
    brandingIntensity: "MINIMAL" | "BALANCED" | "STRONG";
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
  formData: BlogFormData;
  createdAt: string;
}

interface BlogFormContextType {
  formData: BlogFormData;
  updateFormData: (section: keyof BlogFormData, data: any) => void;
  saveTemplate: (name: string) => void;
  loadTemplate: (id: string) => void;
  deleteTemplate: (id: string) => void;
  getSavedTemplates: () => SavedTemplate[];
}

// Default form data
const defaultFormData: BlogFormData = {
  writingType: "CONVERSION",
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
    brandingIntensity: "BALANCED",
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
  undefined
);

const STORAGE_KEY = "blog-templates";

// Provider component
export const BlogFormProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [formData, setFormData] = useState<BlogFormData>(defaultFormData);

  const updateFormData = (section: keyof BlogFormData, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: typeof data === "function" ? data(prev[section]) : data,
    }));
  };

  const getSavedTemplates = (): SavedTemplate[] => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  };

  const saveTemplate = (name: string) => {
    const templates = getSavedTemplates();
    const newTemplate: SavedTemplate = {
      id: Date.now().toString(),
      name,
      formData,
      createdAt: new Date().toISOString(),
    };
    templates.push(newTemplate);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  };

  const loadTemplate = (id: string) => {
    const templates = getSavedTemplates();
    const template = templates.find((t) => t.id === id);
    if (template) {
      setFormData(template.formData);
    }
  };

  const deleteTemplate = (id: string) => {
    const templates = getSavedTemplates();
    const filtered = templates.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  };

  return (
    <BlogFormContext.Provider
      value={{
        formData,
        updateFormData,
        saveTemplate,
        loadTemplate,
        deleteTemplate,
        getSavedTemplates,
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
