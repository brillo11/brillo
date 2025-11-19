import { requireAdmin } from "@/shared/lib/auth-guards";
import { getAdminPosts, getBoards } from "@/serverActions/post.actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import {
  FileText,
  MessageCircle,
  Heart,
  Eye,
  Calendar,
  User,
  Edit,
  Trash2,
  Filter,
  Search,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { AdminPostActions } from "./components/AdminPostActions";
import { PostsFilter } from "./components/PostsFilter";

// SSR + Dynamic - 항상 최신 데이터
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    board?: string;
    search?: string;
  }>;
}

export default async function AdminPostsPage({ searchParams }: PageProps) {
  // 🛡️ 관리자 권한 확인
  const session = await requireAdmin();

  // searchParams를 await로 처리
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const boardFilter = params.board;
  const searchQuery = params.search;

  // 서버에서 데이터 페칭
  const [postsData, boards] = await Promise.all([
    getAdminPosts(page, 20),
    getBoards(),
  ]);

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">게시글 관리</h1>
          </div>
          <p className="text-gray-600 mt-2">
            전체 게시글을 관리하고 모니터링합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText className="h-4 w-4" />
          <span>총 {postsData.pagination.totalCount}개 게시글</span>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            필터 및 검색
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PostsFilter
            boards={boards}
            currentBoard={boardFilter}
            currentSearch={searchQuery}
            currentPage={page}
          />
        </CardContent>
      </Card>

      {/* 게시글 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>게시글 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {postsData.posts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 text-lg">게시글이 없습니다.</p>
              <p className="text-gray-400 mt-2">
                아직 작성된 게시글이 없거나 필터 조건에 맞는 게시글이 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {postsData.posts.map((post) => (
                <div
                  key={post.id.toString()}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* 게시글 제목 및 게시판 */}
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{post.board.title}</Badge>
                        <Link
                          href={`/board/${post.board.slug}/${post.slug}`}
                          className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
                          target="_blank"
                        >
                          {post.title}
                          <ExternalLink className="h-3 w-3 inline ml-1" />
                        </Link>
                      </div>

                      {/* 작성자 정보 */}
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>
                            {post.author.nickname || post.author.name}
                          </span>
                          {post.author.role === "ADMIN" && (
                            <Badge variant="destructive" className="text-xs">
                              관리자
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(post.createdAt).toLocaleDateString(
                              "ko-KR",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>

                      {/* 게시글 통계 */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
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

                      {/* 태그 */}
                      {post.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
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
                    </div>

                    {/* 관리 액션 */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Link
                        href={`/board/${post.board.slug}/${post.slug}/edit`}
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="h-3 w-3 mr-1" />
                          수정
                        </Button>
                      </Link>

                      <AdminPostActions
                        postId={post.id.toString()}
                        postSlug={post.slug}
                        postTitle={post.title}
                        boardSlug={post.board.slug}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {postsData.pagination.totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex justify-center items-center gap-2">
              {postsData.pagination.hasPrev && (
                <Link
                  href={`/admin/posts?page=${postsData.pagination.currentPage - 1}${boardFilter ? `&board=${boardFilter}` : ""}${searchQuery ? `&search=${searchQuery}` : ""}`}
                >
                  <Button variant="outline" size="sm">
                    이전
                  </Button>
                </Link>
              )}

              <div className="flex gap-1">
                {Array.from(
                  { length: Math.min(5, postsData.pagination.totalPages) },
                  (_, i) => {
                    const pageNum =
                      Math.max(1, postsData.pagination.currentPage - 2) + i;
                    if (pageNum > postsData.pagination.totalPages) return null;

                    return (
                      <Link
                        key={pageNum}
                        href={`/admin/posts?page=${pageNum}${boardFilter ? `&board=${boardFilter}` : ""}${searchQuery ? `&search=${searchQuery}` : ""}`}
                      >
                        <Button
                          variant={
                            pageNum === postsData.pagination.currentPage
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

              {postsData.pagination.hasNext && (
                <Link
                  href={`/admin/posts?page=${postsData.pagination.currentPage + 1}${boardFilter ? `&board=${boardFilter}` : ""}${searchQuery ? `&search=${searchQuery}` : ""}`}
                >
                  <Button variant="outline" size="sm">
                    다음
                  </Button>
                </Link>
              )}
            </div>

            <div className="text-center mt-4 text-sm text-gray-600">
              {postsData.pagination.currentPage} /{" "}
              {postsData.pagination.totalPages} 페이지 (총{" "}
              {postsData.pagination.totalCount}개)
            </div>
          </CardContent>
        </Card>
      )}

      {/* 개발 모드 디버깅 정보 */}
      {process.env.NODE_ENV === "development" && (
        <div className="p-4 bg-white rounded-lg shadow text-xs space-y-2">
          <h4 className="font-semibold text-gray-900">🔧 개발자 디버깅 정보</h4>
          <div className="grid grid-cols-2 gap-4 text-gray-600">
            <div>
              <p>
                <strong>렌더링:</strong> SSR + Dynamic (Server-Side Rendering)
              </p>
              <p>
                <strong>권한:</strong> {session.user?.role} (관리자)
              </p>
              <p>
                <strong>페이지:</strong> {postsData.pagination.currentPage}/
                {postsData.pagination.totalPages}
              </p>
            </div>
            <div>
              <p>
                <strong>총 게시글:</strong> {postsData.pagination.totalCount}개
              </p>
              <p>
                <strong>필터:</strong> {boardFilter || "전체"} 게시판
              </p>
              <p>
                <strong>생성 시간:</strong> {new Date().toISOString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
