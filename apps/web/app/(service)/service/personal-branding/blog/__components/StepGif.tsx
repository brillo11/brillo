"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Plus,
  Info,
  Loader2,
  Bug,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useBlogForm, BlogFormData } from "./BlogFormContext";
import AccordionItem from "./AccordionItem";
import { getYouTubeVideoMetadata } from "@/serverActions/youtube/youtube-metadata.actions";
import { getYouTubeTranscript } from "@/serverActions/youtube/youtube-transcript.actions";

/**
 * MM:SS 형식을 초 단위로 변환
 */
function timeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":");
  if (parts.length === 2) {
    return parseInt(parts[0] || "0") * 60 + parseInt(parts[1] || "0");
  }
  return parseInt(timeStr) || 0;
}

const StepGif: React.FC = () => {
  const { formData, updateFormData } = useBlogForm();

  // Local state for UI
  const [youtubeUrl, setYoutubeUrl] = useState(formData.gif.youtubeUrl || "");
  const [videoId, setVideoId] = useState("");
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [minute, setMinute] = useState("");
  const [second, setSecond] = useState("");
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [transcript, setTranscript] = useState<
    { text: string; start: number }[]
  >([]);
  const [showDebug, setShowDebug] = useState(false);

  // Initialize from global state if available
  const [startTimes, setStartTimes] = useState<string[]>(
    formData.gif.startTimes || [],
  );

  // Sync local states when formData changes (e.g., when loading a template)
  useEffect(() => {
    // 외부(템플릿 등)에서 URL이 변경된 경우에만 로컬 상태와 videoId를 업데이트
    if (formData.gif.youtubeUrl !== youtubeUrl) {
      const url = formData.gif.youtubeUrl || "";
      setYoutubeUrl(url);

      const extractedId = extractVideoId(url);
      if (extractedId) {
        setVideoId(extractedId);
        // URL이 변경되면 자막 데이터 초기화
        setTranscript([]);
      } else {
        setVideoId("");
        setTranscript([]);
      }
    }
    setStartTimes(formData.gif.startTimes || []);
  }, [formData.gif.youtubeUrl, formData.gif.startTimes, youtubeUrl]);

  // 컴포넌트 마운트 시 또는 videoId가 있는데 자막이 없는 경우 자막 가져오기
  useEffect(() => {
    if (videoId && transcript.length === 0 && !isLoadingTranscript) {
      const fetchTranscriptOnMount = async () => {
        setIsLoadingTranscript(true);
        try {
          const transcriptResult = await getYouTubeTranscript(youtubeUrl);
          if (transcriptResult.success && transcriptResult.transcript) {
            setTranscript(transcriptResult.transcript);
          }
        } catch (err) {
          console.error("Failed to fetch transcript on mount:", err);
        } finally {
          setIsLoadingTranscript(false);
        }
      };
      fetchTranscriptOnMount();
    }
  }, [videoId, youtubeUrl]); // transcript.length와 isLoadingTranscript는 의존성에서 제외하여 무한 루프 방지

  const extractVideoId = (url: string) => {
    // Handle various YouTube URL formats
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2] && match[2].length === 11 ? match[2] : null;
  };

  const handleYoutubeChange = (value: string) => {
    setYoutubeUrl(value);
    // 입력 중에도 전역 상태에 반영하여 템플릿 저장 시 누락되지 않도록 함
    updateFormData("gif", (prev: BlogFormData["gif"]) => ({
      ...prev,
      youtubeUrl: value,
    }));
  };

  const handleLoadVideo = async () => {
    const extractedId = extractVideoId(youtubeUrl);

    if (extractedId) {
      setVideoId(extractedId);
      setIsLoadingMetadata(true);
      setVideoDuration(null);

      try {
        const metadata = await getYouTubeVideoMetadata(youtubeUrl);
        if (metadata.success && metadata.durationSeconds) {
          setVideoDuration(metadata.durationSeconds);
        }

        // 자막 데이터도 함께 불러오기
        setIsLoadingTranscript(true);
        const transcriptResult = await getYouTubeTranscript(youtubeUrl);
        if (transcriptResult.success && transcriptResult.transcript) {
          setTranscript(transcriptResult.transcript);
        } else {
          setTranscript([]);
          console.warn("Failed to load transcript:", transcriptResult.error);
        }
      } catch (err) {
        console.error("Failed to load metadata/transcript:", err);
      } finally {
        setIsLoadingMetadata(false);
        setIsLoadingTranscript(false);
      }

      // Only update global state when video is successfully loaded
      updateFormData("gif", (prev: BlogFormData["gif"]) => ({
        ...prev,
        youtubeUrl: youtubeUrl,
      }));
    } else {
      alert(
        "유효한 유튜브 링크를 입력해주세요.\n(예: https://www.youtube.com/watch?v=... 또는 https://youtu.be/...)",
      );
      setVideoId("");
      setVideoDuration(null);
      setTranscript([]);
    }
  };

  const handleAddTime = () => {
    if (!minute && !second) return;

    const m = minute ? parseInt(minute) : 0;
    const s = second ? parseInt(second) : 0;

    if (isNaN(m) || isNaN(s)) {
      alert("숫자만 입력해주세요.");
      return;
    }

    const totalSeconds = m * 60 + s;

    // 영상 길이보다 큰 시간 입력 시 차단
    if (videoDuration !== null && totalSeconds >= videoDuration) {
      const durationMin = Math.floor(videoDuration / 60);
      const durationSec = videoDuration % 60;
      alert(
        `시작 시간이 영상 길이(${durationMin}분 ${durationSec}초)를 초과할 수 없습니다.`,
      );
      return;
    }

    // 최소 5초 확보 필요 (GIF가 5초 길이이므로)
    if (videoDuration !== null && totalSeconds + 5 > videoDuration) {
      alert("영상 끝부분이 5초 미만으로 남아 GIF를 생성할 수 없습니다.");
      return;
    }

    const formattedTime = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

    if (startTimes.includes(formattedTime)) {
      alert("이미 추가된 시간입니다.");
      return;
    }

    const newTimes = [...startTimes, formattedTime].sort();
    setStartTimes(newTimes);
    updateFormData("gif", (prev: BlogFormData["gif"]) => ({
      ...prev,
      startTimes: newTimes,
    }));

    // Reset inputs
    setMinute("");
    setSecond("");
  };

  const handleRemoveTime = (index: number) => {
    const newTimes = startTimes.filter((_, i) => i !== index);
    setStartTimes(newTimes);
    updateFormData("gif", (prev: BlogFormData["gif"]) => ({
      ...prev,
      startTimes: newTimes,
    }));
  };

  // 특정 시간대의 자막 추출
  const getContextForTime = (timeStr: string) => {
    const startSec = timeToSeconds(timeStr);
    const endSec = startSec + 5;

    return transcript
      .filter((item) => item.start >= startSec && item.start <= endSec)
      .map((item) => item.text)
      .join(" ")
      .trim();
  };

  return (
    <AccordionItem title="4단계: 유튜브 GIF 만들기 (선택)" defaultOpen={false}>
      <div className="space-y-5">
        <p className="text-sm text-gray-400 leading-relaxed">
          유튜브 링크와 시작 시간을 선택하면 해당 시점부터 5초 구간을 720p GIF로
          만들어 글 상단에 자동 삽입합니다.
        </p>

        <div>
          <label className="block text-sm font-bold text-white mb-3">
            유튜브 링크
          </label>
          <div className="flex gap-1 mb-4 w-full">
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => handleYoutubeChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#33DB98]/50 focus:border-[#33DB98] transition-all text-white placeholder:text-gray-600 min-w-0"
            />
            <button
              onClick={handleLoadVideo}
              disabled={isLoadingMetadata}
              className="bg-[#33DB98] hover:bg-[#33DB98]/90 disabled:bg-gray-600 text-black px-3 py-3 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap shadow-lg shadow-[#33DB98]/10 transition-all active:scale-95"
            >
              {isLoadingMetadata ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              불러오기
            </button>
          </div>
          <div className="flex justify-between items-center px-1">
            <p className="text-xs text-gray-500 leading-relaxed -mt-2 break-all">
              예시) https://youtu.be/fe6_wCixJwE
            </p>
          </div>

          {videoId && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video shadow-2xl">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
          {videoDuration !== null && (
            <p className="text-xs text-[#33DB98] mt-2 font-bold">
              영상 길이: {Math.floor(videoDuration / 60)}분 {videoDuration % 60}
              초
            </p>
          )}
        </div>

        <div className="pt-2">
          <label className="block text-sm font-bold text-white mb-3">
            시작 시각 추가
          </label>

          {/* Time Input Row */}
          <div className="flex items-center gap-2 mb-5">
            <input
              type="number"
              min="0"
              max="59"
              placeholder="00"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              className="w-16 px-2 py-3 bg-white/5 border border-white/10 rounded-xl text-center text-sm focus:ring-2 focus:ring-[#33DB98] outline-none text-white transition-all"
            />
            <span className="text-gray-500 font-bold">:</span>
            <input
              type="number"
              min="0"
              max="59"
              placeholder="00"
              value={second}
              onChange={(e) => setSecond(e.target.value)}
              className="w-16 px-2 py-3 bg-white/5 border border-white/10 rounded-xl text-center text-sm focus:ring-2 focus:ring-[#33DB98] outline-none text-white transition-all"
            />
            <button
              onClick={handleAddTime}
              className="ml-2 bg-[#33DB98]/10 text-[#33DB98] hover:bg-[#33DB98]/20 px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all border border-[#33DB98]/20 active:scale-95"
            >
              <Plus size={16} /> 추가
            </button>
          </div>

          {/* Time List */}
          {startTimes.length > 0 ? (
            <div className="space-y-2 mb-5">
              {startTimes.map((time, index) => (
                <div
                  key={index}
                  className="flex flex-col bg-white/5 border border-white/5 rounded-xl shadow-sm group hover:border-[#33DB98]/30 transition-all overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-4">
                      <span className="bg-[#33DB98]/10 text-[#33DB98] px-2 py-1 rounded-lg text-xs font-bold w-6 h-6 flex items-center justify-center border border-[#33DB98]/20">
                        {index + 1}
                      </span>
                      <span className="font-mono text-gray-200 font-bold text-base">
                        {time}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        ~{" "}
                        {(() => {
                          const parts = time.split(":").map(Number);
                          const m = parts[0] || 0;
                          const s = parts[1] || 0;
                          const totalSeconds = m * 60 + s + 5;
                          const endM = Math.floor(totalSeconds / 60);
                          const endS = totalSeconds % 60;
                          return `${String(endM).padStart(2, "0")}:${String(endS).padStart(2, "0")}`;
                        })()}{" "}
                        (5초)
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveTime(index)}
                      className="text-gray-600 hover:text-red-400 p-2 rounded-xl hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Plus size={18} className="rotate-45" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/5 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-gray-500 gap-3 mb-4">
              <div className="p-3 bg-white/5 rounded-full">
                <Info size={24} />
              </div>
              <span className="text-sm font-medium">
                시간을 입력하고 추가 버튼을 눌러주세요
              </span>
            </div>
          )}

          {/* Debug Area: Transcript Context */}
          {/* {startTimes.length > 0 && (
            <div className="mt-6 border border-[#33DB98]/20 rounded-2xl overflow-hidden bg-[#33DB98]/5">
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#33DB98]/10 hover:bg-[#33DB98]/20 transition-all group"
              >
                <div className="flex items-center gap-2 text-[#33DB98] text-xs font-bold uppercase tracking-wider">
                  <Bug size={14} /> 디버그: 추출될 자막 맥락 확인
                </div>
                {showDebug ? (
                  <ChevronUp size={16} className="text-[#33DB98]" />
                ) : (
                  <ChevronDown size={16} className="text-[#33DB98]" />
                )}
              </button>

              {showDebug && (
                <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                  {isLoadingTranscript ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <Loader2
                        size={24}
                        className="text-[#33DB98] animate-spin"
                      />
                      <p className="text-xs text-gray-400">
                        자막 데이터를 불러오는 중입니다...
                      </p>
                    </div>
                  ) : transcript.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-xs text-red-400/70 italic">
                        이 비디오에서 추출된 한국어 자막이 없습니다.
                      </p>
                      <button
                        onClick={handleLoadVideo}
                        className="mt-2 text-[10px] text-[#33DB98] underline underline-offset-2 hover:text-[#33DB98]/80"
                      >
                        자막 다시 불러오기
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[11px] text-[#33DB98]/70 font-medium leading-relaxed">
                        * 아래 텍스트는 AI가 글을 쓸 때 각 GIF의 맥락으로
                        참고하게 될 자막 내용입니다. (구간별 5초 추출)
                      </p>
                      {startTimes.map((time, idx) => {
                        const context = getContextForTime(time);
                        return (
                          <div
                            key={idx}
                            className="bg-black/20 rounded-xl p-3 border border-white/5"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-bold text-[#33DB98] bg-[#33DB98]/10 px-1.5 py-0.5 rounded">
                                GIF {idx + 1}
                              </span>
                              <span className="text-[10px] font-mono text-gray-500">
                                {time} ~{" "}
                              </span>
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed italic">
                              {context || "해당 구간에 추출된 자막이 없습니다."}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )} */}

          {/* <div className="flex flex-col gap-4">
            <button
              onClick={handleTestExtract}
              disabled={isExtracting || startTimes.length === 0}
              className="w-full bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 rounded-xl py-4 flex items-center justify-center gap-2 text-sm font-bold text-gray-300 transition-all active:scale-[0.98]"
            >
              {isExtracting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  GIF 생성 중... (약 10-20초 소요)
                </>
              ) : (
                <>
                  <Play size={18} className="text-[#33DB98]" />
                  GIF 추출 테스트하기
                </>
              )}
            </button> */}

          {/* Test Results Area */}
          {/* {testGifs.length > 0 && (
              <div className="p-4 bg-black/40 border border-[#33DB98]/30 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-[#33DB98] text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={14} /> 추출 결과 미리보기
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {testGifs.map((url, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/50">
                        <Image
                          src={url}
                          alt={`Test GIF ${idx + 1}`}
                          fill
                          unoptimized
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded-md text-[10px] font-bold text-white border border-white/10">
                          {idx + 1}번 GIF
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-1">
                        <input
                          readOnly
                          value={url}
                          className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-[10px] text-gray-500 outline-none"
                        />
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400"
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div> */}

          <div className="flex items-start gap-2 mt-4 p-3 bg-white/5 rounded-xl border border-white/5">
            <Info size={14} className="mt-0.5 shrink-0 text-[#33DB98]" />
            <span className="text-[11px] text-gray-500 leading-relaxed font-medium">
              입력한 시간부터 5초 길이로 GIF가 생성됩니다. 파일 용량을 고려해
              프레임 최적화가 적용됩니다.
            </span>
          </div>
        </div>
      </div>
    </AccordionItem>
  );
};

export default StepGif;
