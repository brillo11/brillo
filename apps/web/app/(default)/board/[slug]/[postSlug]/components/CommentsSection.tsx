"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import { Textarea } from "@repo/ui/components/textarea";
import { Badge } from "@repo/ui/components/badge";
import { Separator } from "@repo/ui/components/separator";
import {
  MessageCircle,
  Send,
  Reply,
  Edit,
  Trash2,
  User,
  Loader2,
  Calendar,
} from "lucide-react";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "@/serverActions/comment.actions";
import { toast } from "sonner";

interface CommentsSectionProps {
  postId: string;
  postSlug: string;
  boardSlug: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  author: {
    id: string;
    nickname?: string;
    name: string;
    role: string;
  };
  replies: Comment[];
  _count: {
    replies: number;
  };
}

interface CommentsPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function CommentsSection({
  postId,
  postSlug,
  boardSlug,
}: CommentsSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<CommentsPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // 댓글 목록 로딩
  const loadComments = async (page = 1) => {
    try {
      setLoading(true);
      const result = await getComments(postId, page);
      setComments(result.comments);
      setPagination(result.pagination);
    } catch (error) {
      console.error("댓글 로딩 실패:", error);
      toast.error("댓글을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  // 댓글 작성
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    if (!newComment.trim()) {
      toast.error("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("postId", postId);
      formData.append("content", newComment);

      await createComment(formData);
      toast.success("댓글이 작성되었습니다.");
      setNewComment("");
      loadComments();
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      toast.error(
        error instanceof Error ? error.message : "댓글 작성에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 답글 작성
  const handleSubmitReply = async (parentId: string) => {
    if (!session) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    if (!replyContent.trim()) {
      toast.error("답글 내용을 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("postId", postId);
      formData.append("content", replyContent);
      formData.append("parentId", parentId);

      await createComment(formData);
      toast.success("답글이 작성되었습니다.");
      setReplyTo(null);
      setReplyContent("");
      loadComments();
    } catch (error) {
      console.error("답글 작성 실패:", error);
      toast.error(
        error instanceof Error ? error.message : "답글 작성에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 댓글 수정
  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) {
      toast.error("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      await updateComment(commentId, editContent);
      toast.success("댓글이 수정되었습니다.");
      setEditingComment(null);
      setEditContent("");
      loadComments();
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      toast.error(
        error instanceof Error ? error.message : "댓글 수정에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("정말로 댓글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      setSubmitting(true);
      await deleteComment(commentId);
      toast.success("댓글이 삭제되었습니다.");
      loadComments();
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      toast.error(
        error instanceof Error ? error.message : "댓글 삭제에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 댓글 아이템 렌더링
  const renderComment = (comment: Comment, isReply = false) => {
    const canEdit =
      session &&
      (session.user.id === comment.author.id || session.user.role === "ADMIN");

    return (
      <div key={comment.id} className={`${isReply ? "ml-8 mt-4" : ""}`}>
        <Card className={isReply ? "bg-gray-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-sm">
                    {comment.author.nickname || comment.author.name}
                  </span>
                  {comment.author.role === "ADMIN" && (
                    <Badge variant="destructive" className="text-xs">
                      관리자
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
              </div>

              {canEdit && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingComment(comment.id);
                      setEditContent(comment.content);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {editingComment === comment.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="댓글을 수정하세요..."
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdateComment(comment.id)}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "수정"
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent("");
                    }}
                  >
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-700 whitespace-pre-wrap mb-3">
                  {comment.content}
                </p>

                {!isReply && session && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(comment.id)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    답글
                  </Button>
                )}
              </>
            )}

            {/* 답글 작성 폼 */}
            {replyTo === comment.id && (
              <div className="mt-4 space-y-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="답글을 작성하세요..."
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "답글 작성"
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyTo(null);
                      setReplyContent("");
                    }}
                  >
                    취소
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 답글들 */}
        {comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        <h3 className="text-xl font-semibold">
          댓글 {pagination?.totalCount || 0}개
        </h3>
      </div>

      {/* 댓글 작성 폼 */}
      {session ? (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 작성하세요..."
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  댓글 작성
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-gray-500">
              댓글을 작성하려면 로그인이 필요합니다.
            </p>
            <Button variant="outline" className="mt-2" asChild>
              <a href="/admin/login">로그인</a>
            </Button>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* 댓글 목록 */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>아직 댓글이 없습니다.</p>
          <p className="text-sm mt-1">첫 번째 댓글을 작성해보세요!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}

      {/* 페이지네이션 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {pagination.hasPrev && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadComments(pagination.currentPage - 1)}
            >
              이전
            </Button>
          )}
          <span className="flex items-center px-3 text-sm text-gray-600">
            {pagination.currentPage} / {pagination.totalPages}
          </span>
          {pagination.hasNext && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadComments(pagination.currentPage + 1)}
            >
              다음
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
