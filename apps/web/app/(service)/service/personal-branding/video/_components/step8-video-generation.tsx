import { useState, useRef, useEffect } from "react";
import { Loader2, PlayCircle, Video as VideoIcon, CheckCircle2, User, Sparkles, FileText, Hash } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { toast } from "sonner";
import { cn } from "@repo/ui/lib/utils";
import { generateHeyGenVideo, checkHeyGenVideoStatus } from "@/serverActions/ai-assistant/heygen.actions";
import { generateAvatarIntroVideo } from "@/serverActions/ai-assistant/veo.actions";

interface Step8VideoGenerationProps {
  selectedTitle: string;
  thumbnailUrls?: string;
  scriptResponses?: any;
  metadataResponses?: any;
  onGenerateVideo?: () => void;
  isGenerating?: boolean;
  onVideoGenerated?: (url: string, type: "VEO" | "HEYGEN") => void;
  initialVideoUrl?: string;
  initialVideoType?: "VEO" | "HEYGEN";
}

export function Step8VideoGeneration({
  selectedTitle,
  thumbnailUrls,
  scriptResponses,
  metadataResponses,
  onVideoGenerated,
  initialVideoUrl,
  initialVideoType
}: Step8VideoGenerationProps) {
  const [activeTab, setActiveTab] = useState<"VEO" | "HEYGEN">(initialVideoType || "HEYGEN");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl || null);
  const [videoType, setVideoType] = useState<"VEO" | "HEYGEN" | null>(initialVideoType || null);
  const [progressMessage, setProgressMessage] = useState<string>("");

  // Initial load
  useEffect(() => {
    if (initialVideoUrl) {
      setVideoUrl(initialVideoUrl);
    }
    if (initialVideoType) {
      setVideoType(initialVideoType);
      setActiveTab(initialVideoType);
    }
  }, [initialVideoUrl, initialVideoType]);

  const handleGenerateVideo = async () => {
    if (!scriptResponses?.intro) {
      toast.error("대본 인트로 내용이 없습니다.");
      return;
    }

    setIsGeneratingVideo(true);
    setVideoUrl(null); // Reset previous video
    setVideoType(null);
    
    const introScript = scriptResponses.intro.slice(0, 500); // Limit length

    try {
      if (activeTab === "HEYGEN") {
        await handleHeyGenGeneration(introScript);
      } else {
        await handleVeoGeneration(introScript);
      }
    } catch (error) {
      console.error("Video generation failed:", error);
      toast.error(error instanceof Error ? error.message : "영상 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingVideo(false);
      setProgressMessage("");
    }
  };

  const handleVeoGeneration = async (script: string) => {
    setProgressMessage("Veo 3.1 모델로 생성 중... (약 1분)");
    try {
      const result = await generateAvatarIntroVideo(script);
      if (result.success && result.videoUrl) {
        setVideoUrl(result.videoUrl);
        setVideoType("VEO");
        toast.success("AI 캐릭터 영상이 생성되었습니다.");
        
        onVideoGenerated?.(result.videoUrl, "VEO");
      } else {
        throw new Error(result.error || "Veo 생성 실패");
      }
    } catch (error) {
      throw error;
    }
  };

  const handleHeyGenGeneration = async (script: string) => {
    setProgressMessage("영상 생성 요청 중...");
    try {
      // 1. Request generation
      const result = await generateHeyGenVideo(script);

      if (!result.success || !result.videoId) {
        throw new Error(result.error || "영상 생성 요청 실패");
      }

      const videoId = result.videoId;
      setProgressMessage("영상 처리 중... (약 2~5분 소요)");
      toast.info("영상 생성이 시작되었습니다.");

      // 2. Poll status
      const checkStatus = async () => {
        try {
          const statusResult = await checkHeyGenVideoStatus(videoId);
          
          if (!statusResult.success) {
            throw new Error(statusResult.error || "상태 확인 실패");
          }

          if (statusResult.status === "completed" && statusResult.videoUrl) {
            setVideoUrl(statusResult.videoUrl);
            setVideoType("HEYGEN");
            setIsGeneratingVideo(false);
            setProgressMessage("");
            toast.success("내 아바타 영상이 생성되었습니다.");
            
            onVideoGenerated?.(statusResult.videoUrl, "HEYGEN");
            return;
          } else if (statusResult.status === "failed") {
             setIsGeneratingVideo(false);
             setProgressMessage("");
             toast.error(statusResult.error || "영상 생성 실패");
          } else {
             // Still processing
             setTimeout(checkStatus, 5000);
          }
        } catch (error) {
           console.error("Polling status failed:", error);
           toast.error("영상 상태 확인 중 오류가 발생했습니다.");
           setIsGeneratingVideo(false);
           setProgressMessage("");
        }
      };

      // Start polling
      setTimeout(checkStatus, 5000);
      
      // Return a promise that resolves but keeps loading state true for polling
      return new Promise<void>((resolve) => resolve());

    } catch (error) {
       throw error;
    }
  };


  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">최종 결과물 확인 & 인트로 영상 생성</h2>
        <p className="text-gray-400">
          지금까지 기획한 내용을 바탕으로 인트로 영상을 생성해보세요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Summary Card */}
        <div className="bg-vzx-card border border-white/5 rounded-2xl p-6 space-y-6 overflow-y-auto">
          <div className="space-y-6">
             <h3 className="text-lg font-bold text-white flex items-center gap-2 sticky top-0 bg-vzx-card/95 backdrop-blur py-2 z-10 border-b border-white/5">
                <CheckCircle2 className="text-[#33DB98]" size={20} />
                최종 기획 요약
             </h3>
             
             {/* Thumbnail & Title */}
             <div className="flex gap-6 items-start">
                <div className="w-1/3 min-w-[240px]">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">썸네일</p>
                    <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg relative group aspect-video">
                        {thumbnailUrls ? (
                        <img src={thumbnailUrls} alt="Final Thumbnail" className="w-full h-full object-cover" />
                        ) : (
                        <div className="w-full h-full bg-black/20 flex items-center justify-center text-gray-500">
                            썸네일 없음
                        </div>
                        )}
                    </div>
                </div>
                
                <div className="flex-1 space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">제목</p>
                    <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                        <h4 className="text-xl font-bold text-white leading-normal">{selectedTitle}</h4>
                    </div>
                    {metadataResponses?.description && (
                         <div className="mt-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">설명</p>
                            <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">
                                {metadataResponses.description}
                            </p>
                         </div>
                    )}
                </div>
             </div>

             {/* Full Script */}
             <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-200 font-bold border-b border-white/5 pb-2">
                    <FileText size={16} className="text-[#33DB98]" />
                    <span>전체 대본</span>
                </div>
                <div className="space-y-4 text-sm text-gray-300">
                    {scriptResponses?.intro && (
                        <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                            <span className="text-[#33DB98] text-xs font-bold uppercase block mb-1">인트로</span>
                            {scriptResponses.intro}
                        </div>
                    )}
                    {scriptResponses?.selfIntro && (
                        <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                            <span className="text-orange-400 text-xs font-bold uppercase block mb-1">자기소개</span>
                            {scriptResponses.selfIntro}
                        </div>
                    )}
                    {scriptResponses?.chapters?.map((chapter: any, idx: number) => (
                        <div key={idx} className="bg-black/20 p-3 rounded-lg border border-white/5">
                            <span className="text-blue-400 text-xs font-bold uppercase block mb-1">챕터 {idx + 1}: {chapter.title}</span>
                            {chapter.content}
                        </div>
                    ))}
                    {scriptResponses?.outro && (
                        <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                            <span className="text-green-400 text-xs font-bold uppercase block mb-1">아웃트로</span>
                            {scriptResponses.outro}
                        </div>
                    )}
                </div>
             </div>
             
             {/* Metadata */}
             <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-200 font-bold border-b border-white/5 pb-2">
                    <Hash size={16} className="text-[#33DB98]" />
                    <span>메타데이터</span>
                </div>
                


                {metadataResponses?.tags && (
                    <div className="space-y-1">
                         <span className="text-xs font-bold text-gray-500 uppercase">태그</span>
                         <div className="flex flex-wrap gap-1">
                            {metadataResponses.tags.map((tag: string, i: number) => (
                                <span key={i} className="text-xs text-gray-300 bg-white/5 border border-white/10 px-2 py-1 rounded">
                                {tag}
                                </span>
                            ))}
                         </div>
                    </div>
                )}

                {metadataResponses?.hashtags && (
                    <div className="space-y-1">
                         <span className="text-xs font-bold text-gray-500 uppercase">해시태그</span>
                         <div className="flex flex-wrap gap-1">
                            {metadataResponses.hashtags.map((tag: string, i: number) => (
                                <span key={i} className="text-xs text-[#33DB98] bg-[#33DB98]/10 border border-[#33DB98]/20 px-2 py-1 rounded-full">
                                {tag}
                                </span>
                            ))}
                         </div>
                    </div>
                )}
             </div>
          </div>
        </div>

        {/* Video Generation Card */}
        <div className="bg-vzx-card border border-white/5 rounded-2xl p-6 flex flex-col min-h-[400px] relative overflow-hidden">
           
           {/* Tab Selector */}
           <div className="flex gap-2 mb-6 bg-black/20 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("HEYGEN")}
                disabled={isGeneratingVideo}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
                  activeTab === "HEYGEN" 
                    ? "bg-[#33DB98] text-black shadow-lg shadow-[#33DB98]/10" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                 <User size={16} />
                 내 아바타
              </button>
              <button
                onClick={() => setActiveTab("VEO")}
                disabled={isGeneratingVideo}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
                  activeTab === "VEO" 
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                 <Sparkles size={16} />
                 AI 캐릭터 (Veo)
              </button>
           </div>

           <div className="flex-1 flex flex-col items-center justify-center">
             {videoUrl ? (
               <div className="w-full space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center mb-2">
                     <h3 className="text-lg font-bold text-white">
                       생성된 영상 ({videoType === "HEYGEN" ? "HeyGen" : "Veo"})
                     </h3>
                     <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">
                        {videoType === "HEYGEN" ? "내 아바타" : "가상 캐릭터"}
                     </span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                     <video 
                       src={videoUrl} 
                       controls 
                       className="w-full aspect-video bg-black"
                       poster={thumbnailUrls}
                     />
                  </div>
                  <Button 
                     onClick={() => setVideoUrl(null)}
                     variant="outline"
                     className="w-full border-white/10 hover:bg-white/5 text-gray-400"
                  >
                     다른 버전 생성하기
                  </Button>
               </div>
             ) : (
               <div className="text-center space-y-6 max-w-sm animate-fade-in">
                  <div className={cn(
                     "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 relative transition-colors duration-500",
                     activeTab === "HEYGEN" ? "bg-[#33DB98]/10" : "bg-purple-500/10"
                  )}>
                     <div className={cn(
                        "absolute inset-0 rounded-full animate-ping opacity-20",
                         activeTab === "HEYGEN" ? "bg-[#33DB98]/20" : "bg-purple-500/20"
                     )}></div>
                     <VideoIcon size={32} className={activeTab === "HEYGEN" ? "text-[#33DB98]" : "text-purple-500"} />
                  </div>
                  
                  <div className="space-y-2">
                     <h3 className="text-xl font-bold text-white">
                        {activeTab === "HEYGEN" ? "내 아바타 인트로 생성" : "AI 가상 캐릭터 생성"}
                     </h3>
                     <p className="text-sm text-gray-400">
                        {activeTab === "HEYGEN" 
                          ? "HeyGen에 등록된 나만의 아바타가\n인트로 대본을 읽어주는 영상을 생성합니다." 
                          : "Veo 3.1이 생성한 가상의 AI 캐릭터가\n인트로 대본을 연기하는 영상을 생성합니다."}
                     </p>
                  </div>

                  <Button
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo}
                    className={cn(
                       "w-full py-6 text-lg font-bold text-black shadow-lg transition-all hover:scale-[1.02]",
                       activeTab === "HEYGEN" 
                          ? "bg-[#33DB98] hover:bg-[#33DB98]/90 shadow-[#33DB98]/20" 
                          : "bg-purple-500 hover:bg-purple-500/90 shadow-purple-500/20 text-white"
                    )}
                  >
                    {isGeneratingVideo ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={20} />
                        {progressMessage || "생성 중..."}
                      </>
                    ) : (
                      <>
                         <PlayCircle className="mr-2" size={20} />
                         {activeTab === "HEYGEN" ? "내 아바타로 생성하기" : "AI 캐릭터로 생성하기"}
                      </>
                    )}
                  </Button>
                  
                  {isGeneratingVideo && (
                     <div className="text-xs text-center text-gray-500 animate-pulse">
                        * {activeTab === "HEYGEN" ? "최대 5분 정도 소요됩니다." : "약 1~2분 정도 소요됩니다."}
                     </div>
                  )}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
