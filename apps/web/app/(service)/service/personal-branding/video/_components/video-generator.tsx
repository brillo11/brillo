"use client";

import React, { useState } from "react";
import { Video, Loader2, Download, Play } from "lucide-react";
import { toast } from "sonner";
import {
  generateVideoWithVeo,
  downloadAndUploadVeoVideo,
} from "@/serverActions/ai-assistant/veo.actions";

interface VideoGeneratorProps {
  sessionId?: string;
  useMock?: boolean; // Mock 모드 사용 여부
}

export function VideoGenerator({ sessionId }: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(
    null,
  );

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("프롬프트를 입력해주세요.");
      return;
    }

    try {
      setIsGenerating(true);

      toast.info("비디오 생성 중입니다. 약 1-2분 소요됩니다...");

      // Mock 모드 또는 실제 API 사용
      const result = await generateVideoWithVeo(prompt);

      console.log("result", result);

      if (result.success && result.videoUrl) {
        const uploadResult = await downloadAndUploadVeoVideo(
          result.videoUrl,
          sessionId,
        );

        if (uploadResult.success && uploadResult.s3Url) {
          // S3 URL에 https:// 프로토콜 추가
          const videoUrl = uploadResult.s3Url.startsWith("http")
            ? uploadResult.s3Url
            : `https://${uploadResult.s3Url}`;

          setGeneratedVideoUrl(videoUrl);
          toast.success("비디오가 성공적으로 생성되었습니다!");
        } else {
          toast.error(uploadResult.error || "비디오 저장에 실패했습니다.");
        }
      } else {
        toast.error(
          "error" in result ? result.error : "비디오 생성에 실패했습니다.",
        );
      }
    } catch (error) {
      console.error("Video generation error:", error);
      toast.error("비디오 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedVideoUrl) return;

    try {
      toast.info("비디오 다운로드를 준비 중입니다...");

      // URL에 https:// 추가 (없는 경우)
      const downloadUrl = generatedVideoUrl.startsWith("http")
        ? generatedVideoUrl
        : `https://${generatedVideoUrl}`;

      // 서버 프록시를 통해 다운로드 (CORS 우회 + 실제 다운로드)
      const proxyUrl = `/api/download-video?url=${encodeURIComponent(downloadUrl)}`;

      const link = document.createElement("a");
      link.href = proxyUrl;
      link.download = `veo-generated-${Date.now()}.mp4`;
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
    <div className="bg-[#1c1c1c] rounded-2xl p-6 border border-white/5 shadow-xl shadow-black/20">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Video size={18} className="text-[#33DB98]" />
        <h3 className="font-bold text-white">AI 비디오 생성 (3.1)</h3>
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="video-prompt"
            className="block text-sm font-medium text-gray-400 mb-2"
          >
            비디오 프롬프트
          </label>
          <textarea
            id="video-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="생성하고 싶은 비디오를 설명해주세요. 예: 'A serene beach at sunset with gentle waves'"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none resize-none text-sm transition-all text-white placeholder:text-gray-600 ${
              isGenerating
                ? "bg-white/5 border-white/5 cursor-not-allowed text-gray-500"
                : "bg-black/40 border-white/10 focus:ring-2 focus:ring-[#33DB98]/50 focus:border-transparent"
            }`}
            rows={4}
            disabled={isGenerating}
          />
          <p className="mt-2 text-xs text-gray-500">
            💡 팁: 구체적이고 상세한 설명을 제공하면 더 좋은 결과를 얻을 수
            있습니다.
          </p>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className={`w-full px-6 py-3 font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
            isGenerating || !prompt.trim()
              ? "bg-white/10 text-gray-500 cursor-not-allowed"
              : "bg-[#33DB98] text-black hover:bg-[#33DB98]/90 hover:shadow-[#33DB98]/20"
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
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-[#33DB98] rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-[#33DB98] rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-[#33DB98] rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
              <span>AI가 비디오를 생성하고 있습니다...</span>
            </div>
            <p className="text-xs text-center text-gray-600">
              약 1-2분 소요됩니다. 잠시만 기다려주세요...
            </p>
          </div>
        )}

        {/* Video Preview */}
        {generatedVideoUrl && (
          <div className="mt-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white">생성된 비디오</h4>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Download size={16} />
                다운로드
              </button>
            </div>

            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-lg group">
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
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/20">
                  <Play size={16} className="text-[#33DB98]" />
                  <span className="text-sm font-medium text-white">
                    재생하기
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Play size={14} className="text-[#33DB98]" />
                <span>비디오 컨트롤로 재생/일시정지 할 수 있습니다</span>
              </div>
              <div className="text-xs text-gray-600">AI 생성 비디오</div>
            </div>
          </div>
        )}

        {/* Info Box */}
        {!generatedVideoUrl && (
          <div className="mt-4 p-4 border rounded-xl bg-blue-500/10 border-blue-500/20">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <Video size={20} className="text-blue-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-blue-400">
                  Google Veo 3.1 소개
                </h4>
                <p className="text-xs leading-relaxed text-blue-300/80">
                  Veo 3.1은 Google의 최신 AI 비디오 생성 모델입니다. 텍스트
                  프롬프트만으로 고품질 비디오를 생성할 수 있습니다.
                </p>
                <ul className="mt-2 space-y-1 text-xs text-blue-400/80">
                  <li>• 최대 해상도: 4K</li>
                  <li>• 생성 시간: 약 1-2분</li>
                  <li>• 다양한 스타일 지원</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
