"use client";

import {
  Copy,
  Video,
  Mic,
  Upload,
  Check,
  Play,
  Download,
  Sparkles,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { LoadingSpinner } from "@repo/ui/components/loading-spinner";
import { toast } from "sonner";
import { useState } from "react";

interface Step8ShortsTitlesProps {
  shortsTitlesResponses?: {
    shortsTitles?: Array<{
      chapterTitle: string;
      titles: string[];
    }>;
  };
  onGenerate?: () => void;
  isGenerating?: boolean;
}

export function Step8ShortsTitles({
  shortsTitlesResponses,
  onGenerate,
  isGenerating = false,
}: Step8ShortsTitlesProps) {
  const [voiceSource, setVoiceSource] = useState<"mic" | "upload" | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [generatedVoiceUrl, setGeneratedVoiceUrl] = useState<string | null>(
    null
  );
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label}이 복사되었습니다.`);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // TODO: 실제 녹음 로직 구현
    setTimeout(() => {
      setIsRecording(false);
      setVoiceSource("mic");
      toast.success("녹음이 완료되었습니다.");
    }, 10000);
  };

  const handleVoiceCloneAndGen = async () => {
    if (!voiceSource) return;
    setIsVoiceLoading(true);
    // TODO: 실제 음성 클론 및 생성 로직 구현
    setTimeout(() => {
      setIsVoiceLoading(false);
      setGeneratedVoiceUrl("#"); // 임시 URL
      toast.success("음성이 생성되었습니다.");
    }, 3000);
  };

  if (!shortsTitlesResponses?.shortsTitles) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center py-12">
          {isGenerating ? (
            <>
              <LoadingSpinner loadingText="쇼츠 제목 생성 중..." />
            </>
          ) : (
            <>
              <p className="text-gray-500 mb-4">쇼츠 제목을 생성해주세요.</p>
              {onGenerate && (
                <Button
                  onClick={onGenerate}
                  disabled={isGenerating}
                  className="px-10 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold text-lg hover:shadow-lg disabled:opacity-70 transition-all flex items-center gap-2 mx-auto"
                >
                  쇼츠 제목 생성
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-5xl mx-auto">
      {/* Section 1: Shorts */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
            <Video size={16} className="text-white" />
          </div>
          Shorts Candidates
        </h3>

        {isGenerating && shortsTitlesResponses.shortsTitles.length === 0 ? (
          <div className="py-10 text-center">
            <Loader2 className="animate-spin text-orange-500 inline-block" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {shortsTitlesResponses.shortsTitles.map((chapter, i) => (
              <div
                key={i}
                className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all group shadow-sm"
              >
                <h4 className="font-bold text-slate-800 mb-4 border-b border-gray-200 pb-3 flex justify-between items-center">
                  {chapter.chapterTitle}
                  <Copy
                    size={14}
                    className="opacity-0 group-hover:opacity-100 cursor-pointer text-slate-400 hover:text-slate-600"
                    onClick={() => {
                      navigator.clipboard.writeText(chapter.titles.join("\n"));
                      handleCopy(chapter.titles.join("\n"), "Chapter titles");
                    }}
                  />
                </h4>
                <ul className="space-y-3">
                  {chapter.titles.map((title, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-slate-600 hover:text-orange-600 flex items-start gap-2 cursor-pointer transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(title);
                        handleCopy(title, "Title");
                      }}
                    >
                      <span className="text-slate-400 mt-1">•</span>
                      {title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Voice */}
      {/* <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 overflow-hidden relative shadow-md">
        <div className="absolute top-0 right-0 p-32 bg-orange-100/50 blur-[80px] rounded-full pointer-events-none"></div>

        <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <Mic size={16} className="text-white" />
          </div>
          AI Voice Studio (ElevenLabs)
        </h3>

        <div className="grid lg:grid-cols-2 gap-10 relative z-10">
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-slate-800 mb-1">
                1. Voice Registration
              </h4>
              <p className="text-xs text-slate-500">
                Clone a voice to narrate your script.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleStartRecording}
                disabled={isRecording}
                className={`flex-1 py-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all ${
                  isRecording
                    ? "border-red-500 bg-red-50 text-red-600 animate-pulse"
                    : voiceSource === "mic"
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-300 hover:border-orange-400 hover:bg-white text-slate-500 hover:text-orange-600 bg-white"
                }`}
              >
                <Mic size={28} />
                <span className="text-sm font-medium">
                  {isRecording ? "Recording..." : "Record Mic (10s)"}
                </span>
              </button>

              <label
                className={`flex-1 py-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                  voiceSource === "upload"
                    ? "border-purple-500 bg-purple-50 text-purple-600"
                    : "border-gray-300 hover:border-purple-400 hover:bg-white text-slate-500 hover:text-purple-600 bg-white"
                }`}
              >
                <Upload size={28} />
                <span className="text-sm font-medium">Upload File</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setVoiceSource("upload");
                      toast.success("Audio loaded");
                    }
                  }}
                />
              </label>
            </div>

            {voiceSource && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 p-3 rounded-lg border border-green-200">
                <Check size={16} /> Voice Sample Ready
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-slate-800 mb-1">2. Generation</h4>
              <p className="text-xs text-slate-500">
                Synthesize audio using the registered voice.
              </p>
            </div>

            {generatedVoiceUrl ? (
              <div className="bg-white border border-gray-200 p-5 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-200">
                    <Play size={24} fill="white" className="ml-1" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-slate-900">
                      Voiceover Ready
                    </div>
                    <div className="text-xs text-green-600">
                      Generated with Cloned Voice
                    </div>
                  </div>
                </div>
                <a
                  href={generatedVoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-slate-700 transition-colors border border-gray-200"
                >
                  <Download size={20} />
                </a>
              </div>
            ) : (
              <button
                onClick={handleVoiceCloneAndGen}
                disabled={isVoiceLoading || !voiceSource}
                className="w-full h-[100px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-xl shadow-purple-500/20 flex flex-col justify-center items-center gap-2 transition-all transform hover:-translate-y-1"
              >
                {isVoiceLoading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <Sparkles size={24} fill="currentColor" />
                )}
                <span>
                  {isVoiceLoading
                    ? "Processing Voice..."
                    : "Clone Voice & Generate Audio"}
                </span>
              </button>
            )}

            {!voiceSource && (
              <p className="text-center text-xs text-red-500">
                * Please record or upload voice sample first
              </p>
            )}
          </div>
        </div>
      </div> */}
    </div>
  );
}
