"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Loader2, Download, Youtube, X, Copy, Check } from "lucide-react";
import { extractVideoId, isValidYouTubeUrl } from "@/lib/utils/youtube";
import { toast } from "sonner";
import { getYouTubeTranscript } from "@/serverActions/youtube/youtube-transcript.actions";

export function StandaloneYouTubeExtractor() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
      console.log(`[Client] 입력된 YouTube URL:`, youtubeUrl);

      if (!isValidYouTubeUrl(youtubeUrl)) {
        console.error(`[Client] 유효하지 않은 YouTube URL`);
        throw new Error("유효한 YouTube URL이 아닙니다.");
      }

      console.log(`[Client] 서버 액션 호출 시작: getYouTubeTranscript`);
      const startTime = Date.now();

      const result = await getYouTubeTranscript(youtubeUrl);

      const endTime = Date.now();
      console.log(
        `[Client] 서버 액션 응답 받음 (${endTime - startTime}ms):`,
        result
      );

      if (result.success && result.transcript && result.transcript.length > 0) {
        const fullTranscript = result.transcript
          .map((item: any) => item.text)
          .join(" ");

        console.log(`[Client] 자막 추출 성공: ${fullTranscript.length}자`);
        setTranscript(fullTranscript);
        toast.success("자막을 성공적으로 추출했습니다.");
      } else {
        console.error("[Client] 자막 데이터 없음:", result);
        // 디버그 정보가 있으면 표시
        if (result.debug) {
          const debugInfo = JSON.stringify(result.debug, null, 2);
          console.log(`[Client] 디버그 정보:`, debugInfo);
          setError(
            `${result.error || "자막을 찾을 수 없습니다."}\n\n디버그 정보:\n${debugInfo}`
          );
        } else {
          throw new Error(
            result.error || result.details || "자막을 찾을 수 없습니다."
          );
        }
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
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!transcript) return;

    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      toast.success("자막이 클립보드에 복사되었습니다.");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("복사에 실패했습니다.");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
      <div className="mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-600" />
          YouTube 자막 추출
        </h3>
        <p className="text-sm text-slate-600">
          YouTube 영상 URL을 입력하면 자동으로 자막(대본)을 추출합니다.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading && youtubeUrl.trim()) {
                  handleExtract();
                }
              }}
              placeholder="https://www.youtube.com/watch?v=..."
              className="pl-10 pr-10"
            />
            {youtubeUrl && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            onClick={handleExtract}
            disabled={isLoading || !youtubeUrl.trim()}
            className="bg-red-600 hover:bg-red-700 text-white whitespace-nowrap"
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            <pre className="whitespace-pre-wrap break-words text-xs">
              {error}
            </pre>
          </div>
        )}

        {transcript && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">
                추출된 자막
              </p>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="h-8"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    복사
                  </>
                )}
              </Button>
            </div>
            <div className="max-h-96 overflow-y-auto text-sm text-slate-700 bg-white rounded p-4 border border-slate-200 whitespace-pre-wrap">
              {transcript}
            </div>
            <div className="text-xs text-slate-500">
              총 {transcript.split(" ").length}단어, {transcript.length}자
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
