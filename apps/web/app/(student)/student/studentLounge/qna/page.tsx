"use client";

import { useEffect, useState } from "react";
import { getPosts, createPost, getPostWithComments } from "@/serverActions/post.actions";
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
import { Textarea } from "@repo/ui/components/textarea";
import { toast } from "sonner";

interface Post {
  id: bigint;
  title: string;
  content: string;
  slug: string;
  createdAt: Date;
  author?: {
    nickname?: string;
    name?: string;
    role?: string;
  };
  comments?: Comment[];
  misc?: any;
  _count?: {
    comments: number;
  };
}

interface Comment {
  id: bigint;
  content: string;
  createdAt: Date;
  author: {
    nickname?: string;
    name?: string;
    role?: string;
  };
}

export default function QnAPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Write Form State
  const [writeTitle, setWriteTitle] = useState("");
  const [writeContent, setWriteContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPosts = async () => {
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
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const handlePostClick = async (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
    
    // Fetch full post details with comments
    try {
      const fullPost = await getPostWithComments(post.id.toString());
      setSelectedPost(fullPost);
    } catch (error) {
      console.error("Failed to load comments:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedPost(null);
    }, 300);
  };

  const handleCloseWriteModal = () => {
    setIsWriteModalOpen(false);
    setWriteTitle("");
    setWriteContent("");
  };

  const handleSubmitQuestion = async () => {
    if (!writeTitle.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    if (!writeContent.trim()) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("title", writeTitle);
      formData.append("content", writeContent);
      formData.append("boardSlug", "qna");
      // tags handling if needed, currently empty
      // formData.append("tags", "");

      await createPost(formData);
      toast.success("질문이 등록되었습니다.");
      handleCloseWriteModal();
      fetchPosts(); // Refresh list
    } catch (error) {
      console.error("질문 등록 실패:", error);
      toast.error("질문 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="flex-1 overflow-y-auto bg-[#fbf4ec] p-4 lg:p-6">
        <div className="text-center py-12 text-stone-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-[#fbf4ec] p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 헤더 */}
          <div className="mb-6">
            <div className="pb-4 border-b border-stone-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-stone-100">
                    <HelpCircle className="w-5 h-5 text-stone-700" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
                      Q&A 게시판
                    </h1>
                    <p className="text-stone-600 text-sm mt-1 hidden sm:block">
                      질문과 답변 공간
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsWriteModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors text-sm font-medium shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden min-[380px]:inline">질문 작성</span>
                </Button>
              </div>
            </div>
          </div>

          {/* 검색 바 */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
            <Input
              placeholder="질문 제목이나 내용 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            />
          </div>

          {/* 질문 목록 */}
          <div className="space-y-6 w-full overflow-hidden">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm w-full overflow-hidden">
              <div className="divide-y divide-stone-100">
                {posts.length === 0 ? (
                  <div className="p-8 text-center text-stone-500">
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
                        className="p-4 sm:p-6 border-l-4 border-l-transparent transition-all duration-200 group cursor-pointer hover:bg-[#fffcf8] hover:shadow-md hover:border-l-orange-300 active:bg-orange-50 active:scale-[0.99]"
                      >
                        <div className="flex flex-col space-y-1">
                          <div className="flex-1 min-w-0">
                            <div className="mb-2">
                              <div className="flex items-center space-x-3 mb-2 flex-wrap">
                                <Badge
                                  variant="outline"
                                  className="bg-stone-100 text-stone-800 text-xs border-stone-200"
                                >
                                  {classTitle}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={
                                    answered
                                      ? "bg-blue-50 text-blue-600 text-xs border-blue-100"
                                      : "bg-orange-50 text-orange-700 text-xs border-orange-100"
                                  }
                                >
                                  <span className="hidden sm:inline">
                                    {answered ? "답변완료" : "미답변"}
                                  </span>
                                  <span className="sm:hidden">
                                    {answered ? "✓" : "?"}
                                  </span>
                                </Badge>
                                <h3 className="text-sm min-[375px]:text-base sm:text-lg font-semibold text-stone-900 line-clamp-1 break-all flex-1 min-w-0 group-hover:text-orange-900 transition-colors">
                                  {post.title}
                                </h3>
                              </div>
                            </div>
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs min-[375px]:text-sm text-stone-600 mb-3 line-clamp-2 break-all overflow-hidden">
                                  {post.content}
                                </p>
                                <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-stone-500">
                                  <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-shrink">
                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-stone-200 flex items-center justify-center">
                                      {post.author?.nickname ||
                                      post.author?.name ? (
                                        <span className="text-xs text-stone-500">
                                          {(
                                            post.author?.nickname ||
                                            post.author?.name ||
                                            ""
                                          ).charAt(0)}
                                        </span>
                                      ) : (
                                        <HelpCircle className="w-4 h-4 text-stone-500" />
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
                                  className="p-2 sm:p-3 text-stone-500 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center"
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
              <div className="hidden sm:block text-sm text-stone-600">
                페이지 {currentPage} / {totalPages}
              </div>
              <div className="sm:hidden text-xs text-stone-500">
                {currentPage}/{totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm border-stone-300 text-stone-700 hover:bg-stone-100"
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
                            ? "bg-stone-800 text-white hover:bg-stone-700"
                            : "border-stone-300 text-stone-700 hover:bg-stone-100"
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
                            ? "bg-stone-800 text-white hover:bg-stone-700"
                            : "border-stone-300 text-stone-700 hover:bg-stone-100"
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
                  className="px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm border-stone-300 text-stone-700 hover:bg-stone-100"
                >
                  다음
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 상세 보기 모달 */}
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
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <DialogTitle className="text-xl font-bold text-stone-900">
                Q&A 상세보기
              </DialogTitle>
            </div>

            {/* 본문 */}
            {selectedPost && (
              <div className="px-6 py-6 bg-[#fbf4ec]">
                {/* 제목과 답변 상태 */}
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-stone-900 flex-1">
                    {selectedPost.title}
                  </h2>
                  {selectedPost.comments && selectedPost.comments.length > 0 && (
                    <Badge className="bg-blue-50 text-blue-600 border-blue-100 ml-3">
                      답변완료
                    </Badge>
                  )}
                </div>

                {/* 작성자와 날짜 */}
                <div className="text-sm text-stone-600 mb-6">
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
                <div className="bg-white rounded-lg p-6 min-h-[200px] mb-6 border border-stone-100 shadow-sm">
                  <div
                    className="text-stone-800 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: selectedPost.content.replace(/\n/g, "<br />"),
                    }}
                  />
                </div>

                {/* 코치 답변 섹션 */}
                {selectedPost.comments && selectedPost.comments.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-stone-900 mb-3">
                      코치 답변
                    </h3>
                    <div className="space-y-3">
                      {selectedPost.comments.map((comment) => (
                        <div
                          key={comment.id.toString()}
                          className="bg-blue-50/50 border border-blue-100 rounded-lg p-4"
                        >
                          <div className="text-sm text-stone-700 whitespace-pre-wrap mb-2">
                            {comment.content}
                          </div>
                          <div className="text-xs text-stone-500">
                            답변일: {kdayjs(comment.createdAt).format("YYYY. MM. DD.")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 닫기 버튼 */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleCloseModal}
                    className="bg-stone-800 text-white hover:bg-stone-700 px-6 transition-all"
                  >
                    닫기
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 질문 작성 모달 */}
      <Dialog
        open={isWriteModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseWriteModal();
          } else {
            setIsWriteModalOpen(true);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <div className="bg-white rounded-lg">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <DialogTitle className="text-xl font-bold text-stone-900">
                새 질문 작성
              </DialogTitle>
            </div>

            {/* 폼 */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">
                  제목 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="질문 제목을 입력하세요"
                  value={writeTitle}
                  onChange={(e) => setWriteTitle(e.target.value)}
                  className="w-full border-stone-300 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">
                  질문 내용
                </label>
                <Textarea
                  placeholder="질문 내용을 상세히 입력하세요..."
                  value={writeContent}
                  onChange={(e) => setWriteContent(e.target.value)}
                  className="w-full min-h-[200px] border-stone-300 focus:ring-orange-500 resize-none p-4"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-stone-100">
                <Button
                  variant="outline"
                  onClick={handleCloseWriteModal}
                  className="border-stone-300 text-stone-700 hover:bg-stone-50"
                  disabled={isSubmitting}
                >
                  취소
                </Button>
                <Button
                  onClick={handleSubmitQuestion}
                  className="bg-stone-800 text-white hover:bg-stone-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "등록 중..." : "질문 등록"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
