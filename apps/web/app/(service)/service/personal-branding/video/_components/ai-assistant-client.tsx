"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Check, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import type { Step, ChatMessage } from "./types";
import { Step1Dashboard } from "./step1-dashboard";
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
import type { AIAssistantSessionData } from "@/serverActions/ai-assistant/ai-assistant-session.actions";
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
  type SessionData = Partial<AIAssistantSessionData> & { topic?: string };
  type SessionUpdates = Parameters<typeof updateAIAssistantSession>[1];

  const [sessionData, setSessionData] = useState<SessionData>({});
  const [currentStep, setCurrentStep] = useState<Step>(1);
  // Persona logic removed, but keeping types if needed deeply nested, otherwise remove.
  // const [selectedPersona, setSelectedPersona] = useState<CreatorPersona | null>(null);
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

        if (currentSessionId) {
          const title = sessionData.titleMessage || sessionData.selectedTitle;
          const newData = { ...sessionData, ...updates, title };
          setSessionData(newData);
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

  const handleTopicSubmit = async () => {
    if (!topic.trim()) return;

    setIsTitleLoading(true);

    try {
      // 세션 생성
      const sessionId = await createAIAssistantSession();
      setCurrentSessionId(sessionId);

      // 세션 데이터 초기화
      const initialData = { titleMessage: topic, step: "TITLE" };
      await saveSessionData(initialData, sessionId);

      // 제목 생성
      const response = await sendTitleResponses(sessionId, topic);
      const updatedData = { titleResponses: response };
      await saveSessionData(updatedData, sessionId);

      handleStepChange(3);
      toast.success("제목이 생성되었습니다.");
    } catch (error) {
      console.error("Failed to generate titles:", error);
      toast.error("제목 생성에 실패했습니다.");
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

  const handleTitleNext = async () => {
    if (selectedTitleIndex === null || !currentSessionId) return;

    // 썸네일 가이드 생성 후 다음 스텝으로 이동
    setIsThumbnailGuideLoading(true);
    try {
      const response = await sendThumbnailGuideResponses(
        currentSessionId,
        selectedTitleIndex
      );
      // 다음 스텝으로 넘어갈 때 선택된 제목 정보와 함께 저장
      const updates = {
        selectedTitle:
          selectedTitle ||
          sessionData.titleResponses?.sets[selectedTitleIndex]?.videoTitle,
        selectedTitleIndex: selectedTitleIndex,
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
    // 다음 스텝으로 넘어갈 때 저장하므로 여기서는 로컬 state만 업데이트
  };

  const handleGuideNext = async () => {
    if (
      selectedGuide === null ||
      selectedTitleIndex === null ||
      !currentSessionId
    )
      return;

    // 썸네일 생성 후 다음 스텝으로 이동
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

      const s3Url = await sendThumbnailResponses({
        thumbnailTitle: selectedTitleSet.thumbnailTitle,
        hookingText: selectedTitleSet.hookingText || "",
        videoTitle: selectedTitleSet.videoTitle,
        thumbnailGuide: thumbnailGuide.guideDescription,
        referenceImages: referenceThumbnails,
      });

      // 다음 스텝으로 넘어갈 때 선택된 가이드 정보와 함께 저장
      const updates = {
        selectedThumbnailGuideIndex: selectedGuide,
        thumbnailUrls: s3Url,
        step: "SCRIPT",
      };
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

      const s3Url = await sendThumbnailResponses({
        thumbnailTitle: selectedTitleSet.thumbnailTitle,
        hookingText: selectedTitleSet.hookingText || "",
        videoTitle: selectedTitleSet.videoTitle,
        thumbnailGuide: thumbnailGuide.guideDescription,
      });

      const updates = { thumbnailUrls: s3Url, step: "SCRIPT" };
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
      "Topic",
      "Title",
      "Style",
      "Design",
      "Script",
      "Meta",
      "Final",
    ];

    // currentStep 1 is Dashboard (Hidden progress)
    // currentStep 2 is Topic (Visual Step 1, Index 0)
    const currentIdx = currentStep - 2;

    const progress = (currentIdx / (steps.length - 1)) * 100;

    return (
      <div className="mb-10 px-2">
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
          <span>Start Workflow</span>
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
    <div className="max-w-6xl mx-auto min-h-screen">
      <div className="mb-8 relative">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {currentStep > 1 && (
              <>
                <button
                  onClick={() => handleStepChange(1)}
                  className="absolute -left-12 top-1 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all hidden xl:flex"
                  title="Go to Home"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => handleStepChange(1)}
                  className="xl:hidden p-1 -ml-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
              </>
            )}
            <h1 className="text-3xl font-bold text-white">AI 어시스턴트</h1>
          </div>
          <p className="text-gray-400">
            AI 파트너와 함께 나만의 콘텐츠를 만들어보세요. 제목, 썸네일,
            스크립트까지 단계별로 안내해드립니다.
          </p>
        </div>

        {currentStep > 1 && (
          <>
            <ProgressBar />
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 -z-10 rounded-full"></div>
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#33DB98] -z-10 rounded-full transition-all duration-500"
                style={{
                  width: `${((currentStep - 2) / 6) * 100}%`,
                }}
              ></div>

              {[
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
                  className="flex flex-col items-center gap-2 bg-vzx-bg px-2 rounded-lg z-10"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      currentStep >= s.step
                        ? "bg-[#33DB98] text-black scale-110 shadow-lg shadow-[#33DB98]/20"
                        : "bg-vzx-card border-2 border-white/10 text-gray-600"
                    }`}
                  >
                    {currentStep > s.step ? <Check size={16} /> : s.step - 1}
                  </div>
                  <span
                    className={`text-xs font-medium ${currentStep >= s.step ? "text-[#33DB98]" : "text-gray-600"}`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="bg-vzx-card rounded-2xl border border-white/5 shadow-sm p-6 md:p-10 min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        {currentStep === 1 && (
          <Step1Dashboard onStepChange={handleStepChange} />
        )}
        {currentStep === 2 && (
          <Step2Topic
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
