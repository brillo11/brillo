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
import { deleteProduct } from "@/serverActions/admin/product.sa";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProductActionsProps {
  productId: string;
  productName: string;
}

export function ProductActions({
  productId,
  productName,
}: ProductActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteProduct(productId);
      toast.success("제품이 삭제되었습니다.");

      // 제품 목록 페이지 새로고침
      router.refresh();
    } catch (error) {
      console.error("제품 삭제 실패:", error);
      toast.error(
        error instanceof Error ? error.message : "제품 삭제에 실패했습니다."
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
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
          <AlertDialogTitle>제품 삭제</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-2">
              <p>정말로 다음 제품을 삭제하시겠습니까?</p>
              <div className="p-3 bg-gray-50 rounded border-l-4 border-red-500">
                <p className="font-medium text-gray-900">"{productName}"</p>
                <p className="text-sm text-gray-600 mt-1">
                  제품 ID: {productId}
                </p>
              </div>
              <p className="text-red-600 font-medium">
                ⚠️ 삭제된 제품은 복구할 수 없습니다.
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
