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
import { ArrowLeft, Save, Loader2, Tag, FileText, X } from "lucide-react";
import Link from "next/link";
import { createPost } from "@/serverActions/post.actions";
import { getBoards } from "@/serverActions/post.actions";
import { toast } from "sonner";

interface Board {
  id: string;
  title: string;
  slug: string;
  _count: {
    posts: number;
  };
}

export default function WritePostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const boardSlug = params.slug as string;

  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
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
        const boardsData = await getBoards();
        setBoards(boardsData);

        const board = boardsData.find((b) => b.slug === boardSlug);
        if (!board) {
          toast.error("존재하지 않는 게시판입니다.");
          router.push("/");
          return;
        }

        setCurrentBoard(board);
      } catch (error) {
        console.error("게시판 정보 로딩 실패:", error);
        toast.error("게시판 정보를 불러오는데 실패했습니다.");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [status, boardSlug, router]);

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

  // 게시글 작성 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
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
      formData.append("boardSlug", boardSlug);
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      formData.append("tags", tags.join(","));

      await createPost(formData);

      // createPost에서 redirect를 처리하므로 여기서는 성공 메시지만
      toast.success("게시글이 작성되었습니다!");
    } catch (error) {
      console.error("게시글 작성 실패:", error);
      toast.error(
        error instanceof Error ? error.message : "게시글 작성에 실패했습니다."
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
  if (!session) {
    return null;
  }

  // 게시판 없음
  if (!currentBoard) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/board/${boardSlug}`}>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                목록으로
              </Button>
            </Link>
            <Badge variant="secondary">{currentBoard.title}</Badge>
          </div>

          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">새 게시글 작성</h1>
          </div>

          <p className="text-gray-600 mt-2">
            {currentBoard.title} 게시판에 새로운 글을 작성합니다.
          </p>
        </div>
      </div>

      {/* 작성 폼 */}
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
            </CardContent>
          </Card>

          {/* 작성 버튼 */}
          <div className="flex justify-end gap-3">
            <Link href={`/board/${boardSlug}`}>
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
                  작성 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  게시글 작성
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
                  <strong>권한 검증:</strong> 클라이언트 사이드
                </p>
                <p>
                  <strong>게시판:</strong> {currentBoard.title}
                </p>
              </div>
              <div>
                <p>
                  <strong>사용자:</strong>{" "}
                  {session.user?.nickname || session.user?.name}
                </p>
                <p>
                  <strong>태그 수:</strong> {tags.length}/5
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
}
