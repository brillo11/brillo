"use client";

import React, { useState } from "react";
import { Video, Loader2, Download, Play } from "lucide-react";
import { toast } from "sonner";
import {
  generateVideoWithVeo,
  generateVideoWithVeoMock,
  downloadVeoVideoAsBase64,
} from "@/serverActions/ai-assistant/veo.actions";

interface VideoGeneratorProps {
  sessionId?: string;
  useMock?: boolean; // Mock 모드 사용 여부
}

export function VideoGenerator({
  sessionId,
  useMock = false,
}: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(
    null
  );

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("프롬프트를 입력해주세요.");
      return;
    }

    try {
      setIsGenerating(true);

      if (useMock) {
        toast.info("데모 모드: 샘플 비디오를 불러오는 중...");
      } else {
        toast.info("비디오 생성 중입니다. 약 1-2분 소요됩니다...");
      }

      // Mock 모드 또는 실제 API 사용
      const result = useMock
        ? await generateVideoWithVeoMock(prompt)
        : await generateVideoWithVeo(prompt);

      console.log("result", result);

      if (result.success && result.videoUrl) {
        // Mock 모드는 바로 사용
        if (useMock) {
          setGeneratedVideoUrl(result.videoUrl);
          toast.success("샘플 비디오를 불러왔습니다!");
        }
        // 실제 API는 서버에서 다운로드 후 Base64로 변환
        else {
          toast.info("비디오를 다운로드하는 중...");

          const downloadResult = await downloadVeoVideoAsBase64(
            result.videoUrl
          );

          if (downloadResult.success && downloadResult.videoBase64) {
            setGeneratedVideoUrl(downloadResult.videoBase64);
            toast.success("비디오가 성공적으로 생성되었습니다!");
          } else {
            toast.error(
              downloadResult.error || "비디오 다운로드에 실패했습니다."
            );
          }
        }
      } else {
        toast.error(
          "error" in result ? result.error : "비디오 생성에 실패했습니다."
        );
      }
    } catch (error) {
      console.error("Video generation error:", error);
      toast.error("비디오 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedVideoUrl) return;

    try {
      toast.info("비디오 다운로드를 준비 중입니다...");

      // Base64 데이터 URL인 경우 (data:video/mp4;base64,...)
      if (generatedVideoUrl.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = generatedVideoUrl;
        link.download = `veo-generated-${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("비디오 다운로드가 시작되었습니다!");
        return;
      }

      // 일반 URL인 경우 (Mock 모드 등)
      const link = document.createElement("a");
      link.href = generatedVideoUrl;
      link.download = `veo-generated-${Date.now()}.mp4`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("비디오 다운로드가 시작되었습니다!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("비디오 다운로드 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Video size={18} className="text-red-600" />
        <h3 className="font-bold text-slate-900">AI 비디오 생성 (Veo 2)</h3>
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="video-prompt"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            비디오 프롬프트
          </label>
          <textarea
            id="video-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="생성하고 싶은 비디오를 설명해주세요. 예: 'A serene beach at sunset with gentle waves'"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none resize-none text-sm transition-all ${
              isGenerating
                ? "bg-gray-100 border-gray-300 cursor-not-allowed text-gray-500"
                : "bg-gray-50 border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            }`}
            rows={4}
            disabled={isGenerating}
          />
          <p className="mt-2 text-xs text-slate-400">
            💡 팁: 구체적이고 상세한 설명을 제공하면 더 좋은 결과를 얻을 수
            있습니다.
          </p>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className={`w-full px-6 py-3 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
            isGenerating || !prompt.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-xl"
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>비디오 생성 중...</span>
            </>
          ) : (
            <>
              <Video size={20} />
              <span>비디오 생성하기</span>
            </>
          )}
        </button>

        {/* Loading Progress */}
        {isGenerating && (
          <div className="mt-2 space-y-2 animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-red-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-red-600 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-red-600 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
              <span>
                {useMock
                  ? "샘플 비디오 로딩 중"
                  : "AI가 비디오를 생성하고 있습니다"}
              </span>
            </div>
            <p className="text-xs text-center text-slate-400">
              {useMock
                ? "잠시만 기다려주세요..."
                : "약 1-2분 소요됩니다. 잠시만 기다려주세요..."}
            </p>
          </div>
        )}

        {/* Video Preview */}
        {generatedVideoUrl && (
          <div className="mt-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900">생성된 비디오</h4>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
              >
                <Download size={16} />
                다운로드
              </button>
            </div>

            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-gray-200 shadow-lg group">
              <video
                src={generatedVideoUrl}
                controls
                controlsList="nodownload"
                className="w-full h-full object-contain"
                preload="metadata"
                playsInline
              >
                Your browser does not support the video tag.
              </video>

              {/* Play Overlay - 재생 전 힌트 */}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                  <Play size={16} className="text-red-600" />
                  <span className="text-sm font-medium text-slate-700">
                    재생하기
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Play size={14} className="text-red-600" />
                <span>비디오 컨트롤로 재생/일시정지 할 수 있습니다</span>
              </div>
              <div className="text-xs text-slate-400">
                {useMock ? "샘플 비디오" : "AI 생성 비디오"}
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        {!generatedVideoUrl && (
          <div
            className={`mt-4 p-4 border rounded-xl ${
              useMock
                ? "bg-amber-50 border-amber-100"
                : "bg-blue-50 border-blue-100"
            }`}
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <Video
                  size={20}
                  className={useMock ? "text-amber-600" : "text-blue-600"}
                />
              </div>
              <div className="space-y-1">
                <h4
                  className={`text-sm font-semibold ${
                    useMock ? "text-amber-900" : "text-blue-900"
                  }`}
                >
                  {useMock ? "🧪 데모 모드" : "Google Veo 3.1 소개"}
                </h4>
                <p
                  className={`text-xs leading-relaxed ${
                    useMock ? "text-amber-700" : "text-blue-700"
                  }`}
                >
                  {useMock
                    ? "현재 데모 모드입니다. 샘플 비디오를 빠르게 확인할 수 있습니다. 실제 API를 사용하려면 useMock={false}로 설정하세요."
                    : "Veo 3.1은 Google의 최신 AI 비디오 생성 모델입니다. 텍스트 프롬프트만으로 고품질 비디오를 생성할 수 있습니다."}
                </p>
                <ul
                  className={`mt-2 space-y-1 text-xs ${
                    useMock ? "text-amber-600" : "text-blue-600"
                  }`}
                >
                  {useMock ? (
                    <>
                      <li>• 즉시 결과 확인</li>
                      <li>• API 키 불필요</li>
                      <li>• 샘플 비디오 제공</li>
                    </>
                  ) : (
                    <>
                      <li>• 최대 해상도: 4K</li>
                      <li>• 생성 시간: 약 1-2분</li>
                      <li>• 다양한 스타일 지원</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
