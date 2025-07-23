"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Search, Filter, RotateCcw } from "lucide-react";

interface Board {
  id: string;
  title: string;
  slug: string;
  _count: {
    posts: number;
  };
}

interface PostsFilterProps {
  boards: Board[];
  currentBoard?: string;
  currentSearch?: string;
  currentPage: number;
}

export function PostsFilter({
  boards,
  currentBoard,
  currentSearch,
  currentPage,
}: PostsFilterProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(currentSearch || "");
  const [selectedBoard, setSelectedBoard] = useState(currentBoard || "all");

  const handleFilter = () => {
    const params = new URLSearchParams();

    if (selectedBoard && selectedBoard !== "all") {
      params.set("board", selectedBoard);
    }

    if (searchInput.trim()) {
      params.set("search", searchInput.trim());
    }

    // 페이지는 1로 리셋
    params.set("page", "1");

    const queryString = params.toString();
    router.push(`/admin/posts${queryString ? `?${queryString}` : ""}`);
  };

  const handleReset = () => {
    setSearchInput("");
    setSelectedBoard("all");
    router.push("/admin/posts");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFilter();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 게시판 선택 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">게시판</label>
          <Select value={selectedBoard} onValueChange={setSelectedBoard}>
            <SelectTrigger>
              <SelectValue placeholder="게시판 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 게시판</SelectItem>
              {boards.map((board) => (
                <SelectItem key={board.slug} value={board.slug}>
                  {board.title} ({board._count.posts}개)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 검색어 입력 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">검색어</label>
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="제목, 내용, 작성자로 검색..."
            className="w-full"
          />
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 opacity-0">
            액션
          </label>
          <div className="flex gap-2">
            <Button onClick={handleFilter} className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              검색
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 현재 필터 상태 표시 */}
      {(currentSearch || (currentBoard && currentBoard !== "all")) && (
        <div className="flex items-center gap-2 text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
          <Filter className="h-4 w-4" />
          <span>현재 필터:</span>

          {currentBoard && currentBoard !== "all" && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              게시판:{" "}
              {boards.find((b) => b.slug === currentBoard)?.title ||
                currentBoard}
            </span>
          )}

          {currentSearch && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
              검색: "{currentSearch}"
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="ml-auto text-blue-600 hover:text-blue-700"
          >
            필터 초기화
          </Button>
        </div>
      )}
    </div>
  );
}
