"use client";

import { useEffect, useState } from "react";
import { getPosts } from "@/serverActions/post.actions";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import { HelpCircle, Search, Eye, Plus, X } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";

interface Post {
  id: bigint;
  title: string;
  content: string;
  slug: string;
  createdAt: Date;
  author?: {
    nickname?: string;
    name?: string;
  };
  misc?: any;
  _count?: {
    comments: number;
  };
}

export default function QnAPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const result = await getPosts("qna", currentPage, 20);
        setPosts(result.posts);
        setTotalPages(result.pagination.totalPages);
        setTotalCount(result.pagination.totalCount);
      } catch (error) {
        console.error("Q&A 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [currentPage]);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedPost(null);
    }, 300);
  };

  const handleSearch = async () => {
    // 검색 기능은 나중에 구현
    console.log("검색:", searchKeyword);
  };

  // 답변 완료 여부 확인 (misc에서 추출하거나 comments 개수로 판단)
  const isAnswered = (post: Post) => {
    const misc = (post.misc as any) || {};
    if (misc.answered !== undefined) return misc.answered;
    // 댓글이 있으면 답변 완료로 간주
    return (post._count?.comments || 0) > 0;
  };

  // 기수 정보 추출
  const getClassTitle = (post: Post) => {
    const misc = (post.misc as any) || {};
    return misc.class || misc.classTitle || "1기";
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6">
        <div className="text-center py-12 text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 헤더 */}
          <div className="mb-6">
            <div className="pb-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                      Q&A 게시판
                    </h1>
                    <p className="text-slate-600 text-sm mt-1 hidden sm:block">
                      질문과 답변 공간
                    </p>
                  </div>
                </div>
                <Button className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium">
                  <Plus className="w-4 h-4" />
                  <span className="hidden min-[380px]:inline">질문 작성</span>
                </Button>
              </div>
            </div>
          </div>

          {/* 검색 바 */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="질문 제목이나 내용 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 질문 목록 */}
          <div className="space-y-6 w-full overflow-hidden">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full overflow-hidden">
              <div className="divide-y divide-slate-200">
                {posts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    질문이 없습니다.
                  </div>
                ) : (
                  posts.map((post) => {
                    const answered = isAnswered(post);
                    const classTitle = getClassTitle(post);

                    return (
                      <div
                        key={post.id.toString()}
                        onClick={() => handlePostClick(post)}
                        className="p-4 sm:p-6 border-l-4 border-l-transparent transition-all duration-200 group cursor-pointer hover:bg-slate-50 hover:shadow-md hover:border-l-slate-400 active:bg-slate-100 active:scale-[0.99]"
                      >
                        <div className="flex flex-col space-y-1">
                          <div className="flex-1 min-w-0">
                            <div className="mb-2">
                              <div className="flex items-center space-x-3 mb-2 flex-wrap">
                                <Badge
                                  variant="outline"
                                  className="bg-slate-100 text-slate-800 text-xs"
                                >
                                  {classTitle}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={
                                    answered
                                      ? "bg-blue-50 text-blue-600 text-xs"
                                      : "bg-red-100 text-red-700 text-xs"
                                  }
                                >
                                  <span className="hidden sm:inline">
                                    {answered ? "답변완료" : "미답변"}
                                  </span>
                                  <span className="sm:hidden">
                                    {answered ? "✓" : "?"}
                                  </span>
                                </Badge>
                                <h3 className="text-sm min-[375px]:text-base sm:text-lg font-semibold text-slate-900 line-clamp-1 break-all flex-1 min-w-0">
                                  {post.title}
                                </h3>
                              </div>
                            </div>
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs min-[375px]:text-sm text-slate-600 mb-3 line-clamp-2 break-all overflow-hidden">
                                  {post.content}
                                </p>
                                <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-slate-500">
                                  <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-shrink">
                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
                                      {post.author?.nickname ||
                                      post.author?.name ? (
                                        <span className="text-xs text-slate-500">
                                          {(
                                            post.author?.nickname ||
                                            post.author?.name ||
                                            ""
                                          ).charAt(0)}
                                        </span>
                                      ) : (
                                        <HelpCircle className="w-4 h-4 text-slate-500" />
                                      )}
                                    </div>
                                    <span className="truncate max-w-20 sm:max-w-24">
                                      {post.author?.nickname ||
                                        post.author?.name ||
                                        "작성자"}
                                    </span>
                                  </div>
                                  <span className="block sm:hidden flex-shrink-0 text-xs">
                                    {kdayjs(post.createdAt).format("YYYY년 M월 D일")}
                                  </span>
                                  <span className="hidden sm:block flex-shrink-0">
                                    {kdayjs(post.createdAt).format(
                                      "YYYY년 M월 D일 A hh:mm"
                                    )}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-start space-x-1 sm:space-x-2 flex-shrink-0 ml-4">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePostClick(post);
                                  }}
                                  className="p-2 sm:p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center"
                                  title="상세보기"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-6 gap-4">
              <div className="hidden sm:block text-sm text-slate-600">
                페이지 {currentPage} / {totalPages}
              </div>
              <div className="sm:hidden text-xs text-slate-500">
                {currentPage}/{totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm"
                >
                  이전
                </Button>
                <div className="hidden sm:flex items-center gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[40px] ${
                          currentPage === pageNum
                            ? "bg-slate-600 text-white hover:bg-slate-700"
                            : ""
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <div className="sm:hidden flex items-center gap-1">
                  {[...Array(Math.min(3, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[32px] min-h-[32px] px-1.5 py-1.5 text-xs ${
                          currentPage === pageNum
                            ? "bg-slate-600 text-white hover:bg-slate-700"
                            : ""
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm"
                >
                  다음
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 모달 */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseModal();
          } else {
            setIsModalOpen(true);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <div className="bg-white rounded-lg">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <DialogTitle className="text-xl font-bold text-gray-900">
                Q&A 상세보기
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseModal}
                className="h-8 w-8 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* 본문 */}
            {selectedPost && (
              <div className="px-6 py-6 bg-[#fbf4ec]">
                {/* 제목 */}
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {selectedPost.title}
                </h2>

                {/* 작성자와 날짜 */}
                <div className="text-sm text-gray-600 mb-6">
                  <span className="font-medium">
                    작성자:{" "}
                    {selectedPost.author?.nickname ||
                      selectedPost.author?.name ||
                      "작성자"}
                  </span>
                  <span className="mx-2">|</span>
                  <span>
                    작성일:{" "}
                    {kdayjs(selectedPost.createdAt).format(
                      "YYYY년 M월 D일 A hh:mm"
                    )}
                  </span>
                </div>

                {/* 본문 내용 */}
                <div className="bg-white rounded-lg p-6 min-h-[200px] mb-6">
                  <div
                    className="text-gray-800 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: selectedPost.content.replace(/\n/g, "<br />"),
                    }}
                  />
                </div>

                {/* 닫기 버튼 */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleCloseModal}
                    className="bg-gradient-to-r from-[#F2779C] to-[#3BB4C1] text-white hover:opacity-90 px-6 transition-all"
                  >
                    닫기
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

