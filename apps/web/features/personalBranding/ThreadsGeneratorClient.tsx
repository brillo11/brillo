"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { toast } from "sonner";
import {
  Loader2,
  Copy,
  Sparkles,
  MessageCircle,
  Zap,
  Users,
  HelpCircle,
  Heart,
  Repeat,
  Send,
  Bomb,
  TrendingUp,
  Glasses,
  Gift,
} from "lucide-react";
import {
  generateThreadsContent,
  ThreadsStyle,
  ThreadsTone,
} from "@/app/(service)/service/personal-branding/threads/actions";

const STYLES: {
  id: ThreadsStyle;
  title: string;
  desc: string;
  icon: any;
  detail: string;
}[] = [
  {
    id: "EMPATHY",
    title: "공감형 (일상 & 유머)",
    desc: "'나만 이런 거 아니지?' 솔직한 썰",
    icon: MessageCircle,
    detail: "실수담, 퇴사 욕구, 연애 고민 등 꾸밈없는 날것의 이야기",
  },
  {
    id: "TIPS",
    title: "꿀팁 & 인사이트",
    desc: "'이거 알면 인생 편해짐' 정보 공유",
    icon: Zap,
    detail: "저장과 공유를 부르는 커리어, 자기계발, 찐경험담",
  },
  {
    id: "DEBATE",
    title: "논쟁 & 토론 유도",
    desc: "'님들 이거 어떻게 생각함?'",
    icon: HelpCircle,
    detail: "밸런스 게임, 소신 발언 등 폭발적인 댓글 참여 유도",
  },
  {
    id: "NETWORKING",
    title: "친목 & 네트워킹",
    desc: "'쓰친(쓰레드 친구) 구함'",
    icon: Users,
    detail: "업계 네트워킹, 취미 공유, 반모/존모 친구 찾기",
  },
  {
    id: "FACT_BOMBER",
    title: "팩트폭격 & 현실조언",
    desc: "'뼈 맞아서 순살됨'",
    icon: Bomb,
    detail: "정신이 번쩍 드는 현실적인 조언, 쓴소리, 동기부여",
  },
  {
    id: "BUILDING_IN_PUBLIC",
    title: "성장 기록 & 스토리 리빙",
    desc: "'같이 성장할 사람?'",
    icon: TrendingUp,
    detail: "실패와 배움을 투명하게 공유, 팬덤 형성",
  },
  {
    id: "MY_WAY",
    title: "마이웨이 (소신 발언)",
    desc: "'난 좀 다른데?'",
    icon: Glasses,
    detail: "남 눈치 안 보는 독자적 시각, 힙한 태도",
  },
  {
    id: "CURATION",
    title: "큐레이션 & 정보요약",
    desc: "'이거 하나면 끝!'",
    icon: Gift,
    detail: "뉴스/트렌드/꿀팁 3줄 요약, 떠먹여 주기",
  },
];

const TONES: {
  id: ThreadsTone;
  label: string;
}[] = [
  { id: "AUTO", label: "자동" },
  { id: "POLITE", label: "존댓말 모드" },
  { id: "CASUAL", label: "반말 모드" },
  { id: "MIXED", label: "반존대 모드" },
];

export interface ThreadsGeneratorState {
  topic: string;
  targetAudience: string;
  insight: string;
  selectedStyle: ThreadsStyle | null;
  generatedStyle: ThreadsStyle | null;
  selectedTone: ThreadsTone;
  posts: string[];
}

interface ThreadsGeneratorClientProps {
  initialTopic?: string;
  initialTargetAudience?: string;
  initialInsight?: string;
  initialData?: Partial<ThreadsGeneratorState>;
  onDataChange?: (data: ThreadsGeneratorState) => void;
  hideHeader?: boolean;
}

export function ThreadsGeneratorClient({
  initialTopic = "",
  initialTargetAudience = "",
  initialInsight = "",
  initialData,
  onDataChange,
  hideHeader = false,
}: ThreadsGeneratorClientProps) {
  const [topic, setTopic] = useState(initialData?.topic || initialTopic);
  const [targetAudience, setTargetAudience] = useState(
    initialData?.targetAudience || initialTargetAudience,
  );
  const [insight, setInsight] = useState(
    initialData?.insight || initialInsight,
  );
  const [selectedStyle, setSelectedStyle] = useState<ThreadsStyle | null>(
    initialData?.selectedStyle || null,
  );
  const [generatedStyle, setGeneratedStyle] = useState<ThreadsStyle | null>(
    initialData?.generatedStyle || null,
  );
  const [selectedTone, setSelectedTone] = useState<ThreadsTone>(
    initialData?.selectedTone || "AUTO",
  );

  const [posts, setPosts] = useState<string[]>(initialData?.posts || []);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialTopic && !initialData?.topic) setTopic(initialTopic);
    if (initialTargetAudience && !initialData?.targetAudience)
      setTargetAudience(initialTargetAudience);
    if (initialInsight && !initialData?.insight) setInsight(initialInsight);
  }, [initialTopic, initialTargetAudience, initialInsight]);

  // Sync state changes to parent
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        topic,
        targetAudience,
        insight,
        selectedStyle,
        generatedStyle,
        selectedTone,
        posts,
      });
    }
  }, [
    topic,
    targetAudience,
    insight,
    selectedStyle,
    generatedStyle,
    selectedTone,
    posts,
    onDataChange,
  ]);

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast.error("주제를 입력해주세요.");
      return;
    }
    if (!selectedStyle) {
      toast.error("스타일을 선택해주세요.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await generateThreadsContent(
          topic,
          selectedStyle,
          selectedTone,
          targetAudience,
          insight,
        );
        if (result.success && result.posts) {
          setPosts(result.posts);
          setGeneratedStyle(selectedStyle);
          toast.success("쓰레드 포스트가 생성되었습니다.");
        } else {
          toast.error(result.error || "생성에 실패했습니다.");
        }
      } catch (error) {
        toast.error("오류가 발생했습니다.");
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("클립보드에 복사되었습니다.");
  };

  return (
    <div className="container mx-auto max-w-5xl space-y-8 animate-fade-in selection:bg-[var(--vzx-accent)] selection:text-black">
      {!hideHeader && (
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
            쓰레드 포스트 작성
          </h1>
          <p className="text-gray-400">
            주제와 스타일을 선택하여 한국 쓰레드 감성의 힙한 포스트를
            생성해보세요.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column: Inputs */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-gray-300">
              주제
            </Label>
            <Input
              id="topic"
              placeholder="작성하고 싶은 주제를 입력하세요 (ex. 개발자 취업 현실)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-vzx-bg border-white/10 text-white placeholder:text-gray-500 focus-visible:border-[var(--vzx-accent)] focus-visible:ring-1 focus-visible:ring-[var(--vzx-accent)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target" className="text-gray-300">
                대상 고객 <span className="text-gray-500 text-xs">(선택)</span>
              </Label>
              <Input
                id="target"
                placeholder="ex. 취준생, 주니어 개발자"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="bg-vzx-bg border-white/10 text-white placeholder:text-gray-500 focus-visible:border-[var(--vzx-accent)] focus-visible:ring-1 focus-visible:ring-[var(--vzx-accent)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insight" className="text-gray-300">
                핵심 인사이트{" "}
                <span className="text-gray-500 text-xs">(선택)</span>
              </Label>
              <Input
                id="insight"
                placeholder="ex. 코딩 실력보다 중요한 건 소통"
                value={insight}
                onChange={(e) => setInsight(e.target.value)}
                className="bg-vzx-bg border-white/10 text-white placeholder:text-gray-500 focus-visible:border-[var(--vzx-accent)] focus-visible:ring-1 focus-visible:ring-[var(--vzx-accent)]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">스타일 선택</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STYLES.map((style) => (
                <div
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`
                      relative cursor-pointer transition-all duration-300 border rounded-2xl p-4
                      ${
                        selectedStyle === style.id
                          ? "bg-[var(--vzx-accent)]/10 border-[var(--vzx-accent)] ring-1 ring-[var(--vzx-accent)]/50"
                          : "bg-vzx-card border-white/5 hover:border-[var(--vzx-accent)]/50 text-gray-400 hover:text-white"
                      }
                    `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        selectedStyle === style.id
                          ? "bg-[var(--vzx-accent)] text-black"
                          : "bg-white/5 text-gray-400"
                      }`}
                    >
                      <style.icon size={20} />
                    </div>
                    {selectedStyle === style.id && (
                      <div className="w-2 h-2 rounded-full bg-[var(--vzx-accent)] animate-pulse" />
                    )}
                  </div>
                  <h3
                    className={`font-bold mb-1 transition-colors ${
                      selectedStyle === style.id
                        ? "text-[var(--vzx-accent)]"
                        : "text-gray-200"
                    }`}
                  >
                    {style.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium mb-1">
                    {style.desc}
                  </p>
                  <p className="text-[10px] text-gray-500 leading-tight border-t border-white/5 pt-2 mt-2">
                    {style.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">소통방식</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TONES.map((tone) => (
                <div
                  key={tone.id}
                  onClick={() => setSelectedTone(tone.id)}
                  className={`
                      cursor-pointer text-center py-3 rounded-xl border transition-all duration-200 text-sm font-medium
                      ${
                        selectedTone === tone.id
                          ? "bg-[var(--vzx-accent)] text-black border-[var(--vzx-accent)]"
                          : "bg-vzx-card border-white/5 text-gray-400 hover:text-white hover:border-white/20"
                      }
                    `}
                >
                  {tone.label}
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isPending || !topic.trim() || !selectedStyle}
            className="w-full h-12 text-lg bg-[var(--vzx-accent)] text-black hover:bg-[var(--vzx-accent)]/90 font-bold border-none"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin mr-2" /> 잡생각 정리하는 중...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" /> 쓰레드 생성하기
              </>
            )}
          </Button>
        </div>

        {/* Right Column: Preview */}
        <div className="space-y-6">
          <div className="bg-[#101010] border border-white/10 rounded-3xl p-6 min-h-[600px] relative overflow-hidden">
            {/* Background Pattern */}

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
              {/* <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <MessageCircle className="text-black fill-black" size={16} />
              </div> */}
              생성된 쓰레드
              {generatedStyle && (
                <span className="ml-2 px-3 py-1 rounded-full bg-[var(--vzx-accent)]/20 text-[var(--vzx-accent)] text-xs font-medium border border-[var(--vzx-accent)]/30">
                  {STYLES.find((s) => s.id === generatedStyle)?.title}
                </span>
              )}
            </h2>

            {posts.length > 0 ? (
              <div className="space-y-0 relative z-10">
                {/* Thread Chain Line */}
                <div className="absolute left-[27px] top-4 bottom-10 w-0.5 bg-gray-800" />

                {posts.map((post, index) => (
                  <div key={index} className="relative pl-14 pt-2 pb-6 group">
                    {/* Avatar */}
                    <div className="absolute left-0 top-0 w-14 h-14 flex items-start justify-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-white/10 flex items-center justify-center text-xs font-bold text-white z-10 shadow-lg">
                        V
                      </div>
                      {index < posts.length - 1 && (
                        <div className="absolute top-10 bottom-[-24px] w-0.5 bg-gray-700 z-0" />
                      )}
                    </div>

                    {/* Content Bubble */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">
                          vizion_x
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs">
                            {index === 0 ? "2m" : "1m"}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(post)}
                            className="h-6 w-6 p-0 hover:bg-white/10 text-gray-500"
                          >
                            <Copy size={12} />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {post}
                      </p>

                      {/* Interaction Mock */}
                      <div className="flex items-center gap-4 pt-2">
                        <div className="group/icon flex items-center gap-1 cursor-pointer">
                          <Heart
                            size={20}
                            className="text-gray-500 group-hover/icon:text-red-500 transition-colors"
                          />
                        </div>
                        <div className="group/icon flex items-center gap-1 cursor-pointer">
                          <MessageCircle
                            size={20}
                            className="text-gray-500 group-hover/icon:text-white transition-colors"
                          />
                        </div>
                        <div className="group/icon flex items-center gap-1 cursor-pointer">
                          <Repeat
                            size={20}
                            className="text-gray-500 group-hover/icon:text-white transition-colors"
                          />
                        </div>
                        <div className="group/icon flex items-center gap-1 cursor-pointer">
                          <Send
                            size={20}
                            className="text-gray-500 group-hover/icon:text-white transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 pt-20 opacity-40">
                <MessageCircle size={48} className="text-gray-700" />
                <p>생성된 쓰레드가 여기에 표시됩니다</p>
              </div>
            )}
          </div>

          {posts.length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={() => copyToClipboard(posts.join("\n\n"))}
                className="bg-[var(--vzx-accent)] text-black font-bold hover:bg-[#2bb880] transition-colors"
              >
                <Copy size={16} className="mr-2" /> 전체 복사하기
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
