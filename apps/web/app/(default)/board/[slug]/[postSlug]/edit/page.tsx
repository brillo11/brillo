"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { Badge } from "@repo/ui/components/badge";
import { Separator } from "@repo/ui/components/separator";
import { ArrowLeft, Save, Loader2, Tag, FileText, X, Edit } from "lucide-react";
import Link from "next/link";
import { getPost, updatePost } from "@/serverActions/post.actions";
import { toast } from "sonner";

interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  tags: string[];
  authorId: string;
  author: {
    id: string;
    nickname?: string;
    name: string;
    role: string;
  };
  board: {
    title: string;
    slug: string;
  };
}

export default function EditPostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const boardSlug = params.slug as string;
  const postSlug = params.postSlug as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 폼 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // 권한 및 초기 데이터 로딩
  useEffect(() => {
    const initializePage = async () => {
      // 로그인 확인
      if (status === "unauthenticated") {
        router.push("/admin/login");
        return;
      }

      if (status === "loading") {
        return;
      }

      try {
        const postData = await getPost(postSlug);

        // 게시판 확인
        if (postData.board.slug !== boardSlug) {
          toast.error("잘못된 접근입니다.");
          router.push(`/board/${boardSlug}`);
          return;
        }

        // 권한 확인 (작성자 또는 관리자만)
        const canEdit =
          session &&
          (session.user.id === postData.authorId.toString() ||
            session.user.role === "ADMIN");

        if (!canEdit) {
          toast.error("게시글을 수정할 권한이 없습니다.");
          router.push(`/board/${boardSlug}/${postSlug}`);
          return;
        }

        setPost(postData);
        setTitle(postData.title);
        setContent(postData.content);
        setTags(postData.tags);
      } catch (error) {
        console.error("게시글 로딩 실패:", error);
        toast.error("게시글을 불러오는데 실패했습니다.");
        router.push(`/board/${boardSlug}`);
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [status, boardSlug, postSlug, router, session]);

  // 태그 추가
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();

      if (tags.length >= 5) {
        toast.error("태그는 최대 5개까지 추가할 수 있습니다.");
        return;
      }

      if (tags.includes(newTag)) {
        toast.error("이미 추가된 태그입니다.");
        return;
      }

      setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  // 태그 제거
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // 게시글 수정 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session || !post) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      formData.append("tags", tags.join(","));

      await updatePost(postSlug, formData);

      // updatePost에서 redirect를 처리하므로 여기서는 성공 메시지만
      toast.success("게시글이 수정되었습니다!");
    } catch (error) {
      console.error("게시글 수정 실패:", error);
      toast.error(
        error instanceof Error ? error.message : "게시글 수정에 실패했습니다."
      );
      setSubmitting(false);
    }
  };

  // 로딩 중
  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // 로그인 필요
  if (!session || !post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/board/${boardSlug}/${postSlug}`}>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                돌아가기
              </Button>
            </Link>
            <Badge variant="secondary">{post.board.title}</Badge>
          </div>

          <div className="flex items-center gap-3">
            <Edit className="h-6 w-6 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">게시글 수정</h1>
          </div>

          <p className="text-gray-600 mt-2">
            "{post.title}" 게시글을 수정합니다.
          </p>
        </div>
      </div>

      {/* 수정 폼 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                게시글 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 제목 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  제목 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="게시글 제목을 입력하세요"
                  className="w-full"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500">{title.length}/100자</p>
              </div>

              {/* 태그 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  태그 (선택사항)
                </label>

                {/* 기존 태그들 */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* 태그 입력 */}
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="태그를 입력하고 Enter를 누르세요 (최대 5개)"
                  className="w-full"
                  maxLength={20}
                  disabled={tags.length >= 5}
                />
                <p className="text-xs text-gray-500">
                  태그는 최대 5개까지 추가할 수 있습니다. ({tags.length}/5)
                </p>
              </div>

              <Separator />

              {/* 내용 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  내용 <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="게시글 내용을 입력하세요"
                  className="min-h-[400px] w-full resize-none"
                />
                <p className="text-xs text-gray-500">{content.length}자</p>
              </div>

              {/* 작성자 정보 (읽기 전용) */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  작성자 정보
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{post.author.nickname || post.author.name}</span>
                  {post.author.role === "ADMIN" && (
                    <Badge variant="destructive" className="text-xs">
                      관리자
                    </Badge>
                  )}
                  {session.user.role === "ADMIN" &&
                    session.user.id !== post.authorId.toString() && (
                      <Badge variant="outline" className="text-xs">
                        관리자 권한으로 수정
                      </Badge>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 수정 버튼 */}
          <div className="flex justify-end gap-3">
            <Link href={`/board/${boardSlug}/${postSlug}`}>
              <Button variant="outline" type="button" disabled={submitting}>
                취소
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  수정 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  게시글 수정
                </>
              )}
            </Button>
          </div>
        </form>

        {/* 개발 모드 디버깅 정보 */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-12 p-4 bg-white rounded-lg shadow text-xs space-y-2">
            <h4 className="font-semibold text-gray-900">
              🔧 개발자 디버깅 정보
            </h4>
            <div className="grid grid-cols-2 gap-4 text-gray-600">
              <div>
                <p>
                  <strong>렌더링:</strong> CSR (Client-Side Rendering)
                </p>
                <p>
                  <strong>권한 검증:</strong> 클라이언트 + 서버 사이드
                </p>
                <p>
                  <strong>게시글 ID:</strong> {post.id}
                </p>
              </div>
              <div>
                <p>
                  <strong>수정자:</strong>{" "}
                  {session.user?.nickname || session.user?.name}
                </p>
                <p>
                  <strong>권한:</strong> {session.user?.role}
                </p>
                <p>
                  <strong>로딩 시간:</strong> {new Date().toISOString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
