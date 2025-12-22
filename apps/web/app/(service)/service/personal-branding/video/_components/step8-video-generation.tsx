import { useState } from "react";
import { Loader2, PlayCircle, Video as VideoIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { toast } from "sonner";
import { generateAvatarIntroVideo } from "@/serverActions/ai-assistant/veo.actions";

interface Step8VideoGenerationProps {
  selectedTitle: string;
  thumbnailUrls?: string;
  scriptResponses?: any;
  metadataResponses?: any;
  onGenerateVideo?: () => void;
  isGenerating?: boolean;
}

export function Step8VideoGeneration({
  selectedTitle,
  thumbnailUrls,
  scriptResponses,
  metadataResponses,
}: Step8VideoGenerationProps) {
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleGenerateVideo = async () => {
    if (!scriptResponses?.intro) {
      toast.error("대본 인트로 내용이 없습니다.");
      return;
    }

    setIsGeneratingVideo(true);
    try {
      const introScript = scriptResponses.intro.slice(0, 500); // Limit length
      // const prompt = `Cinematic shot of a friendly Korean AI avatar presenter speaking to the camera. Professional studio lighting, 4k resolution. The presenter is introducing a video about "${selectedTitle}". Meaningful gesture, engaging expression. The presenter is saying: "${introScript}"`;
      
      // Use the specific server action wrapper
      const result = await generateAvatarIntroVideo(introScript);

      if (result.success && result.videoUrl) {
        setVideoUrl(result.videoUrl);
        toast.success("인트로 영상이 생성되었습니다.");
      } else {
        toast.error("영상 생성에 실패했습니다: " + (result.error || "알 수 없는 오류"));
      }
    } catch (error) {
      console.error("Video generation failed:", error);
      toast.error("영상 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingVideo(false);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summary Card */}
        <div className="bg-vzx-card border border-white/5 rounded-2xl p-6 space-y-6">
          <div className="space-y-4">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="text-[#33DB98]" size={20} />
                최종 기획 요약
             </h3>
             
             {/* Thumbnail */}
             <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg relative group">
                {thumbnailUrls ? (
                  <img src={thumbnailUrls} alt="Final Thumbnail" className="w-full aspect-video object-cover" />
                ) : (
                  <div className="w-full aspect-video bg-black/20 flex items-center justify-center text-gray-500">
                    No Thumbnail
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <p className="text-white font-bold text-sm shadow-black drop-shadow-md">{selectedTitle}</p>
                </div>
             </div>

             {/* Script Snippet */}
             <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Intro Script</p>
                <div className="bg-black/20 p-3 rounded-lg border border-white/5 text-sm text-gray-300 line-clamp-4 italic">
                   "{scriptResponses?.intro || "대본 없음"}"
                </div>
             </div>
             
             {/* Hashtags */}
             <div className="flex flex-wrap gap-2">
                {metadataResponses?.hashtags?.map((tag: string, i: number) => (
                   <span key={i} className="text-xs text-[#33DB98] bg-[#33DB98]/10 px-2 py-1 rounded-full">
                      {tag}
                   </span>
                ))}
             </div>
          </div>
        </div>

        {/* Video Generation Card */}
        <div className="bg-vzx-card border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
           {videoUrl ? (
             <div className="w-full space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Generated Intro Video</h3>
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
             <div className="text-center space-y-6 max-w-sm">
                <div className="w-20 h-20 bg-[#33DB98]/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                   <div className="absolute inset-0 bg-[#33DB98]/20 rounded-full animate-ping opacity-20"></div>
                   <VideoIcon size={32} className="text-[#33DB98]" />
                </div>
                
                <div className="space-y-2">
                   <h3 className="text-xl font-bold text-white">AI 인트로 영상 생성</h3>
                   <p className="text-sm text-gray-400">
                      Veo 3.1이 대본의 인트로 부분을 읽어주는 <br/>
                      가상 아바타 영상을 생성합니다.
                   </p>
                </div>

                <Button
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo}
                  className="w-full py-6 text-lg font-bold bg-[#33DB98] text-black hover:bg-[#33DB98]/90 shadow-lg shadow-[#33DB98]/20 transition-all hover:scale-[1.02]"
                >
                  {isGeneratingVideo ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      영상 생성 중... (약 1~2분)
                    </>
                  ) : (
                    <>
                       <PlayCircle className="mr-2" size={20} />
                       인트로 영상 생성하기
                    </>
                  )}
                </Button>
                
                {isGeneratingVideo && (
                   <div className="text-xs text-center text-gray-500 animate-pulse">
                      * AI 모델 사정에 따라 시간이 소요될 수 있습니다.
                   </div>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
