"use client";

import { useState, useEffect } from "react";
import { Plus, History, ChevronRight, Calendar, Video } from "lucide-react";
import { format } from "date-fns";
import { getAIAssistantSessions } from "@/serverActions/ai-assistant/ai-assistant-session.actions";
import type { AIAssistantSessionData } from "@/serverActions/ai-assistant/ai-assistant-session.actions";
import type { Step } from "./types";

interface Step1DashboardProps {
  onStepChange: (step: Step) => void;
}

export function Step1Dashboard({ onStepChange }: Step1DashboardProps) {
  const [sessions, setSessions] = useState<AIAssistantSessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getAIAssistantSessions();
        setSessions(data);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="text-[#33DB98]" /> 작업 기록
          </h2>
          <p className="text-gray-400 mt-1">
            이전 작업 내용을 확인하거나 새로운 프로젝트를 시작하세요.
          </p>
        </div>
        <button
          onClick={() => onStepChange(2)}
          className="px-6 py-3 bg-[#33DB98] text-black rounded-xl font-bold hover:bg-[#33DB98]/90 transition-all flex items-center gap-2 shadow-lg shadow-[#33DB98]/20"
        >
          <Plus size={20} /> 새 프로젝트 시작
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px] text-gray-500">
            로딩 중...
          </div>
        ) : sessions.length > 0 ? (
          <div className="divide-y divide-white/10">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-6 hover:bg-white/5 transition-colors group flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#33DB98]/10 flex items-center justify-center shrink-0">
                    <Video className="text-[#33DB98]" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg mb-1 group-hover:text-[#33DB98] transition-colors">
                      {session.title || session.selectedTitle || session.titleMessage || "제목 없음"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {format(new Date(session.updatedAt), "yyyy.MM.dd")}
                      </span>
                      {session.step && (
                        <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-gray-300">
                          {session.step}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button 
                  className="px-4 py-2 border border-white/10 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:border-[#33DB98]/50 hover:bg-[#33DB98]/5 transition-all flex items-center justify-center gap-2"
                  onClick={() => {
                     // TODO: Resume session logic if needed later
                     // For now, simpler implementation or just view history
                  }}
                >
                  상세 보기 <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <History size={32} className="opacity-50" />
            </div>
            <p>아직 작업 기록이 없습니다.</p>
            <button
              onClick={() => onStepChange(2)}
              className="text-[#33DB98] font-medium hover:underline"
            >
              새로운 프로젝트 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
