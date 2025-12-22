"use client";

import React, { useState, useEffect } from "react";
import { History, FileText, Trash2, X, Clock } from "lucide-react";

export interface HistoryItem {
  id: string;
  timestamp: number;
  title: string;
  content: string;
}

interface HistoryManagerProps {
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

const HistoryManager: React.FC<HistoryManagerProps> = ({
  history,
  onLoad,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Floating Button / Panel - 사이드바보다 오른쪽에 위치 (사이드바 폭 고려) */}
      <div className="flex flex-col items-start gap-2 relative">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-vzx-card px-4 py-3 rounded-full border border-white/10 shadow-lg hover:bg-white/5 transition-all text-white font-bold group backdrop-blur-md text-[14px]"
        >
          <History
            size={20}
            className="text-[#33DB98] group-hover:rotate-180 transition-transform duration-500"
          />
          <span>히스토리</span>
          {mounted && (
            <span className="bg-[#33DB98]/10 text-[#33DB98] text-xs px-2 py-0.5 rounded-full min-w-[24px] text-center border border-[#33DB98]/20">
              {history.length}
            </span>
          )}
        </button>

        {/* Dropdown List */}
        {isOpen && (
          <div className="bg-vzx-card rounded-2xl border border-white/10 shadow-2xl w-80 max-h-[60vh] overflow-hidden flex flex-col animate-accordion-down origin-top-left backdrop-blur-xl absolute top-full mt-2 right-0">
            <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400">
                최근 생성 기록
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-2">
              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">기록이 없습니다</p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="group relative bg-white/5 border border-white/5 hover:border-[#33DB98]/30 rounded-xl p-3 transition-all cursor-pointer hover:bg-white/10"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="pr-6">
                      <h4 className="text-sm font-semibold text-gray-200 line-clamp-1 mb-1">
                        {item.title || "제목 없음"}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock size={10} />
                        {formatDate(item.timestamp)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="삭제"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-vzx-card rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText size={20} className="text-[#33DB98]" />
                  {selectedItem.title}
                </h2>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Clock size={12} />
                  생성일시:{" "}
                  {new Date(selectedItem.timestamp).toLocaleString("ko-KR")}
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-[#0A0A0A]">
              <div className="bg-vzx-card shadow-xl border border-white/5 rounded-2xl p-10 max-w-3xl mx-auto prose prose-invert prose-emerald">
                <div
                  dangerouslySetInnerHTML={{ __html: selectedItem.content }}
                />
              </div>
            </div>

            <div className="p-4 border-t border-white/5 flex justify-end gap-3 bg-vzx-card rounded-b-3xl">
              <button
                onClick={() => handleDelete(selectedItem.id)}
                className="px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={16} /> 삭제하기
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-6 py-2 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  function handleDelete(id: string) {
    if (confirm("정말 삭제하시겠습니까?")) {
      onDelete(id);
      setSelectedItem(null);
    }
  }
};

export default HistoryManager;
