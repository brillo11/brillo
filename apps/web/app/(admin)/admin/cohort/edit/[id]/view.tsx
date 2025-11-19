"use client";

import { AdminLayoutWrapper } from "@/app/(admin)/admin/components/layout/admin-layout-wrapper";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { ArrowLeft, GraduationCap, Save, Users } from "lucide-react";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { updateAdminClass } from "@/serverActions/admin/class.sa";
import { Badge } from "@repo/ui/components/badge";

export function ClassEditView({ classData }: { classData: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(classData?.title || "");
  const [slug, setSlug] = useState(classData?.slug || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!classData) {
    return (
      <AdminLayoutWrapper>
        <div className="text-center py-12">
          <p className="text-gray-500">기수 정보를 찾을 수 없습니다.</p>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/class")}
            className="mt-4"
          >
            목록으로
          </Button>
        </div>
      </AdminLayoutWrapper>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("기수명을 입력해주세요.");
      return;
    }

    if (!slug.trim()) {
      toast.error("슬러그를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateAdminClass({
        id: classData.id.toString(),
        title: title.trim(),
        slug: slug.trim(),
      });
      toast.success("기수가 성공적으로 수정되었습니다.");
      router.push("/admin/class");
    } catch (error) {
      console.error("기수 수정 실패:", error);
      toast.error("기수 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/class")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-emerald-600" />
              <h1 className="text-3xl font-bold text-gray-900">기수 수정</h1>
            </div>
            <p className="mt-2 text-gray-600">기수 정보를 수정합니다.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>기수 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    기수 ID
                  </Label>
                  <Input
                    value={classData.id.toString()}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    학생 수
                  </Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-lg">
                      <Users className="mr-1 h-4 w-4" />
                      {classData._count?.users || 0}명
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    생성일
                  </Label>
                  <Input
                    value={kdayjs(classData.createdAt).format(
                      "YYYY-MM-DD HH:mm:ss"
                    )}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    수정일
                  </Label>
                  <Input
                    value={kdayjs(classData.updatedAt).format(
                      "YYYY-MM-DD HH:mm:ss"
                    )}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">기수명 *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 1기, 2기, 3기"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">슬러그 *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="예: 1, 2, 3"
                  required
                />
                <p className="text-sm text-gray-500">
                  URL에 사용될 고유한 식별자입니다.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/class")}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Save className="mr-2 h-4 w-4 animate-spin" />
                      수정 중...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      수정 저장
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* 학생 목록 */}
        {classData.users && classData.users.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                소속 학생 ({classData.users.length}명)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {classData.users.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="font-medium">{user.nickname || user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {kdayjs(user.createdAt).format("YYYY-MM-DD")}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayoutWrapper>
  );
}

