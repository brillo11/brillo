"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Loader2, Sparkles, Youtube, ExternalLink } from "lucide-react";
import { getYouTubeTranscript } from "@/serverActions/youtube/youtube-transcript.actions";
import { personalizeTranscriptWithGemini } from "@/serverActions/youtube/gemini-personalize.actions";
import { getStudentProfile } from "@/serverActions/student/profile.actions";
import { toast } from "sonner";
// Markdown을 간단한 HTML로 변환하는 함수
function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
    .replace(
      /^## (.*$)/gim,
      '<h2 class="text-xl font-semibold mb-3 mt-6">$1</h2>'
    )
    .replace(
      /^### (.*$)/gim,
      '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>'
    )
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
    .replace(/\n\n/gim, '</p><p class="mb-4">')
    .replace(/\n/gim, "<br>");
}

interface AutoPersonalizedTranscriptProps {
  youtubeUrl: string;
  missionTitle: string;
}

export function AutoPersonalizedTranscript({
  youtubeUrl,
  missionTitle,
}: AutoPersonalizedTranscriptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setPersonalizedContent(null);

    try {
      // 1. YouTube 대본 추출
      toast.info("YouTube 대본을 추출하는 중...");
      const transcriptResult = await getYouTubeTranscript(youtubeUrl);

      if (!transcriptResult.success || !transcriptResult.transcript) {
        throw new Error(transcriptResult.error || "대본 추출에 실패했습니다.");
      }

      // 대본 텍스트로 변환
      const transcriptText = transcriptResult.transcript
        .map((item: any) => item.text)
        .join(" ");

      // 2. 수강생 프로필 가져오기
      const profile = await getStudentProfile();

      // 3. 개인화된 학습 자료 생성
      toast.info("개인화된 학습 자료를 생성하는 중...");
      const personalizeResult = await personalizeTranscriptWithGemini(
        transcriptText,
        profile.learningLevel || undefined,
        profile.learningGoals || undefined
      );

      if (
        !personalizeResult.success ||
        !personalizeResult.personalizedContent
      ) {
        throw new Error(
          personalizeResult.error || "개인화된 학습 자료 생성에 실패했습니다."
        );
      }

      setPersonalizedContent(personalizeResult.personalizedContent);
      toast.success("개인화된 학습 자료가 생성되었습니다!");
    } catch (error: any) {
      console.error("자동 개인화 오류:", error);
      const errorMessage =
        error.message || "개인화된 학습 자료 생성 중 오류가 발생했습니다.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 자동 생성 (의존성 배열 경고 방지)
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeUrl]);

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">개인화된 학습 자료</CardTitle>
          </div>
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Youtube className="w-4 h-4" />
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <CardDescription>
          이 미션의 YouTube 영상을 기반으로 생성된 개인화된 학습 자료입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-slate-600">
              개인화된 학습 자료를 생성하는 중...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 mb-3">{error}</p>
            <Button
              onClick={handleGenerate}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              다시 시도
            </Button>
          </div>
        )}

        {personalizedContent && !isLoading && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <div
                className="prose prose-sm max-w-none text-slate-700"
                dangerouslySetInnerHTML={{
                  __html: `<p class="mb-4">${markdownToHtml(personalizedContent)}</p>`,
                }}
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleGenerate}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                다시 생성
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
