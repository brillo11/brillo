"use client";

import { useState } from "react";
import { Youtube, CheckCircle2, X, Loader2 } from "lucide-react";
import { Label } from "@repo/ui/components/label";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import { toast } from "sonner";
import { getYouTubeTranscript } from "@/serverActions/youtube/youtube-transcript.actions";

interface YoutubeTranscriptTestProps {
  referenceScript?: string;
  onReferenceScriptChange?: (script: string) => void;
}

export function YoutubeTranscriptTest({
  referenceScript = "",
  onReferenceScriptChange,
}: YoutubeTranscriptTestProps) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isFetchingScript, setIsFetchingScript] = useState(false);
  const [isScriptExpanded, setIsScriptExpanded] = useState(false);

  // Clear script handler
  const handleRemoveScript = () => {
    onReferenceScriptChange?.("");
    setYoutubeUrl(""); 
    setIsScriptExpanded(false);
    toast.info("스타일 적용이 취소되었습니다.");
  };

  const handleFetchScript = async () => {
    if (!youtubeUrl.trim()) {
       toast.error("YouTube URL을 입력해주세요.");
       return;
    }

    setIsFetchingScript(true);
    try {
      const result = await getYouTubeTranscript(youtubeUrl);
      
      if (result.success && result.transcript) {
        // Combine transcript parts into a single text
        const fullScript = result.transcript.map((item: any) => item.text).join(" ");
        onReferenceScriptChange?.(fullScript);
        toast.success("대본 스타일을 성공적으로 불러왔습니다.");
      } else {
        toast.error("자막을 불러오는데 실패했습니다: " + (result.error || "알 수 없는 오류"));
      }
    } catch (error) {
      console.error("Script fetch error:", error);
      toast.error("대본을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsFetchingScript(false);
    }
  };

  return (
    <div className="w-full max-w-lg mt-6 pt-6 border-t border-white/10 mx-auto">
      <div className="flex items-center justify-between mb-3">
        <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Youtube size={16} className="text-red-500" />
            대본 스타일 참고 (테스트)
        </Label>
      </div>
      <div className="flex gap-2 mb-3">
        <Input 
            placeholder="YouTube 영상 URL 입력" 
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="bg-black/40 border-white/10 text-xs h-9 text-white"
        />
        <Button 
            size="sm" 
            onClick={handleFetchScript} 
            disabled={isFetchingScript || !youtubeUrl}
            className="bg-[#33DB98]/20 text-[#33DB98] hover:bg-[#33DB98]/30 border border-[#33DB98]/50 h-9 px-3"
        >
            {isFetchingScript ? <Loader2 size={14} className="animate-spin" /> : "가져오기"}
        </Button>
      </div>
      
      {referenceScript && (
        <div className="bg-[#33DB98]/5 border border-[#33DB98]/20 rounded-lg p-3 relative transition-all">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[#33DB98] text-xs font-bold">
                    <CheckCircle2 size={12} />
                    <span>스타일 적용됨</span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                    onClick={() => setIsScriptExpanded(!isScriptExpanded)}
                    className="text-[10px] text-[#33DB98] hover:underline"
                    >
                    {isScriptExpanded ? "접기" : "전체 보기"}
                    </button>
                    <button
                    onClick={handleRemoveScript}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                    title="스타일 적용 취소"
                    >
                    <X size={14} />
                    </button>
                </div>
            </div>
            <p className={`text-xs text-gray-400 italic ${isScriptExpanded ? "max-h-60 overflow-y-auto whitespace-pre-wrap" : "line-clamp-2"}`}>
                "{referenceScript}"
            </p>
        </div>
      )}
    </div>
  );
}
