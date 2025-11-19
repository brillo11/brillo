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
import { ArrowLeft, GraduationCap, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createAdminClass } from "@/serverActions/admin/class.sa";

export default function NewClassPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await createAdminClass({ title: title.trim(), slug: slug.trim() });
      toast.success("기수가 성공적으로 생성되었습니다.");
      router.push("/admin/class");
    } catch (error) {
      console.error("기수 생성 실패:", error);
      toast.error("기수 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // title에서 자동으로 slug 생성 (예: "1기" -> "1")
  const handleTitleChange = (value: string) => {
    setTitle(value);
    // 숫자만 추출하여 slug로 사용
    const numberMatch = value.match(/\d+/);
    if (numberMatch) {
      setSlug(numberMatch[0]);
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
              <h1 className="text-3xl font-bold text-gray-900">새 기수 등록</h1>
            </div>
            <p className="mt-2 text-gray-600">
              새로운 기수를 등록합니다. (예: 1기, 2기, 3기)
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>기수 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">기수명 *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="예: 1기, 2기, 3기"
                  required
                />
                <p className="text-sm text-gray-500">
                  기수의 이름을 입력하세요. 숫자가 포함되면 슬러그가 자동으로 생성됩니다.
                </p>
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
                  URL에 사용될 고유한 식별자입니다. (영문, 숫자, 하이픈만 사용 가능)
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
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      기수 등록
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AdminLayoutWrapper>
  );
}

