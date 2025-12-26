"use client";

import JSZip from "jszip";
import dayjs from "dayjs";
import { useState, useTransition, useEffect } from "react";
import { Button } from "@repo/ui/components/button";
import { Textarea } from "@repo/ui/components/textarea";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  generateInstagramContent,
  generateInstagramImage,
  InstagramStyle,
  InstagramAspectRatio,
} from "@/app/(service)/service/personal-branding/instagram/actions";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import {
  Loader2,
  Plus,
  Trash2,
  Copy,
  Wand2,
  HelpCircle,
  Image as ImageIcon,
  Smartphone,
  Monitor,
  Square,
  Sparkles,
  Download,
  Magnet,
  Target,
  Siren,
  ListOrdered,
  Hammer,
  BookOpen,
  AlertOctagon,
} from "lucide-react";

const STYLES: {
  id: InstagramStyle;
  title: string;
  desc: string;
  pages: string;
  id: InstagramStyle;
  title: string;
  desc: string;
  pages: string;
  icon: any;
  detail: string;
}[] = [
  {
    id: "RETENTION",
    title: "리텐션",
    desc: "끝까지 읽게 만드는 몰입형 구조",
    pages: "8 페이지",
    icon: Magnet,
    detail: "훅(1p) -> 공감 유도(2p) -> 핵심 정보(3~6p) -> 요약(7p) -> CTA(8p)",
  },
  {
    id: "AIDA",
    title: "AIDA",
    desc: "논리적인 설득과 상세 정보 전달",
    pages: "8 페이지",
    icon: Target,
    detail: "Attention(1p) -> Interest(2~3p) -> Desire(4~6p) -> Action(7~8p)",
  },
  {
    id: "PAS",
    title: "PAS",
    desc: "문제 제기와 해결책 제시 (광고성)",
    pages: "5 페이지",
    icon: Siren,
    detail: "Problem(1p) -> Agitation(2~3p) -> Solution(4~5p)",
  },
  {
    id: "BAB",
    title: "BAB",
    desc: "꿈과 희망, 변화를 보여주는 구조",
    pages: "6 페이지",
    icon: Sparkles,
    detail: "Before(1~2p) -> After(3~4p) -> Bridge(5~6p)",
  },
  {
    id: "LISTICLE",
    title: "리스트형",
    desc: "저장 부르는 꿀팁 모음",
    pages: "8 페이지",
    icon: ListOrdered,
    detail: "인트로(1p) -> 팁 나열(2~6p) -> 요약 및 저장 유도(7~8p)",
  },
  {
    id: "HOW_TO",
    title: "하우투",
    desc: "따라만 하면 완성되는 가이드",
    pages: "8 페이지",
    icon: Hammer,
    detail:
      "결과물(1p) -> 준비물(2p) -> 단계별 과정(3~6p) -> 완성 및 CTA(7~8p)",
  },
  {
    id: "STORYTELLING",
    title: "스토리텔링",
    desc: "몰입감 있는 경험담 / 썰",
    pages: "8 페이지",
    icon: BookOpen,
    detail: "배경(1p) -> 위기(2p) -> 갈등(3~4p) -> 해결(5~6p) -> 교훈(7~8p)",
  },
  {
    id: "MISTAKES",
    title: "실수 모음",
    desc: "이것만 안 해도 절반은 성공!",
    pages: "8 페이지",
    icon: AlertOctagon,
    detail:
      "하지마라(1p) -> 실수1(2p) -> 실수2(3p) -> 실수3(4p) -> 해결책(5~6p) -> 요약(7~8p)",
  },
];

const ASPECT_RATIOS: {
  id: InstagramAspectRatio;
  label: string;
  icon: typeof Smartphone;
}[] = [
  { id: "1:1", label: "정방형 (1:1)", icon: Square },
  { id: "9:16", label: "세로형 (9:16)", icon: Smartphone },
  { id: "4:5", label: "세로형 (4:5)", icon: Smartphone },
];

interface InstagramPageContent {
  visual: string;
  mainText: string;
  miniTexts: string;
  directions: string;
  imageUrl?: string;
}

export interface InstagramGeneratorState {
  topic: string;
  targetAudience: string;
  keyInsights: string;
  selectedStyle: InstagramStyle | null;
  generatedStyle: InstagramStyle | null;
  pages: InstagramPageContent[];
  aspectRatio: InstagramAspectRatio;
}

interface InstagramGeneratorClientProps {
  initialTopic?: string;
  initialTargetAudience?: string;
  initialInsight?: string;
  initialData?: Partial<InstagramGeneratorState>;
  onDataChange?: (data: InstagramGeneratorState) => void;
  hideHeader?: boolean;
}

export function InstagramGeneratorClient({
  initialTopic = "",
  initialTargetAudience = "",
  initialInsight = "",
  initialData,
  onDataChange,
  hideHeader = false,
}: InstagramGeneratorClientProps) {
  const [topic, setTopic] = useState(initialData?.topic || initialTopic);
  const [targetAudience, setTargetAudience] = useState(
    initialData?.targetAudience || initialTargetAudience,
  );
  const [keyInsights, setKeyInsights] = useState(
    initialData?.keyInsights || initialInsight,
  );

  const [selectedStyle, setSelectedStyle] = useState<InstagramStyle | null>(
    initialData?.selectedStyle || null,
  );
  const [generatedStyle, setGeneratedStyle] = useState<InstagramStyle | null>(
    initialData?.generatedStyle || null,
  );
  const [pages, setPages] = useState<InstagramPageContent[]>(
    initialData?.pages || [],
  );
  const [isPending, startTransition] = useTransition();

  const [aspectRatio, setAspectRatio] = useState<InstagramAspectRatio>(
    initialData?.aspectRatio || "1:1",
  );

  const [isGeneratingImages, setIsGeneratingImages] = useState(false);

  useEffect(() => {
    if (initialTopic && !initialData?.topic) setTopic(initialTopic);
    if (initialTargetAudience && !initialData?.targetAudience)
      setTargetAudience(initialTargetAudience);
    if (initialInsight && !initialData?.keyInsights)
      setKeyInsights(initialInsight);
  }, [initialTopic, initialTargetAudience, initialInsight]);

  // Sync state changes to parent
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        topic,
        targetAudience,
        keyInsights,
        selectedStyle,
        generatedStyle,
        pages,
        aspectRatio,
      });
    }
  }, [
    topic,
    targetAudience,
    keyInsights,
    selectedStyle,
    generatedStyle,
    pages,
    aspectRatio,
    onDataChange,
  ]);

  const getFormattedFilename = (pageIndex: number, extension = "png") => {
    const safeTopic = topic.trim().replace(/[^a-zA-Z0-9가-힣]/g, "_");
    const timestamp = dayjs().format("YYYYMMDDHHmm");
    return `${safeTopic}_${timestamp}_Page${pageIndex + 1}.${extension}`;
  };

  const handleDownloadAll = async () => {
    if (pages.length === 0) return;

    const zip = new JSZip();
    let count = 0;

    const promises = pages.map(async (page, index) => {
      if (!page.imageUrl) return;

      try {
        const response = await fetch(page.imageUrl);
        const blob = await response.blob();
        const filename = getFormattedFilename(index, "jpg");
        zip.file(filename, blob);
        count++;
      } catch (err) {
        console.error("Failed to add file to zip", err);
      }
    });

    await Promise.all(promises);

    if (count === 0) {
      toast.error("다운로드할 이미지가 없습니다.");
      return;
    }

    const safeTopic = topic.trim().replace(/[^a-zA-Z0-9가-힣]/g, "_");
    const timestamp = dayjs().format("YYYYMMDDHHmm");
    const zipFilename = `${safeTopic}_${timestamp}_All.zip`;

    const content = await zip.generateAsync({ type: "blob" });

    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = zipFilename;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("이미지 전체 다운로드가 시작되었습니다.");
  };

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
        const result = await generateInstagramContent(
          topic,
          selectedStyle,
          keyInsights,
          targetAudience,
        );
        if (result.success && result.pages) {
          setPages(result.pages as InstagramPageContent[]);
          setGeneratedStyle(selectedStyle);
          toast.success("카드 뉴스 기획이 생성되었습니다.");
        } else {
          toast.error(result.error || "생성에 실패했습니다.");
        }
      } catch (error) {
        toast.error("오류가 발생했습니다.");
      }
    });
  };

  const handleGenerateImages = async () => {
    if (pages.length === 0) return;

    setIsGeneratingImages(true);
    toast.info("이미지 생성을 시작합니다...");

    const newPages = [...pages];
    let successCount = 0;

    try {
      const promises = newPages.map(async (page, index) => {
        if (!page.visual) return null;

        const result = await generateInstagramImage(
          {
            visual: page.visual,
            mainText: page.mainText,
            miniTexts: page.miniTexts,
            directions: page.directions,
          },
          aspectRatio,
        );
        if (result.success && result.url) {
          return { index, url: result.url };
        }
        return null;
      });

      const results = await Promise.all(promises);

      results.forEach((res) => {
        if (res) {
          const currentPage = newPages[res.index];
          if (currentPage) {
            newPages[res.index] = { ...currentPage, imageUrl: res.url };
            successCount++;
          }
        }
      });

      setPages(newPages);

      if (successCount > 0) {
        toast.success(`${successCount}장의 이미지가 생성되었습니다.`);
      } else {
        toast.error("이미지 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      toast.error("이미지 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const updatePage = (
    index: number,
    field: keyof InstagramPageContent,
    value: string,
  ) => {
    const newPages = [...pages];
    if (!newPages[index]) return;
    newPages[index] = { ...newPages[index], [field]: value };
    setPages(newPages);
  };

  const addPage = () => {
    setPages([
      ...pages,
      { visual: "", mainText: "", miniTexts: "", directions: "" },
    ]);
  };

  const removePage = (index: number) => {
    setPages(pages.filter((_, i) => i !== index));
  };

  const copyAll = () => {
    const allText = pages
      .map(
        (p, i) =>
          `[Page ${i + 1}]\nVisual: ${p.visual}\nMain Text: ${p.mainText}\nMini Texts: ${p.miniTexts}\nDirections: ${p.directions}`,
      )
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(allText);
    toast.success("전체 내용이 복사되었습니다.");
  };

  return (
    <div className="container mx-auto max-w-5xl space-y-8 animate-fade-in selection:bg-[var(--vzx-accent)] selection:text-black">
      {!hideHeader && (
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
            인스타그램 캐러셀 기획
          </h1>
          <p className="text-gray-400">
            주제와 스타일을 선택하여 전문적인 카드 뉴스 스크립트를 생성해보세요.
          </p>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-gray-300">
              주제
            </Label>
            <Input
              id="topic"
              placeholder="예: 2026년 마케팅 트렌드, 건강한 다이어트 비법"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isPending}
              className="bg-vzx-bg border-white/10 text-white placeholder:text-gray-500 focus-visible:border-[var(--vzx-accent)] focus-visible:ring-1 focus-visible:ring-[var(--vzx-accent)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAudience" className="text-gray-300">
                대상 고객 <span className="text-gray-500 text-xs">(선택)</span>
              </Label>
              <Input
                id="targetAudience"
                placeholder="예: 30대 직장인, 워킹맘"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                disabled={isPending}
                className="bg-vzx-bg border-white/10 text-white placeholder:text-gray-500 focus-visible:border-[var(--vzx-accent)] focus-visible:ring-1 focus-visible:ring-[var(--vzx-accent)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyInsights" className="text-gray-300">
                핵심 인사이트{" "}
                <span className="text-gray-500 text-xs">(선택)</span>
              </Label>
              <Input
                id="keyInsights"
                placeholder="예: 꾸준함이 정답이다, 결국 기본기"
                value={keyInsights}
                onChange={(e) => setKeyInsights(e.target.value)}
                disabled={isPending}
                className="bg-vzx-bg border-white/10 text-white placeholder:text-gray-500 focus-visible:border-[var(--vzx-accent)] focus-visible:ring-1 focus-visible:ring-[var(--vzx-accent)]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">스타일 선택</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TooltipProvider>
                {STYLES.map((style) => (
                  <div
                    key={style.id}
                    className={`
                      relative cursor-pointer transition-all duration-300 border rounded-2xl p-4
                      ${
                        selectedStyle === style.id
                          ? "bg-[var(--vzx-accent)]/10 border-[var(--vzx-accent)] ring-1 ring-[var(--vzx-accent)]/50"
                          : "bg-vzx-card border-white/5 hover:border-[var(--vzx-accent)]/50 text-gray-400 hover:text-white"
                      }
                    `}
                    onClick={() => !isPending && setSelectedStyle(style.id)}
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
                    <div className="flex items-center justify-between font-medium mb-1">
                      <span
                        className={
                          selectedStyle === style.id
                            ? "text-[var(--vzx-accent)]"
                            : "text-white"
                        }
                      >
                        {style.title}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {style.desc} • {style.pages}
                    </p>
                    <p className="text-[10px] text-gray-500 leading-tight border-t border-white/5 pt-2 mt-2">
                      {style.detail}
                    </p>
                  </div>
                ))}
              </TooltipProvider>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isPending || !topic || !selectedStyle}
            className="w-full h-12 text-lg bg-[var(--vzx-accent)] text-black hover:bg-[var(--vzx-accent)]/90 font-bold border-none"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                기획 생성 중...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                카드 뉴스 기획 생성
              </>
            )}
          </Button>

          {/* Image Generation Options (Only show when pages exist) */}
          {pages.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-white/10 animate-fade-in">
              <div className="space-y-2">
                <Label className="text-gray-300">이미지 비율 선택</Label>
                <div className="grid grid-cols-3 gap-3">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id)}
                      disabled={isGeneratingImages}
                      className={`
                        flex flex-col items-center justify-center p-3 rounded-xl border transition-all
                        ${
                          aspectRatio === ratio.id
                            ? "bg-white/10 border-[var(--vzx-accent)] text-[var(--vzx-accent)]"
                            : "bg-vzx-card border-white/5 text-gray-400 hover:bg-white/5"
                        }
                      `}
                    >
                      <ratio.icon className="w-5 h-5 mb-1" />
                      <span className="text-xs font-medium">{ratio.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateImages}
                  disabled={isGeneratingImages || pages.length === 0}
                  className="flex-1 h-12 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium"
                >
                  {isGeneratingImages ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      이미지 생성 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5 text-yellow-400" />
                      캐러셀 이미지 생성
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleDownloadAll}
                  disabled={
                    isGeneratingImages ||
                    pages.length === 0 ||
                    !pages.some((p) => p.imageUrl)
                  }
                  className="h-12 px-6 bg-[var(--vzx-accent)] text-black hover:bg-[var(--vzx-accent)]/90 font-bold border-none"
                >
                  <Download className="h-5 w-5 mr-2" />
                  전체 다운로드
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Output Section */}
        <div className="relative border border-white/5 rounded-2xl bg-vzx-card p-6 min-h-[500px]">
          {pages.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  기획 결과 ({pages.length} 페이지)
                  {generatedStyle && (
                    <span className="ml-2 px-3 py-1 rounded-full bg-[var(--vzx-accent)]/20 text-[var(--vzx-accent)] text-xs font-medium border border-[var(--vzx-accent)]/30">
                      {STYLES.find((s) => s.id === generatedStyle)?.title}
                    </span>
                  )}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAll}
                  className="border-white/10 text-gray-300 hover:bg-white/5 hover:text-white"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  전체 복사
                </Button>
              </div>

              <div className="space-y-8">
                {pages.map((pageContent, index) => (
                  <div
                    key={index}
                    className="group relative bg-[#1E1E1E] rounded-xl p-6 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="absolute top-4 right-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400 hover:bg-transparent"
                        onClick={() => removePage(index)}
                        title="페이지 삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mb-4 flex items-center gap-2">
                      <div className="bg-[var(--vzx-accent)] text-black text-xs font-bold px-2 py-1 rounded">
                        PAGE {index + 1}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Visual Description */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-[var(--vzx-accent)] uppercase tracking-wider font-semibold">
                          Visual Idea
                        </Label>
                        <Input
                          value={pageContent.visual}
                          onChange={(e) =>
                            updatePage(index, "visual", e.target.value)
                          }
                          className="bg-black/30 border-white/10 text-white focus-visible:border-[var(--vzx-accent)] focus-visible:ring-1 focus-visible:ring-[var(--vzx-accent)]"
                          placeholder="이미지/비주얼 설명"
                        />
                      </div>

                      {/* Main Text */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-[var(--vzx-accent)] uppercase tracking-wider font-semibold">
                          Main Text
                        </Label>
                        <Textarea
                          value={pageContent.mainText}
                          onChange={(e) =>
                            updatePage(index, "mainText", e.target.value)
                          }
                          className="bg-black/30 border-white/10 text-white focus-visible:border-[var(--vzx-accent)] focus-visible:ring-1 focus-visible:ring-[var(--vzx-accent)] min-h-[80px]"
                          placeholder="메인 텍스트 (큰 글씨)"
                        />
                      </div>

                      {/* Mini Texts */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                          Sub / Mini Texts
                        </Label>
                        <Textarea
                          value={pageContent.miniTexts}
                          onChange={(e) =>
                            updatePage(index, "miniTexts", e.target.value)
                          }
                          className="bg-black/30 border-white/10 text-gray-300 focus-visible:border-[var(--vzx-accent)] focus-visible:ring-1 focus-visible:ring-[var(--vzx-accent)] min-h-[60px]"
                          placeholder="보조 텍스트 (작은 글씨)"
                        />
                      </div>

                      {/* Directions */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                          Design / Direction
                        </Label>
                        <Input
                          value={pageContent.directions}
                          onChange={(e) =>
                            updatePage(index, "directions", e.target.value)
                          }
                          className="bg-black/30 border-white/10 text-gray-400 focus-visible:border-[var(--vzx-accent)] focus-visible:ring-1 focus-visible:ring-[var(--vzx-accent)]"
                          placeholder="디자인 및 배치 가이드"
                        />
                      </div>

                      {/* Generated Image */}
                      {pageContent.imageUrl && (
                        <div className="space-y-1.5 animate-fade-in">
                          <Label className="text-xs text-[var(--vzx-accent)] uppercase tracking-wider font-semibold">
                            Generated Image
                          </Label>
                          <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black/50 group/image">
                            <img
                              src={pageContent.imageUrl}
                              alt={`Page ${index + 1} Generated Image`}
                              className="w-full h-auto object-contain max-h-[400px]"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-white/20 text-white hover:bg-white/20"
                                onClick={() => {
                                  const filename = getFormattedFilename(
                                    index,
                                    "jpg",
                                  );
                                  const link = document.createElement("a");
                                  link.href = pageContent.imageUrl!;
                                  link.download = filename;
                                  link.click();
                                }}
                              >
                                다운로드
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full border-dashed border-white/10 text-gray-400 hover:bg-white/5 hover:text-[var(--vzx-accent)] hover:border-[var(--vzx-accent)] py-8"
                  onClick={addPage}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  페이지 추가
                </Button>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-6 text-center">
              <div className="mb-4 rounded-full bg-vzx-bg p-4 border border-white/5">
                <Wand2 className="h-8 w-8 text-[var(--vzx-accent)]/80" />
              </div>
              <p className="font-medium text-gray-300">
                기획된 내용이 여기에 표시됩니다.
              </p>
              <p className="text-sm mt-1">
                주제와 스타일을 선택하고 생성 버튼을 눌러주세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
