"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/alert-dialog";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { deletePost } from "@/serverActions/post.actions";
import { toast } from "sonner";

interface PostActionsProps {
  postId: string;
  postSlug: string;
  authorId: string;
  boardSlug: string;
}

export function PostActions({
  postId,
  postSlug,
  authorId,
  boardSlug,
}: PostActionsProps) {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);

  // 수정/삭제 권한 확인
  const canEdit =
    session && (session.user.id === authorId || session.user.role === "ADMIN");

  if (!canEdit) {
    return null;
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deletePost(postSlug);
      toast.success("게시글이 삭제되었습니다.");
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      toast.error(
        error instanceof Error ? error.message : "게시글 삭제에 실패했습니다."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex justify-end gap-2 mt-6">
      <Link href={`/board/${boardSlug}/${postSlug}/edit`}>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          수정
        </Button>
      </Link>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            삭제
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>게시글 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 게시글을 삭제하시겠습니까? 삭제된 게시글은 복구할 수
              없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
