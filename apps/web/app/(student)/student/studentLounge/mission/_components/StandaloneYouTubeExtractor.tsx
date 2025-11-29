"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
  Loader2,
  Download,
  Youtube,
  X,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { extractVideoId, isValidYouTubeUrl } from "@/lib/utils/youtube";
import { toast } from "sonner";
import { getYouTubeTranscript } from "@/serverActions/youtube/youtube-transcript.actions";
import { personalizeTranscriptWithGemini } from "@/serverActions/youtube/gemini-personalize.actions";

export function StandaloneYouTubeExtractor() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [kind, setKind] = useState<string | null>(null);
  const [lang, setLang] = useState<string | null>(null);
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState<string | null>(
    null
  );
  const [studentLevel, setStudentLevel] = useState("");
  const [learningGoals, setLearningGoals] = useState("");

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
        console.log(`[Client] 자막 메타데이터:`, {
          kind: result.kind,
          lang: result.lang,
        });

        setTranscript(fullTranscript);
        setKind(result.kind || null);
        setLang(result.lang || null);
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
    setKind(null);
    setLang(null);
    setPersonalizedContent(null);
    setStudentLevel("");
    setLearningGoals("");
  };

  const handlePersonalize = async () => {
    if (!transcript) {
      toast.error("먼저 자막을 추출해주세요.");
      return;
    }

    setIsPersonalizing(true);
    setError(null);
    setPersonalizedContent(null);

    try {
      console.log(`[Client] 개인화된 학습 자료 생성 시작`);
      const result = await personalizeTranscriptWithGemini(
        transcript,
        studentLevel || undefined,
        learningGoals || undefined
      );

      if (result.success && result.personalizedContent) {
        setPersonalizedContent(result.personalizedContent);
        toast.success("개인화된 학습 자료를 생성했습니다.");
      } else {
        throw new Error(
          result.error || "개인화된 학습 자료 생성에 실패했습니다."
        );
      }
    } catch (error: any) {
      console.error("개인화 오류:", error);
      const errorMessage =
        error.message || "개인화된 학습 자료 생성 중 오류가 발생했습니다.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsPersonalizing(false);
    }
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
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    추출된 자막
                  </p>
                  {(kind || lang) && (
                    <div className="flex items-center gap-1">
                      {kind && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                          kind: {kind}
                        </span>
                      )}
                      {lang && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                          lang: {lang}
                        </span>
                      )}
                    </div>
                  )}
                </div>
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

            {/* 개인화된 학습 자료 생성 섹션 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <p className="text-sm font-semibold text-blue-900">
                  개인화된 학습 자료 생성
                </p>
              </div>
              <p className="text-xs text-blue-700 mb-3">
                추출한 대본을 바탕으로 당신만의 맞춤 학습 자료를 생성합니다.
              </p>

              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">
                    학습자 수준 (선택사항)
                  </label>
                  <Input
                    type="text"
                    placeholder="예: 초급, 중급, 고급"
                    value={studentLevel}
                    onChange={(e) => setStudentLevel(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">
                    학습 목표 (선택사항)
                  </label>
                  <Input
                    type="text"
                    placeholder="예: 실무 적용, 개념 이해, 시험 준비"
                    value={learningGoals}
                    onChange={(e) => setLearningGoals(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              <Button
                onClick={handlePersonalize}
                disabled={isPersonalizing || !transcript}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isPersonalizing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    개인화된 학습 자료 생성
                  </>
                )}
              </Button>
            </div>

            {/* 개인화된 학습 자료 표시 */}
            {personalizedContent && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <p className="text-sm font-semibold text-purple-900">
                      개인화된 학습 자료
                    </p>
                  </div>
                  <Button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          personalizedContent
                        );
                        toast.success(
                          "개인화된 학습 자료가 클립보드에 복사되었습니다."
                        );
                      } catch (error) {
                        toast.error("복사에 실패했습니다.");
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="h-8"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    복사
                  </Button>
                </div>
                <div className="max-h-96 overflow-y-auto text-sm text-slate-800 bg-white rounded p-4 border border-purple-200 prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap">
                    {personalizedContent}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
