"use client";

import React, { useState } from "react";
import { Download, Plus, Info, Play, Loader2, Sparkles } from "lucide-react";
import { useBlogForm, BlogFormData } from "./BlogFormContext";
import AccordionItem from "./AccordionItem";
import { generateYoutubeGifs } from "@/serverActions/blog/blog-gif.actions";
import Image from "next/image";

const StepGif: React.FC = () => {
  const { formData, updateFormData } = useBlogForm();

  // Local state for UI
  const [youtubeUrl, setYoutubeUrl] = useState(formData.gif.youtubeUrl || "");
  const [videoId, setVideoId] = useState("");
  const [minute, setMinute] = useState("");
  const [second, setSecond] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [testGifs, setTestGifs] = useState<string[]>([]);

  // Initialize from global state if available
  const [startTimes, setStartTimes] = useState<string[]>(
    formData.gif.startTimes || []
  );

  const extractVideoId = (url: string) => {
    // Handle various YouTube URL formats
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2] && match[2].length === 11 ? match[2] : null;
  };

  const handleYoutubeChange = (value: string) => {
    setYoutubeUrl(value);
  };

  const handleLoadVideo = () => {
    const extractedId = extractVideoId(youtubeUrl);

    if (extractedId) {
      setVideoId(extractedId);
      // Only update global state when video is successfully loaded
      updateFormData("gif", (prev: BlogFormData["gif"]) => ({
        ...prev,
        youtubeUrl: youtubeUrl,
      }));
    } else {
      alert(
        "유효한 유튜브 링크를 입력해주세요.\n(예: https://www.youtube.com/watch?v=... 또는 https://youtu.be/...)"
      );
      setVideoId("");
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

  const handleTestExtract = async () => {
    if (!youtubeUrl || startTimes.length === 0) {
      alert("유튜브 링크와 최소 하나 이상의 시작 시간을 추가해주세요.");
      return;
    }

    setIsExtracting(true);
    setTestGifs([]);

    try {
      const result = await generateYoutubeGifs(youtubeUrl, startTimes);
      if (result.success && result.urls) {
        setTestGifs(result.urls);
      } else {
        alert(result.error || "GIF 추출에 실패했습니다.");
      }
    } catch {
      alert("추출 중 오류가 발생했습니다.");
    } finally {
      setIsExtracting(false);
    }
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
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => handleYoutubeChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#33DB98]/50 focus:border-[#33DB98] transition-all text-white placeholder:text-gray-600"
            />
            <button
              onClick={handleLoadVideo}
              className="bg-[#33DB98] hover:bg-[#33DB98]/90 text-black px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap shadow-lg shadow-[#33DB98]/10 transition-all active:scale-95"
            >
              <Download size={16} /> 불러오기
            </button>
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
        </div>

        <div className="pt-2">
          <label className="block text-sm font-bold text-white mb-3">
            시작 시각 선택 - 여러 개
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
                  className="flex items-center justify-between bg-white/5 border border-white/5 px-4 py-3 rounded-xl shadow-sm group hover:border-[#33DB98]/30 transition-all"
                >
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

          <div className="flex flex-col gap-4">
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
            </button>

            {/* Test Results Area */}
            {testGifs.length > 0 && (
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
          </div>

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
