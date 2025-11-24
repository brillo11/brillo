"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Loader2, Download, Youtube, X } from "lucide-react";
import { extractVideoId, isValidYouTubeUrl } from "@/lib/utils/youtube";
import { toast } from "sonner";

interface YouTubeCaptionExtractorProps {
  onTranscriptExtracted: (transcript: string) => void;
}

export function YouTubeCaptionExtractor({
  onTranscriptExtracted,
}: YouTubeCaptionExtractorProps) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!youtubeUrl.trim()) {
      toast.error("YouTube URL을 입력해주세요.");
      return;
    }

    if (!isValidYouTubeUrl(youtubeUrl)) {
      toast.error("유효한 YouTube URL이 아닙니다.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranscript(null);

    try {
      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error("비디오 ID를 추출할 수 없습니다.");
      }

      // YouTube Transcript API를 사용하여 자막 추출
      // 클라이언트에서 직접 호출
      const response = await fetch(
        `/api/youtube/transcript?videoId=${videoId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "자막을 가져올 수 없습니다.");
      }

      const data = await response.json();

      if (data.success && data.transcript) {
        const fullTranscript = data.transcript
          .map((item: any) => item.text)
          .join(" ");

        setTranscript(fullTranscript);
        onTranscriptExtracted(fullTranscript);
        toast.success("자막을 성공적으로 추출했습니다.");
      } else {
        throw new Error(data.error || "자막을 찾을 수 없습니다.");
      }
    } catch (error: any) {
      console.error("자막 추출 오류:", error);
      const errorMessage =
        error.message || "자막을 추출하는 중 오류가 발생했습니다.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setYoutubeUrl("");
    setTranscript(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-slate-900 mb-2 block">
          YouTube 영상 자막 추출
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="pl-10 pr-10"
            />
            {youtubeUrl && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            onClick={handleExtract}
            disabled={isLoading || !youtubeUrl.trim()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                추출 중...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                자막 추출
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          YouTube 영상 URL을 입력하면 자동으로 자막(대본)을 추출합니다.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {transcript && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-green-800">
              자막 추출 완료
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(transcript);
                toast.success("자막이 클립보드에 복사되었습니다.");
              }}
              className="text-xs text-green-700 hover:text-green-900 underline"
            >
              복사
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto text-sm text-green-900 bg-white rounded p-3 border border-green-200">
            {transcript}
          </div>
        </div>
      )}
    </div>
  );
}
