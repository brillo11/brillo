import { getPost, getBoards } from "@/serverActions/post.actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Separator } from "@repo/ui/components/separator";
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  MessageCircle,
  Heart,
  Edit,
  Trash2,
} from "lucide-react";
import { CommentsSection } from "./components/CommentsSection";
import { PostActions } from "./components/PostActions";

// ISR 적용 - 30분마다 재생성 (댓글이 자주 달리므로 더 짧은 주기)
export const revalidate = 1800;

interface PageProps {
  params: Promise<{
    slug: string;
    postSlug: string;
  }>;
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug, postSlug } = await params;

  try {
    const post = await getPost(postSlug);

    // 게시판 슬러그 검증
    if (post.board.slug !== slug) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href={`/board/${slug}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  목록으로
                </Button>
              </Link>
              <Badge variant="secondary">{post.board.title}</Badge>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {post.title}
              </h1>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">
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
                      {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

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
              </div>

              {/* 태그 */}
              {post.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {post.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8">
              <div
                className="prose prose-gray max-w-none prose-lg"
                dangerouslySetInnerHTML={{
                  __html: post.content.replace(/\n/g, "<br>"),
                }}
              />
            </CardContent>
          </Card>

          {/* 게시글 액션 (수정/삭제) - CSR 컴포넌트 */}
          <PostActions
            postId={post.id.toString()}
            postSlug={post.slug}
            authorId={post.authorId.toString()}
            boardSlug={post.board.slug}
          />

          <Separator className="my-8" />

          {/* 댓글 섹션 - CSR 컴포넌트 */}
          <CommentsSection
            postId={post.id.toString()}
            postSlug={post.slug}
            boardSlug={post.board.slug}
          />

          {/* 개발 모드 디버깅 정보 */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-12 p-4 bg-white rounded-lg shadow text-xs space-y-2">
              <h4 className="font-semibold text-gray-900">
                🔧 개발자 디버깅 정보
              </h4>
              <div className="grid grid-cols-2 gap-4 text-gray-600">
                <div>
                  <p>
                    <strong>렌더링:</strong> ISR + CSR 하이브리드
                  </p>
                  <p>
                    <strong>재생성:</strong> 30분마다 (1800초)
                  </p>
                  <p>
                    <strong>게시글 ID:</strong> {post.id.toString()}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>작성자:</strong>{" "}
                    {post.author.nickname || post.author.name}
                  </p>
                  <p>
                    <strong>조회수:</strong> {post.views}
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
    console.error("게시글 조회 실패:", error);
    notFound();
  }
}
