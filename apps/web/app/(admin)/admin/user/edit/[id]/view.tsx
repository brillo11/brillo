"use client";

import { AdminLayoutWrapper } from "@/components/admin/layout/admin-layout-wrapper";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { PATH } from "@/consts/path";
import { kdayjs } from "@/lib/utils/dayjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { updateUserAdminMemo } from "@/serverActions/admin/user.sa";

export function UserEditView({ user: user }: any) {
  const router = useRouter();
  const [extensionDays, setExtensionDays] = useState<{
    [key: string]: number;
  }>({});
  const [adjustmentCount, setAdjustmentCount] = useState<{
    [key: string]: { [key: string]: number };
  }>({});
  const [adminMemo, setAdminMemo] = useState(user?.adminMemo || "");
  const [isEditingMemo, setIsEditingMemo] = useState(false);

  const handleUpdateMemo = async () => {
    if (!user) return;
    try {
      const result = await updateUserAdminMemo(user.id.toString(), adminMemo);
      if (result.success) {
        toast.success(result.message);
        setIsEditingMemo(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("메모 업데이트 실패:", error);
      toast.error("메모 업데이트에 실패했습니다.");
    }
  };

  return (
    <AdminLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">사용자 관리</h1>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(PATH.ADMIN_USER)}
            >
              목록으로
            </Button>
          </div>
        </div>
        {/* 사용자 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  닉네임
                </Label>
                <Input
                  value={user.nickname}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">ID</Label>
                <Input value={user.id} disabled className="mt-1 bg-gray-50" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  역할
                </Label>
                <Select value={user.role} disabled>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">일반 사용자</SelectItem>
                    <SelectItem value="ADMIN">관리자</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  가입일
                </Label>
                <Input
                  value={kdayjs(user.createdAt).format("YYYY-MM-DD A hh:mm:ss")}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
            </div>

            {/* 관리자 메모 */}
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">
                  관리자 메모
                </Label>
                <div className="space-x-2">
                  {isEditingMemo ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditingMemo(false);
                          setAdminMemo(user?.adminMemo || "");
                        }}
                      >
                        취소
                      </Button>
                      <Button size="sm" onClick={handleUpdateMemo}>
                        저장
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingMemo(true)}
                    >
                      편집
                    </Button>
                  )}
                </div>
              </div>
              {isEditingMemo ? (
                <Textarea
                  value={adminMemo}
                  onChange={(e) => setAdminMemo(e.target.value)}
                  placeholder="관리자 메모를 입력하세요..."
                  className="mt-1 min-h-[120px]"
                />
              ) : (
                <div className="mt-1 min-h-[120px] rounded-md border bg-gray-50 p-3">
                  {adminMemo ? (
                    <p className="text-sm whitespace-pre-wrap text-gray-900">
                      {adminMemo}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      메모가 없습니다.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* <Button onClick={handleUpdateUser}>정보 업데이트</Button> */}
          </CardContent>
        </Card>
        {/* 구독권 관리 */}
      </div>
    </AdminLayoutWrapper>
  );
}
