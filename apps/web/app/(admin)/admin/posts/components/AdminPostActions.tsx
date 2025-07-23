"use client";

import { useState } from "react";
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
import { Trash2, Loader2 } from "lucide-react";
import { deletePost } from "@/serverActions/post.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AdminPostActionsProps {
  postId: string;
  postSlug: string;
  postTitle: string;
  boardSlug: string;
}

export function AdminPostActions({
  postId,
  postSlug,
  postTitle,
  boardSlug,
}: AdminPostActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deletePost(postSlug);
      toast.success("게시글이 삭제되었습니다.");

      // 관리자 페이지 새로고침
      router.refresh();
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Trash2 className="h-3 w-3 mr-1" />
          )}
          삭제
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>게시글 삭제</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-2">
              <p>정말로 다음 게시글을 삭제하시겠습니까?</p>
              <div className="p-3 bg-gray-50 rounded border-l-4 border-red-500">
                <p className="font-medium text-gray-900">"{postTitle}"</p>
                <p className="text-sm text-gray-600 mt-1">
                  게시글 ID: {postId}
                </p>
              </div>
              <p className="text-red-600 font-medium">
                ⚠️ 삭제된 게시글과 모든 댓글은 복구할 수 없습니다.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                삭제 중...
              </>
            ) : (
              "삭제 확인"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
