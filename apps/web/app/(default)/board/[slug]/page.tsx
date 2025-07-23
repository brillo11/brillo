import { getPosts, getBoards } from "@/serverActions/post.actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import {
  PlusCircle,
  MessageCircle,
  Heart,
  Eye,
  Calendar,
  User,
} from "lucide-react";

// ISR 적용 - 1시간마다 재생성
export const revalidate = 3600;

interface PageProps {
  params: Promise<{
    slug: string;
    page?: string;
  }>;
}

export default async function BoardPage({ params }: PageProps) {
  const { slug, page } = await params;
  const pageNumber = parseInt(page || "1");

  try {
    const { posts, pagination } = await getPosts(slug, pageNumber, 15);
    const boards = await getBoards();

    // 현재 게시판 정보
    const currentBoard = boards.find((board) => board.slug === slug);

    if (!currentBoard) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {currentBoard.title}
                </h1>
                <p className="text-gray-600 mt-1">
                  총 {pagination.totalCount}개의 게시글
                </p>
              </div>

              <Link href={`/board/${slug}/write`}>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  글쓰기
                </Button>
              </Link>
            </div>

            {/* 게시판 네비게이션 */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {boards.map((board) => (
                <Link key={board.id.toString()} href={`/board/${board.slug}`}>
                  <Badge
                    variant={board.slug === slug ? "default" : "outline"}
                    className="whitespace-nowrap hover:bg-blue-100 transition-colors"
                  >
                    {board.title} ({board._count.posts})
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 게시글 목록 */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500 text-lg">
                    아직 게시글이 없습니다.
                  </p>
                  <p className="text-gray-400 mt-2">
                    첫 번째 글을 작성해보세요!
                  </p>
                  <Link
                    href={`/board/${slug}/write`}
                    className="inline-block mt-4"
                  >
                    <Button>글쓰기</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card
                  key={post.id.toString()}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link
                          href={`/board/${slug}/${post.slug}`}
                          className="hover:underline"
                        >
                          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                            {post.title}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>
                              {post.author.nickname || post.author.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(post.createdAt).toLocaleDateString(
                                "ko-KR"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post._count.comments}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{post._count.likes}</span>
                        </div>
                      </div>
                    </div>

                    {/* 태그 */}
                    {post.tags.length > 0 && (
                      <div className="flex gap-1 mt-3 flex-wrap">
                        {post.tags
                          .slice(0, 3)
                          .map((tag: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        {post.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardHeader>
                </Card>
              ))
            )}
          </div>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              {pagination.hasPrev && (
                <Link
                  href={`/board/${slug}?page=${pagination.currentPage - 1}`}
                >
                  <Button variant="outline">이전</Button>
                </Link>
              )}

              <div className="flex gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                    if (pageNum > pagination.totalPages) return null;

                    return (
                      <Link
                        key={pageNum}
                        href={`/board/${slug}?page=${pageNum}`}
                      >
                        <Button
                          variant={
                            pageNum === pagination.currentPage
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                        >
                          {pageNum}
                        </Button>
                      </Link>
                    );
                  }
                )}
              </div>

              {pagination.hasNext && (
                <Link
                  href={`/board/${slug}?page=${pagination.currentPage + 1}`}
                >
                  <Button variant="outline">다음</Button>
                </Link>
              )}
            </div>
          )}

          {/* 개발 모드 디버깅 정보 */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-12 p-4 bg-white rounded-lg shadow text-xs space-y-2">
              <h4 className="font-semibold text-gray-900">
                🔧 개발자 디버깅 정보
              </h4>
              <div className="grid grid-cols-2 gap-4 text-gray-600">
                <div>
                  <p>
                    <strong>렌더링:</strong> ISR (Incremental Static
                    Regeneration)
                  </p>
                  <p>
                    <strong>재생성:</strong> 1시간마다 (3600초)
                  </p>
                  <p>
                    <strong>페이지:</strong> {pagination.currentPage}/
                    {pagination.totalPages}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>게시판:</strong> {currentBoard.title}
                  </p>
                  <p>
                    <strong>게시글 수:</strong> {pagination.totalCount}개
                  </p>
                  <p>
                    <strong>생성 시간:</strong> {new Date().toISOString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("게시글 목록 조회 실패:", error);
    notFound();
  }
}

// 정적 파라미터 생성 (빌드 시 미리 생성할 페이지들)
export async function generateStaticParams() {
  try {
    const boards = await getBoards();
    return boards.map((board) => ({
      slug: board.slug,
    }));
  } catch (error) {
    console.error("정적 파라미터 생성 실패:", error);
    return [];
  }
}
