"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import type { CreatorPersona, Step, ChatMessage } from "./types";
import { Step1Persona } from "./step1-persona";
import { Step2Topic } from "./step2-topic";
import { Step3Titles } from "./step3-titles";
import { Step4ThumbGuide } from "./step4-thumb-guide";
import { Step5ThumbGen } from "./step5-thumb-gen";
import { Step6Script } from "./step6-script";
import { Step7Metadata } from "./step7-metadata";
import { Step8ShortsTitles } from "./step8-shorts-titles";
import {
  createAIAssistantSession,
  updateAIAssistantSession,
} from "@/serverActions/ai-assistant/ai-assistant-session.actions";
import {
  sendTitleResponses,
  sendScriptResponses,
  sendThumbnailGuideResponses,
  sendThumbnailResponses,
  sendFixThumbnailResponses,
  sendMetadataResponses,
  sendShortsTitlesResponses,
} from "@/serverActions/ai-assistant/ai-assistant.actions";

export function AIAssistantClient() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>({});
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedPersona, setSelectedPersona] = useState<CreatorPersona | null>(
    null
  );
  const [topic, setTopic] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedTitleIndex, setSelectedTitleIndex] = useState<number | null>(
    null
  );
  const [selectedGuide, setSelectedGuide] = useState<number | null>(null);
  const [referenceThumbnails, setReferenceThumbnails] = useState<
    Array<{ id: string; url: string; title?: string }>
  >([]);

  // Loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTitleLoading, setIsTitleLoading] = useState(false);
  const [isThumbnailGuideLoading, setIsThumbnailGuideLoading] = useState(false);
  const [isThumbnailLoading, setIsThumbnailLoading] = useState(false);
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);
  const [isShortsTitlesLoading, setIsShortsTitlesLoading] = useState(false);

  // Chat & Thumbnail State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "ai",
      text: "I have generated a thumbnail based on your guide. How does it look? We can adjust colors, text placement, or the main subject.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    "https://picsum.photos/seed/thumb1/800/450"
  );
  const [thumbnailEditText, setThumbnailEditText] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 세션 데이터 저장
  const saveSessionData = async (updates: {
    titleMessage?: string;
    titleResponses?: any;
    selectedTitle?: string;
    selectedTitleIndex?: number | null;
    thumbnailGuideResponses?: any;
    selectedThumbnailGuideIndex?: number | null;
    thumbnailResponses?: string;
    scriptResponses?: string;
    metadataResponses?: any;
    shortsTitlesResponses?: any;
    step?: string;
  }) => {
    if (!currentSessionId) return;

    const newData = { ...sessionData, ...updates };
    setSessionData(newData);

    try {
      const title =
        updates.titleMessage ||
        updates.selectedTitle ||
        sessionData.titleMessage ||
        sessionData.selectedTitle;
      await updateAIAssistantSession(currentSessionId, updates, title);
    } catch (error) {
      console.error("Failed to save session data:", error);
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleStepChange = async (
    step: Step,
    updates?: {
      titleMessage?: string;
      titleResponses?: any;
      selectedTitle?: string;
      selectedTitleIndex?: number | null;
      thumbnailGuideResponses?: any;
      selectedThumbnailGuideIndex?: number | null;
      thumbnailResponses?: string;
      scriptResponses?: string;
      metadataResponses?: any;
      shortsTitlesResponses?: any;
      step?: string;
    }
  ) => {
    if (updates) {
      await saveSessionData(updates);
    }
    setTimeout(() => {
      setCurrentStep(step);
    }, 300);
  };

  const handleThumbnailGuideGenerate = useCallback(
    async (autoGenerate = false) => {
      if (selectedTitleIndex === null || !currentSessionId) return;

      setIsThumbnailGuideLoading(true);

      try {
        const response = await sendThumbnailGuideResponses(
          currentSessionId,
          selectedTitleIndex
        );
        const updates = {
          thumbnailGuideResponses: response,
          step: "THUMBNAIL",
        };

        // saveSessionData 직접 호출
        if (currentSessionId) {
          const newData = { ...sessionData, ...updates };
          setSessionData(newData);
          const title = sessionData.titleMessage || sessionData.selectedTitle;
          await updateAIAssistantSession(currentSessionId, updates, title);
        }

        // 자동 생성이 아닐 때만 다음 스텝으로 이동
        if (!autoGenerate) {
          handleStepChange(4);
        }
        toast.success("썸네일 가이드가 생성되었습니다.");
      } catch (error) {
        console.error("Failed to generate thumbnail guide:", error);
        toast.error("썸네일 가이드 생성에 실패했습니다.");
      } finally {
        setIsThumbnailGuideLoading(false);
      }
    },
    [selectedTitleIndex, currentSessionId, sessionData]
  );

  // Step 4 진입 시 썸네일 가이드 자동 생성 - 제거 (이제 handleTitleNext에서 처리)
  // useEffect(() => { ... }, [...]);

  // Step 5 진입 시 썸네일 자동 생성 - 제거 (이제 handleGuideNext에서 처리)
  // useEffect(() => { ... }, [...]);

  // Step 6 진입 시 대본 자동 생성 - 제거 (이제 handleConfirm에서 처리)
  // useEffect(() => { ... }, [...]);

  // Step 7 진입 시 메타데이터 자동 생성 - 제거 (이제 handleScriptNext에서 처리)
  // useEffect(() => { ... }, [...]);

  // Step 8 진입 시 쇼츠 제목 자동 생성 - 제거 (이제 handleMetadataNext에서 처리)
  // useEffect(() => { ... }, [...]);

  const simulateLoading = (callback: () => void, duration = 1500) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      callback();
    }, duration);
  };

  const handleTopicSubmit = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setIsTitleLoading(true);

    try {
      // 세션 생성
      const sessionId = await createAIAssistantSession();
      setCurrentSessionId(sessionId);

      // 세션 데이터 초기화
      const initialData = { titleMessage: topic, step: "TITLE" };
      setSessionData({ ...initialData, topic }); // UI 상태에는 topic 유지
      await updateAIAssistantSession(sessionId, initialData, topic);

      // 제목 생성
      const response = await sendTitleResponses(sessionId, topic);
      const updatedData = { titleResponses: response };
      setSessionData({ ...initialData, ...updatedData, topic }); // UI 상태에는 topic 유지
      await updateAIAssistantSession(sessionId, updatedData, topic);

      handleStepChange(3);
      toast.success("제목이 생성되었습니다.");
    } catch (error) {
      console.error("Failed to generate titles:", error);
      toast.error("제목 생성에 실패했습니다.");
    } finally {
      setIsGenerating(false);
      setIsTitleLoading(false);
    }
  };

  const handleTitleSelect = async (index: number) => {
    if (!sessionData.titleResponses?.sets?.[index] || !currentSessionId) return;

    const selectedTitleSet = sessionData.titleResponses.sets[index];
    setSelectedTitle(selectedTitleSet.videoTitle);
    setSelectedTitleIndex(index);

    const updates = {
      selectedTitle: selectedTitleSet.videoTitle,
      selectedTitleIndex: index,
      step: "THUMBNAIL_GUIDE",
    };
    await saveSessionData(updates);
  };

  const handleTitleNext = async () => {
    if (selectedTitleIndex === null || !currentSessionId) return;
    
    // 썸네일 가이드 생성 후 다음 스텝으로 이동
    setIsThumbnailGuideLoading(true);
    try {
      const response = await sendThumbnailGuideResponses(
        currentSessionId,
        selectedTitleIndex
      );
      const updates = {
        thumbnailGuideResponses: response,
        step: "THUMBNAIL",
      };
      await saveSessionData(updates);
      await handleStepChange(4);
      toast.success("썸네일 가이드가 생성되었습니다.");
    } catch (error) {
      console.error("Failed to generate thumbnail guide:", error);
      toast.error("썸네일 가이드 생성에 실패했습니다.");
    } finally {
      setIsThumbnailGuideLoading(false);
    }
  };

  const handleGuideSelect = async (index: number) => {
    setSelectedGuide(index);
    await saveSessionData({ selectedThumbnailGuideIndex: index });
  };

  const handleGuideNext = async () => {
    if (selectedGuide === null || selectedTitleIndex === null || !currentSessionId) return;
    
    // 썸네일 생성 후 다음 스텝으로 이동
    setIsThumbnailLoading(true);
    try {
      const selectedTitleSet = sessionData.titleResponses?.sets[selectedTitleIndex];
      const thumbnailGuide = sessionData.thumbnailGuideResponses?.thumbnailGuides[selectedGuide];

      if (!selectedTitleSet || !thumbnailGuide) {
        toast.error("제목과 썸네일 가이드를 선택해주세요.");
        return;
      }

      const response = await sendThumbnailResponses({
        thumbnailTitle: selectedTitleSet.thumbnailTitle,
        hookingText: selectedTitleSet.hookingText || "",
        videoTitle: selectedTitleSet.videoTitle,
        thumbnailGuide: thumbnailGuide.guideDescription,
        referenceImages: referenceThumbnails,
      });

      setThumbnailUrl(`data:image/jpeg;base64,${response}`);
      const updates = { thumbnailResponses: response, step: "SCRIPT" };
      await saveSessionData(updates);
      await handleStepChange(5);
      toast.success("썸네일이 생성되었습니다.");
    } catch (error) {
      console.error("Failed to generate thumbnail:", error);
      toast.error("썸네일 생성에 실패했습니다.");
    } finally {
      setIsThumbnailLoading(false);
    }
  };

  const handleThumbnailGenerate = async () => {
    if (
      selectedTitleIndex === null ||
      selectedGuide === null ||
      !currentSessionId
    )
      return;

    setIsThumbnailLoading(true);

    try {
      const selectedTitleSet =
        sessionData.titleResponses?.sets[selectedTitleIndex];
      const thumbnailGuide =
        sessionData.thumbnailGuideResponses?.thumbnailGuides[selectedGuide];

      if (!selectedTitleSet || !thumbnailGuide) {
        toast.error("제목과 썸네일 가이드를 선택해주세요.");
        return;
      }

      const response = await sendThumbnailResponses({
        thumbnailTitle: selectedTitleSet.thumbnailTitle,
        hookingText: selectedTitleSet.hookingText || "",
        videoTitle: selectedTitleSet.videoTitle,
        thumbnailGuide: thumbnailGuide.guideDescription,
      });

      setThumbnailUrl(`data:image/jpeg;base64,${response}`);
      const updates = { thumbnailResponses: response, step: "SCRIPT" };
      await saveSessionData(updates);
      toast.success("썸네일이 생성되었습니다.");
    } catch (error) {
      console.error("Failed to generate thumbnail:", error);
      toast.error("썸네일 생성에 실패했습니다.");
    } finally {
      setIsThumbnailLoading(false);
    }
  };

  const handleFixThumbnail = async () => {
    if (!sessionData.thumbnailResponses || !currentSessionId) return;

    setIsThumbnailLoading(true);

    try {
      let base64: string | undefined;
      let mimeType: string | undefined;

      if (thumbnailFile) {
        const arrayBuffer = await thumbnailFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        bytes.forEach((byte) => {
          binary += String.fromCharCode(byte);
        });
        base64 = btoa(binary);
        mimeType = thumbnailFile.type;
      }

      const response = await sendFixThumbnailResponses(
        thumbnailEditText,
        sessionData.thumbnailResponses,
        base64,
        mimeType
      );

      setThumbnailUrl(`data:image/jpeg;base64,${response}`);
      await saveSessionData({ thumbnailResponses: response });
      toast.success("썸네일이 수정되었습니다.");
    } catch (error) {
      console.error("Failed to fix thumbnail:", error);
      toast.error("썸네일 수정에 실패했습니다.");
    } finally {
      setIsThumbnailLoading(false);
    }
  };

  const handleScriptGenerate = async () => {
    if (!currentSessionId) return;

    setIsScriptLoading(true);

    try {
      const response = await sendScriptResponses(currentSessionId);
      const updates = { scriptResponses: response, step: "METADATA" };
      await saveSessionData(updates);
      toast.success("대본이 생성되었습니다.");
    } catch (error) {
      console.error("Failed to generate script:", error);
      toast.error("대본 생성에 실패했습니다.");
    } finally {
      setIsScriptLoading(false);
    }
  };

  const handleMetadataGenerate = async () => {
    if (!currentSessionId) return;

    setIsMetadataLoading(true);

    try {
      const response = await sendMetadataResponses(currentSessionId);
      const updates = { metadataResponses: response, step: "SHORTS_TITLES" };
      await saveSessionData(updates);
      toast.success("메타데이터가 생성되었습니다.");
    } catch (error) {
      console.error("Failed to generate metadata:", error);
      toast.error("메타데이터 생성에 실패했습니다.");
    } finally {
      setIsMetadataLoading(false);
    }
  };

  const handleScriptNext = async () => {
    if (!currentSessionId) return;
    
    // 메타데이터 생성 후 다음 스텝으로 이동
    setIsMetadataLoading(true);
    try {
      const response = await sendMetadataResponses(currentSessionId);
      const updates = { metadataResponses: response, step: "SHORTS_TITLES" };
      await saveSessionData(updates);
      await handleStepChange(7);
      toast.success("메타데이터가 생성되었습니다.");
    } catch (error) {
      console.error("Failed to generate metadata:", error);
      toast.error("메타데이터 생성에 실패했습니다.");
    } finally {
      setIsMetadataLoading(false);
    }
  };

  const handleMetadataNext = async () => {
    if (!currentSessionId) return;
    
    // 쇼츠 제목 생성 후 다음 스텝으로 이동
    setIsShortsTitlesLoading(true);
    try {
      const response = await sendShortsTitlesResponses(currentSessionId);
      const updates = { shortsTitlesResponses: response, step: "COMPLETE" };
      await saveSessionData(updates);
      await handleStepChange(8);
      toast.success("쇼츠 제목이 생성되었습니다.");
    } catch (error) {
      console.error("Failed to generate shorts titles:", error);
      toast.error("쇼츠 제목 생성에 실패했습니다.");
    } finally {
      setIsShortsTitlesLoading(false);
    }
  };

  const handleShortsTitlesGenerate = async () => {
    if (!currentSessionId) return;

    setIsShortsTitlesLoading(true);

    try {
      const response = await sendShortsTitlesResponses(currentSessionId);
      const updates = { shortsTitlesResponses: response, step: "COMPLETE" };
      await saveSessionData(updates);
      toast.success("쇼츠 제목이 생성되었습니다.");
    } catch (error) {
      console.error("Failed to generate shorts titles:", error);
      toast.error("쇼츠 제목 생성에 실패했습니다.");
    } finally {
      setIsShortsTitlesLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !currentSessionId) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: chatInput,
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");

    setIsGenerating(true);
    try {
      await handleFixThumbnail();
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: `썸네일을 수정했습니다: "${newMsg.text}". 이제 어떤가요?`,
      };
      setChatMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Failed to process chat:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = async () => {
    if (!currentSessionId) return;
    
    // 대본 생성 후 다음 스텝으로 이동
    setIsScriptLoading(true);
    try {
      const response = await sendScriptResponses(currentSessionId);
      const updates = { scriptResponses: response, step: "METADATA" };
      await saveSessionData(updates);
      await handleStepChange(6);
      toast.success("대본이 생성되었습니다.");
    } catch (error) {
      console.error("Failed to generate script:", error);
      toast.error("대본 생성에 실패했습니다.");
    } finally {
      setIsScriptLoading(false);
    }
  };

  const handleRefreshTitles = async () => {
    if (!topic.trim() || !currentSessionId) return;

    setIsTitleLoading(true);
    try {
      const response = await sendTitleResponses(currentSessionId, topic);
      await saveSessionData({ titleResponses: response });
      toast.success("제목이 새로고침되었습니다.");
    } catch (error) {
      console.error("Failed to refresh titles:", error);
      toast.error("제목 새로고침에 실패했습니다.");
    } finally {
      setIsTitleLoading(false);
    }
  };

  const ProgressBar = () => {
    const steps = [
      "Persona",
      "Topic",
      "Title",
      "Style",
      "Design",
      "Script",
      "Meta",
      "Final",
    ];

    const currentIdx = currentStep - 1;

    const progress = (currentIdx / (steps.length - 1)) * 100;

    return (
      <div className="mb-10 px-2">
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
          <span>Start Workflow</span>
          <span>Final Asset</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden relative border border-gray-300 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto min-h-screen">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ai 어시스턴트
          </h1>
          <p className="text-gray-500">
            AI 파트너와 함께 나만의 콘텐츠를 만들어보세요. 페르소나 선택부터
            제목, 썸네일, 스크립트까지 단계별로 안내해드립니다.
          </p>
        </div>
        <ProgressBar />
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-red-600 -z-10 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep - 1) / 7) * 100}%` }}
          ></div>

          {[
            { step: 1, label: "Persona" },
            { step: 2, label: "Topic" },
            { step: 3, label: "Title" },
            { step: 4, label: "Style" },
            { step: 5, label: "Design" },
            { step: 6, label: "Script" },
            { step: 7, label: "Metadata" },
            { step: 8, label: "Shorts" },
          ].map((s) => (
            <div
              key={s.step}
              className="flex flex-col items-center gap-2 bg-gray-50 px-2 rounded-lg z-10"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  currentStep >= s.step
                    ? "bg-red-600 text-white scale-110 shadow-lg shadow-red-200"
                    : "bg-white border-2 border-gray-200 text-gray-400"
                }`}
              >
                {currentStep > s.step ? <Check size={16} /> : s.step}
              </div>
              <span
                className={`text-xs font-medium ${currentStep >= s.step ? "text-gray-900" : "text-gray-400"}`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-10 min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        {currentStep === 1 && (
          <Step1Persona
            selectedPersona={selectedPersona}
            onSelectPersona={setSelectedPersona}
            onStepChange={handleStepChange}
          />
        )}
        {currentStep === 2 && (
          <Step2Topic
            selectedPersona={selectedPersona}
            topic={topic}
            onTopicChange={setTopic}
            onSubmit={handleTopicSubmit}
            isGenerating={isTitleLoading}
          />
        )}
        {currentStep === 3 && (
          <Step3Titles
            topic={topic}
            selectedTitle={selectedTitle}
            onSelectTitle={handleTitleSelect}
            onRefresh={handleRefreshTitles}
            onStepChange={handleTitleNext}
            titleResponses={sessionData.titleResponses}
            selectedTitleIndex={selectedTitleIndex}
            isLoading={isThumbnailGuideLoading}
          />
        )}
        {currentStep === 4 && (
          <Step4ThumbGuide
            selectedGuide={selectedGuide}
            onSelectGuide={handleGuideSelect}
            onStepChange={handleGuideNext}
            thumbnailGuideResponses={sessionData.thumbnailGuideResponses}
            onGenerate={handleThumbnailGuideGenerate}
            isGenerating={isThumbnailGuideLoading}
            isLoading={isThumbnailLoading}
            onReferenceThumbnailsChange={setReferenceThumbnails}
          />
        )}
        {currentStep === 5 && (
          <Step5ThumbGen
            selectedPersona={selectedPersona}
            selectedTitle={selectedTitle}
            thumbnailUrl={thumbnailUrl}
            chatMessages={chatMessages}
            chatInput={chatInput}
            isGenerating={isThumbnailLoading}
            onChatInputChange={setChatInput}
            onChatSubmit={handleChatSubmit}
            onStepChange={handleConfirm}
            chatEndRef={chatEndRef}
            thumbnailResponses={sessionData.thumbnailResponses}
            thumbnailEditText={thumbnailEditText}
            onThumbnailEditTextChange={setThumbnailEditText}
            thumbnailFile={thumbnailFile}
            onThumbnailFileChange={setThumbnailFile}
            onThumbnailGenerate={handleThumbnailGenerate}
            onFixThumbnail={handleFixThumbnail}
            isLoading={isScriptLoading}
          />
        )}
        {currentStep === 6 && (
          <Step6Script
            thumbnailUrl={thumbnailUrl}
            selectedTitle={selectedTitle}
            topic={topic}
            scriptResponses={sessionData.scriptResponses}
            onGenerate={handleScriptGenerate}
            onStepChange={handleScriptNext}
            isGenerating={isScriptLoading}
            isLoading={isMetadataLoading}
          />
        )}
        {currentStep === 7 && (
          <Step7Metadata
            metadataResponses={sessionData.metadataResponses}
            onGenerate={handleMetadataGenerate}
            onStepChange={handleMetadataNext}
            isGenerating={isMetadataLoading}
            isLoading={isShortsTitlesLoading}
          />
        )}
        {currentStep === 8 && (
          <Step8ShortsTitles
            shortsTitlesResponses={sessionData.shortsTitlesResponses}
            onGenerate={handleShortsTitlesGenerate}
            isGenerating={isShortsTitlesLoading}
          />
        )}
      </div>
    </div>
  );
}
