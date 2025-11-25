"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
  Loader2,
  Search,
  Youtube,
  Eye,
  ThumbsUp,
  MessageCircle,
  Calendar,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { analyzeYouTubeChannel } from "@/serverActions/youtube/youtube-channel-analysis.actions";
import Image from "next/image";

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number | null; // null이면 좋아요 수가 숨겨진 것
  isLikeCountHidden?: boolean; // 좋아요 수가 숨겨졌는지 여부
  commentCount: number;
  duration: string;
  channelTitle: string;
}

interface Channel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
}

export function YouTubeChannelAnalyzer() {
  const [channelInput, setChannelInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!channelInput.trim()) {
      toast.error("채널 ID 또는 사용자명을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setChannel(null);
    setVideos([]);

    try {
      console.log(`[Client] 채널 분석 시작:`, channelInput);
      const result = await analyzeYouTubeChannel(channelInput);

      if (result.success && result.channel && result.videos) {
        setChannel(result.channel);
        setVideos(result.videos);
        toast.success(`${result.videos.length}개의 영상을 분석했습니다.`);
      } else {
        setError(result.error || "채널 분석에 실패했습니다.");
        toast.error(result.error || "채널 분석에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("채널 분석 오류:", error);
      const errorMessage = error.message || "채널 분석 중 오류가 발생했습니다.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setChannelInput("");
    setChannel(null);
    setVideos([]);
    setError(null);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="w-full space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Youtube className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold text-slate-900">
            YouTube 채널 분석
          </h3>
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="채널 ID 또는 사용자명 입력 (예: @username 또는 UC...)"
            value={channelInput}
            onChange={(e) => setChannelInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading) {
                handleAnalyze();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || !channelInput.trim()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                분석
              </>
            )}
          </Button>
          {(channel || videos.length > 0) && (
            <Button onClick={handleClear} variant="outline" size="icon">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {channel && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-4">
              {channel.thumbnail && (
                <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={channel.thumbnail}
                    alt={channel.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-slate-900 mb-2">
                  {channel.title}
                </h4>
                {channel.description && (
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {channel.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  {channel.subscriberCount && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>
                        구독자:{" "}
                        {formatNumber(parseInt(channel.subscriberCount))}
                      </span>
                    </div>
                  )}
                  {channel.videoCount && (
                    <div className="flex items-center gap-1">
                      <Youtube className="h-4 w-4" />
                      <span>
                        영상: {formatNumber(parseInt(channel.videoCount))}
                      </span>
                    </div>
                  )}
                  {channel.viewCount && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>
                        조회수: {formatNumber(parseInt(channel.viewCount))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {videos.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-900">
                영상 목록 ({videos.length}개)
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {video.thumbnail && (
                    <div className="relative w-full aspect-video">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h5 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                      {video.title}
                    </h5>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>{formatNumber(video.viewCount)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        <span>
                          {video.likeCount === null || video.isLikeCountHidden
                            ? "숨김"
                            : formatNumber(video.likeCount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        <span>{formatNumber(video.commentCount)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(video.publishedAt)}</span>
                      </div>
                    </div>
                    <a
                      href={`https://www.youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      영상 보기 →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
