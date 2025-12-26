"use client";

import React, { useState, useEffect, memo, useRef } from "react";
import {
  FileText,
  Trash2,
  Clock,
  Search,
  Loader2,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Copy,
  X,
} from "lucide-react";
import {
  getBlogPostHistories,
  deleteBlogPostHistory,
} from "@/serverActions/blog/blog-storage.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// 콘텐츠 표시 컴포넌트
const HistoryContentDisplay = memo(({ content }: { content: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
});
HistoryContentDisplay.displayName = "HistoryContentDisplay";

export function BlogHistory() {
  const router = useRouter();
  const [histories, setHistories] = useState<any[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistories();
  }, []);

  const loadHistories = async () => {
    try {
      setIsLoading(true);
      const data = await getBlogPostHistories();
      setHistories(data);
    } catch (error) {
      console.error("Failed to load blog histories:", error);
      toast.error("기록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteBlogPostHistory(id);
      toast.success("삭제되었습니다.");
      if (selectedHistory?.id === id) {
        setSelectedHistory(null);
      }
      loadHistories();
    } catch (error) {
      console.error("Failed to delete history:", error);
      toast.error("삭제에 실패했습니다.");
    }
  };

  const handleCopy = () => {
    if (!contentRef.current) return;

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(contentRef.current);
    selection?.removeAllRanges();
    selection?.addRange(range);

    try {
      document.execCommand("copy");
      toast.success("복사가 완료되었습니다!");
    } catch (err) {
      console.error("복사 실패:", err);
      toast.error("복사 중 오류가 발생했습니다.");
    } finally {
      selection?.removeAllRanges();
    }
  };

  const filteredHistories = histories.filter((h) =>
    h.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  function cleanHtmlContent(html: string, maxLength: number = 3000): string {
    if (!html) return "";
    return html
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "") // 스크립트 제거
      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "") // 스타일 제거
      .replace(/<[^>]*>?/gm, " ") // 태그 제거
      .replace(/\s+/g, " ") // 연속 공백 제거
      .trim()
      .substring(0, maxLength);
  }
  function contentWithoutTitle(fullContent: string, title: string): string {
    return fullContent.replace(title, "");
  }

  // Detail View
  if (selectedHistory) {
    return (
      <div className="flex flex-col min-h-[600px] bg-[#0A0A0A] animate-fade-in rounded-2xl overflow-hidden border border-white/10">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedHistory(null)}
              className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">
                {selectedHistory.title || "제목 없음"}
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <Calendar size={12} />
                <span>
                  {new Date(selectedHistory.createdAt).toLocaleString("ko-KR")}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-[#33DB98]/10 text-[#33DB98] border border-[#33DB98]/20 font-medium text-sm rounded-lg hover:bg-[#33DB98] hover:text-black transition-all"
            >
              <Copy size={16} /> 복사
            </button>
            <button
              onClick={(e) => handleDelete(selectedHistory.id, e)}
              className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 font-medium text-sm rounded-lg hover:bg-red-500 hover:text-white transition-all"
            >
              삭제
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-gray-100/5">
          <div
            ref={contentRef}
            className="bg-white shadow-xl border border-gray-200 rounded-2xl p-8 md:p-12 max-w-3xl mx-auto prose prose-slate"
          >
            <HistoryContentDisplay content={selectedHistory.content} />
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="flex flex-col min-h-[600px] p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">블로그 작업 기록</h2>
          <p className="text-gray-400 mt-1">
            작성한 블로그 포스트를 확인하고 관리하세요.
          </p>
        </div>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            type="text"
            placeholder="제목 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#33DB98] w-64 transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#33DB98]" size={40} />
        </div>
      ) : filteredHistories.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-500 bg-white/5 border border-dashed border-white/10 rounded-2xl">
          <FileText size={48} className="mb-4 opacity-20" />
          <p>저장된 블로그 기록이 없습니다.</p>
          <button
            onClick={() => router.push("/service/personal-branding/blog")}
            className="mt-4 px-6 py-2.5 bg-[#33DB98] text-black rounded-xl font-bold hover:bg-[#33DB98]/90 transition-all"
          >
            새 글 작성하러 가기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHistories.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedHistory(item)}
              className="group relative bg-[#1c1c1c] rounded-2xl border border-white/5 p-5 cursor-pointer hover:border-[#33DB98]/30 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-[#33DB98]/10 rounded-lg text-[#33DB98]">
                  <FileText size={20} />
                </div>
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-1.5 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="font-bold text-gray-200 mb-2 line-clamp-2 min-h-[3rem] group-hover:text-white transition-colors">
                {item.title || "제목 없음"}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                {contentWithoutTitle(
                  cleanHtmlContent(item.content, 300),
                  item.title,
                )}
                ...
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 pt-4 border-t border-white/5">
                <Clock size={12} />
                <span>
                  {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                </span>
                <span className="ml-auto flex items-center text-[#33DB98] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  자세히 보기 <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
