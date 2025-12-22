"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import type { Step, ChatMessage, VideoStyle, ThumbnailReference } from "./types";
import { Step1Planning } from "./step1-planning";
import { Step2ThumbGuide } from "./step2-thumb-guide";
import { Step5ThumbGen } from "./step5-thumb-gen";
import { Step6Script } from "./step6-script";
import { Step7Metadata } from "./step7-metadata";
import { Step8VideoGeneration } from "./step8-video-generation";
import {
  createAIAssistantSession,
  updateAIAssistantSession,
} from "@/serverActions/ai-assistant/ai-assistant-session.actions";
import type { AIAssistantSessionData } from "@/serverActions/ai-assistant/ai-assistant-session.actions";
import {
  sendTitleResponses,
  sendScriptResponses,
  sendThumbnailResponses,
  sendFixThumbnailResponses,
  sendMetadataResponses,
  sendShortsTitlesResponses,
  sendThumbnailGuideResponses,
} from "@/serverActions/ai-assistant/ai-assistant.actions";

export function AIAssistantClient() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  type SessionData = Partial<AIAssistantSessionData> & { topic?: string };
  type SessionUpdates = Parameters<typeof updateAIAssistantSession>[1];

  const [sessionData, setSessionData] = useState<SessionData>({});
  const [currentStep, setCurrentStep] = useState<Step>(1);
  
  // Inputs
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [keyInsights, setKeyInsights] = useState("");
  const [videoStyle, setVideoStyle] = useState<VideoStyle | null>(null);

  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedTitleIndex, setSelectedTitleIndex] = useState<number | null>(
    null
  );
  const [selectedGuideIndex, setSelectedGuideIndex] = useState<number | null>(null);
  const [selectedReferenceThumbnails, setSelectedReferenceThumbnails] = useState<ThumbnailReference[]>([]);
  
  const [referenceScript, setReferenceScript] = useState("");

  // Loading states
  const [isTitleLoading, setIsTitleLoading] = useState(false);
  const [isGuideLoading, setIsGuideLoading] = useState(false);
  const [isThumbnailLoading, setIsThumbnailLoading] = useState(false);
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);
  const [isShortsTitlesLoading, setIsShortsTitlesLoading] = useState(false);

  // Chat & Thumbnail State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "ai",
      text: "I have generated a thumbnail based on your plan. How does it look? We can adjust colors, text placement, or the main subject.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [thumbnailEditText, setThumbnailEditText] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 세션 데이터 저장
  const saveSessionData = async (
    updates: SessionUpdates,
    sessionIdOverride?: string
  ) => {
    const targetSessionId = sessionIdOverride ?? currentSessionId;
    if (!targetSessionId) return;

    const newData = { ...sessionData, ...updates };
    setSessionData(newData);

    try {
      const title =
        updates.titleMessage ||
        updates.selectedTitle ||
        sessionData.titleMessage ||
        sessionData.selectedTitle;
      await updateAIAssistantSession(
        targetSessionId,
        updates,
        title ?? undefined
      );
    } catch (error) {
      console.error("Failed to save session data:", error);
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleStepChange = async (step: Step, updates?: SessionUpdates) => {
    if (updates) {
      await saveSessionData(updates);
    }
    setTimeout(() => {
      setCurrentStep(step);
    }, 300);
  };

  const handleGeneratePlan = async () => {
    if (!topic.trim()) return;

    setIsTitleLoading(true);

    try {
      // 세션 생성
      const sessionId = await createAIAssistantSession();
      setCurrentSessionId(sessionId);

      // 세션 데이터 초기화
      const initialData = { titleMessage: topic, step: "TITLE" };
      await saveSessionData(initialData, sessionId);

      // 제목 + 가이드 생성
      const response = await sendTitleResponses(
        sessionId,
        topic,
        targetAudience,
        keyInsights,
        videoStyle ?? undefined
      );
      const updatedData = { titleResponses: response };
      await saveSessionData(updatedData, sessionId);

      // 스텝은 유지하되 결과가 표시됨 (Step1Planning 내부에서 처리)
      toast.success("썸네일 가이드가 생성되었습니다.");
    } catch (error) {
      console.error("Failed to generate titles:", error);
      toast.error("썸네일 가이드 생성에 실패했습니다.");
    } finally {
      setIsTitleLoading(false);
    }
  };

  const handleTitleSelect = async (index: number) => {
    if (!sessionData.titleResponses?.sets?.[index] || !currentSessionId) return;

    const selectedTitleSet = sessionData.titleResponses.sets[index];
    setSelectedTitle(selectedTitleSet.videoTitle);
    setSelectedTitleIndex(index);
    // 다음 스텝으로 넘어갈 때 저장하므로 여기서는 로컬 state만 업데이트
  };

  const handleGuideSelect = async (index: number) => {
    if (!sessionData.thumbnailGuideResponses?.thumbnailGuides?.[index] || !currentSessionId) return;
    setSelectedGuideIndex(index);
  };

  const handlePlanningNext = async () => {
    if (selectedTitleIndex === null || !currentSessionId) return;

    // 썸네일 가이드 생성 후 다음 스텝으로 이동
    setIsGuideLoading(true);
    try {
      const selectedTitleSet = sessionData.titleResponses?.sets[selectedTitleIndex];
      
      if (!selectedTitleSet) {
        toast.error("선택된 기획안이 없습니다.");
        return;
      }

      // 다음 스텝으로 넘어갈 때 선택된 제목 정보 저장
      const updates = {
        selectedTitle: selectedTitle || selectedTitleSet.videoTitle,
        selectedTitleIndex: selectedTitleIndex,
        step: "GUIDE",
      };
      await saveSessionData(updates);

      // 썸네일 가이드 생성
      const response = await sendThumbnailGuideResponses(currentSessionId, selectedTitleIndex);
      const guideUpdates = {
        thumbnailGuideResponses: response
      };
      await saveSessionData(guideUpdates);
      
      await handleStepChange(2); // Move to Step 2 (Thumb Guide)
      toast.success("썸네일 가이드가 생성되었습니다.");
    } catch (error) {
      console.error("Failed to generate thumbnail guide:", error);
      toast.error("썸네일 가이드 생성에 실패했습니다.");
    } finally {
      setIsGuideLoading(false);
    }
  };

  const handleThumbGuideNext = async () => {
    if (selectedGuideIndex === null || !currentSessionId) return;

    setIsThumbnailLoading(true);
    try {
      const selectedTitleSet = sessionData.titleResponses?.sets[selectedTitleIndex!];
      const selectedGuide = sessionData.thumbnailGuideResponses?.thumbnailGuides[selectedGuideIndex];

      if (!selectedTitleSet || !selectedGuide) {
        toast.error("선택된 가이드가 없습니다.");
        return;
      }

      const updates = {
         selectedThumbnailGuideIndex: selectedGuideIndex,
         step: "THUMBNAIL"
      };
      await saveSessionData(updates);

      // 썸네일 생성
      const s3Url = await sendThumbnailResponses({
        thumbnailTitle: selectedTitleSet.thumbnailTitle,
        hookingText: selectedTitleSet.thumbnailTitle || "", 
        videoTitle: selectedTitleSet.videoTitle,
        thumbnailGuide: selectedGuide.guideDescription || "",
        referenceImages: selectedReferenceThumbnails,
      });
      
      const thumbUpdates = {
        thumbnailUrls: s3Url,
        step: "SCRIPT" 
      };
      await saveSessionData(thumbUpdates);
      
      await handleStepChange(5); // Move to Step 5 (Thumb Gen)
      toast.success("썸네일이 생성되었습니다.");
    } catch (error) {
      console.error("Failed to generate thumbnail:", error);
      toast.error("썸네일 생성에 실패했습니다.");
    } finally {
      setIsThumbnailLoading(false);
    }
  };

  const handleThumbnailGenerate = async () => {
    if (selectedGuideIndex === null || !currentSessionId) return;

    setIsThumbnailLoading(true);

    try {
      const selectedTitleSet = sessionData.titleResponses?.sets[selectedTitleIndex!];
      const selectedGuide = sessionData.thumbnailGuideResponses?.thumbnailGuides[selectedGuideIndex];

      if (!selectedTitleSet || !selectedGuide) {
        toast.error("선택된 정보가 없습니다.");
        return;
      }

      const s3Url = await sendThumbnailResponses({
        thumbnailTitle: selectedTitleSet.thumbnailTitle,
        hookingText: selectedTitleSet.thumbnailTitle || "",
        videoTitle: selectedTitleSet.videoTitle,
        thumbnailGuide: selectedGuide.guideDescription || "",
      });

      const updates = { thumbnailUrls: s3Url };
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
    if (!sessionData.thumbnailUrls || !currentSessionId) return;

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

      const s3Url = await sendFixThumbnailResponses(
        thumbnailEditText,
        sessionData.thumbnailUrls, // S3 URL 전달
        base64,
        mimeType
      );

      // 썸네일 수정은 즉시 반영되어야 하므로 저장
      await saveSessionData({ thumbnailUrls: s3Url });
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
    }
  };

  const handleConfirm = async () => {
    if (!currentSessionId) return;

    // 대본 생성 후 다음 스텝으로 이동
    setIsScriptLoading(true);
    try {
      const response = await sendScriptResponses(currentSessionId, referenceScript);
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

  const ProgressBar = () => {
    const steps = [
      "Planning", // Step 1
      "Guide",    // Step 2
      "Design",   // Step 5
      "Script",   // Step 6
      "Meta",     // Step 7
      "Refine",   // Step 8
    ];

    // Map currentStep to progress index
    let currentIdx = 0;
    if (currentStep >= 8) currentIdx = 5;
    else if (currentStep >= 7) currentIdx = 4;
    else if (currentStep >= 6) currentIdx = 3;
    else if (currentStep >= 5) currentIdx = 2;
    else if (currentStep >= 2) currentIdx = 1;
    else if (currentStep >= 1) currentIdx = 0;

    const progress = (currentIdx / (steps.length - 1)) * 100;

    return (
      <div className="mb-10 px-2">
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
          <span>Planning</span>
          <span>Final Asset</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden relative border border-white/5 shadow-inner">
          <div
            className="h-full bg-[#33DB98] transition-all duration-700 ease-out shadow-sm shadow-[#33DB98]/20"
            style={{ width: `${Math.max(0, progress)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8 animate-fade-in selection:bg-[var(--vzx-accent)] selection:text-black min-h-screen">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
          유튜브 영상 제작
        </h1>
        <p className="text-gray-400">
          나만의 유튜브 콘텐츠를 만들어보세요. 제목, 썸네일,
          스크립트까지 단계별로 안내해드립니다.
        </p>
      </div>
      <div className="relative">

            <ProgressBar />
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 -z-10 rounded-full"></div>
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#33DB98] -z-10 rounded-full transition-all duration-500"
                style={{
                  width: `${((currentStep - 1) / (8 - 1)) * 100}%`, // Rough approximation for dot position? No, let's use the index logic or just match valid steps
                }}
              ></div>

              {[
                { step: 1, label: "Plan" },
                { step: 2, label: "Guide" },
                { step: 5, label: "Design" },
                { step: 6, label: "Script" },
                { step: 7, label: "Metadata" },
                { step: 8, label: "Video" },
              ].map((s, i) => (
                <div
                  key={s.step}
                  className="flex flex-col items-center gap-2 bg-vzx-bg px-2 rounded-lg z-10"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      currentStep >= s.step
                        ? "bg-[#33DB98] text-black scale-110 shadow-lg shadow-[#33DB98]/20"
                        : "bg-vzx-card border-2 border-white/10 text-gray-600"
                    }`}
                  >
                    {currentStep > s.step ? <Check size={16} /> : i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium ${currentStep >= s.step ? "text-[#33DB98]" : "text-gray-600"}`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
      </div>

      {/* Main Content Area */}
      <div>
        {currentStep === 1 && (
          <Step1Planning 
             topic={topic}
             onTopicChange={setTopic}
             targetAudience={targetAudience}
             onTargetAudienceChange={setTargetAudience}
             keyInsights={keyInsights}
             onKeyInsightsChange={setKeyInsights}
             selectedStyle={videoStyle}
             onStyleChange={setVideoStyle}
             onGenerate={handleGeneratePlan}
             isGenerating={isTitleLoading}
             titleResponses={sessionData.titleResponses}
             selectedTitleIndex={selectedTitleIndex}
             onSelectTitle={handleTitleSelect}
             onStepChange={handlePlanningNext}
             isNextLoading={isGuideLoading}
          />
        )}
        {currentStep === 2 && (
          <Step2ThumbGuide 
             onGenerate={() => handlePlanningNext()} // Re-generate guide if needed (less likely)
             isGenerating={isGuideLoading}
             thumbnailGuideResponses={sessionData.thumbnailGuideResponses}
             selectedGuideIndex={selectedGuideIndex}
             onSelectGuide={handleGuideSelect}
             onStepChange={handleThumbGuideNext}
             isNextLoading={isThumbnailLoading}
             onReferenceThumbnailsChange={setSelectedReferenceThumbnails}
          />
        )}
        {currentStep === 5 && sessionData.thumbnailUrls && (
          <Step5ThumbGen
            selectedTitle={selectedTitle}
            chatMessages={chatMessages}
            chatInput={chatInput}
            isGenerating={isThumbnailLoading}
            onChatInputChange={setChatInput}
            onChatSubmit={handleChatSubmit}
            onStepChange={handleConfirm}
            chatEndRef={chatEndRef}
            thumbnailUrls={sessionData.thumbnailUrls}
            thumbnailEditText={thumbnailEditText}
            onThumbnailEditTextChange={setThumbnailEditText}
            thumbnailFile={thumbnailFile}
            onThumbnailFileChange={setThumbnailFile}
            onThumbnailGenerate={handleThumbnailGenerate}
            onFixThumbnail={handleFixThumbnail}
            isLoading={isScriptLoading}
            referenceScript={referenceScript}
            onReferenceScriptChange={setReferenceScript}
          />
        )}
        {currentStep === 6 && (
          <Step6Script
            thumbnailUrl={sessionData.thumbnailUrls ?? ""}
            selectedTitle={selectedTitle}
            topic={topic}
            scriptResponses={
              typeof sessionData.scriptResponses === "string"
                ? undefined
                : (sessionData.scriptResponses as any)
            }
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
          <Step8VideoGeneration
            selectedTitle={selectedTitle}
            thumbnailUrls={sessionData.thumbnailUrls || undefined}
            scriptResponses={
               typeof sessionData.scriptResponses === "string"
                 ? undefined
                 : (sessionData.scriptResponses as any)
            }
            metadataResponses={
               typeof sessionData.metadataResponses === "string"
                 ? undefined
                 : (sessionData.metadataResponses as any)
            }
            onVideoGenerated={async (url, type) => {
              if (currentSessionId) {
                await saveSessionData({
                  generatedVideoUrl: url,
                  generatedVideoType: type
                });
              }
            }}
            initialVideoUrl={sessionData.generatedVideoUrl || undefined}
            initialVideoType={sessionData.generatedVideoType as "VEO" | "HEYGEN" || undefined}
          />
        )}
      </div>
    </div>
  );
}
