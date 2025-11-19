"use client";

import { useEffect, useState } from "react";
import { getPosts } from "@/serverActions/post.actions";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import { Megaphone, X } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";

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
}

export default function AnnouncementsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { posts: fetchedPosts } = await getPosts("notice", 1, 20);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("공지사항 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // 애니메이션이 끝난 후 데이터 초기화 (300ms 지연)
    setTimeout(() => {
      setSelectedPost(null);
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf4ec] py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12 text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#fbf4ec] py-8">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          {/* 헤더 */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              {/* <Megaphone className="h-8 w-8 text-[#E53935]" /> */}
              <h1 className="text-3xl font-bold text-gray-900">공지사항</h1>
            </div>
            <p className="text-gray-600">중요한 공지사항을 확인하세요</p>
          </div>

          {/* 포스트 목록 */}
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                공지사항이 없습니다.
              </div>
            ) : (
              posts.map((post) => {
                // misc에서 기수 정보 추출 (예: { class: "1기" })
                const misc = (post.misc as any) || {};
                const classTitle = misc.class || misc.classTitle || "";

                // content에서 상품 리스트 파싱 (간단한 예시)
                // 실제로는 content가 마크다운이나 HTML일 수 있음
                const content = post.content || "";

                return (
                  <div
                    key={post.id.toString()}
                    onClick={() => handlePostClick(post)}
                    className="block cursor-pointer"
                  >
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      {/* 제목과 기수 배지 */}
                      <div className="flex items-start justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex-1">
                          {post.title}
                        </h2>
                        {classTitle && (
                          <Badge
                            variant="outline"
                            className="ml-3 bg-gray-100 text-gray-700"
                          >
                            {classTitle}
                          </Badge>
                        )}
                      </div>

                      {/* 상품 리스트 미리보기 (content의 일부만 표시) */}
                      {content && (
                        <div className="mb-4 text-sm text-gray-600 line-clamp-3">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: content
                                .replace(/\n/g, "<br />")
                                .substring(0, 200),
                            }}
                          />
                          {content.length > 200 && "..."}
                        </div>
                      )}

                      {/* 작성자와 날짜 */}
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {post.author?.nickname ||
                              post.author?.name ||
                              "작성자"}
                          </span>
                        </div>
                        <div>
                          {kdayjs(post.createdAt).format(
                            "YYYY년 M월 D일 A hh:mm"
                          )}
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
                공지사항 상세보기
              </DialogTitle>
              {/* <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseModal}
                className="h-8 w-8 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button> */}
            </div>

            {/* 본문 */}
            {selectedPost && (
              <div className="px-6 py-6">
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
                <div className="bg-slate-50 rounded-lg p-6 min-h-[200px] mb-6">
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
