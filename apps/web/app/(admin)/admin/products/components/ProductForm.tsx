"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { Label } from "@repo/ui/components/label";
import { Separator } from "@repo/ui/components/separator";
import { Switch } from "@repo/ui/components/switch";
import {
  ImageIcon,
  Plus,
  X,
  Loader2,
  Package,
  Tag,
  DollarSign,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface ProductFormProps {
  action: (formData: FormData) => Promise<void>;
  submitButtonText: string;
  submitButtonIcon: React.ReactNode;
  defaultValues?: {
    name?: string;
    description?: string;
    price?: number;
    originalPrice?: number;
    category?: string;
    inStock?: boolean;
    featured?: boolean;
    images?: string[];
    tags?: string[];
    specifications?: Record<string, string>;
  };
}

export function ProductForm({
  action,
  submitButtonText,
  submitButtonIcon,
  defaultValues = {},
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(
    defaultValues.images || []
  );
  const [newImageUrl, setNewImageUrl] = useState("");
  const [specifications, setSpecifications] = useState<
    Array<{ key: string; value: string }>
  >(
    Object.entries(defaultValues?.specifications || {}).map(([key, value]) => ({
      key,
      value,
    }))
  );

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleAddSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const handleRemoveSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSpecificationChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newSpecs = [...specifications];
    if (newSpecs[index]) {
      newSpecs[index][field] = value;
      setSpecifications(newSpecs);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);

      // 이미지 URL들 추가
      imageUrls.forEach((url) => {
        formData.append("imageUrls", url);
      });

      // 제품 규격 추가
      specifications.forEach((spec) => {
        if (spec.key && spec.value) {
          formData.append("specKey", spec.key);
          formData.append("specValue", spec.value);
        }
      });

      await action(formData);

      toast.success("제품이 성공적으로 처리되었습니다!");
    } catch (error) {
      console.error("제품 처리 실패:", error);
      toast.error(
        error instanceof Error ? error.message : "처리에 실패했습니다."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            기본 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">제품명 *</Label>
              <Input
                id="name"
                name="name"
                placeholder="제품명을 입력하세요"
                defaultValue={defaultValues.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Input
                id="category"
                name="category"
                placeholder="예: 전자제품, 의류, 도서 등"
                defaultValue={defaultValues.category}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">제품 설명</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="제품에 대한 자세한 설명을 입력하세요"
              rows={4}
              defaultValue={defaultValues.description}
            />
          </div>
        </CardContent>
      </Card>

      {/* 가격 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            가격 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">판매가격 (원) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                placeholder="89000"
                defaultValue={defaultValues.price}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="originalPrice">정가 (원)</Label>
              <Input
                id="originalPrice"
                name="originalPrice"
                type="number"
                min="0"
                placeholder="129000"
                defaultValue={defaultValues.originalPrice}
              />
              <p className="text-xs text-gray-500">
                할인 표시를 위한 정가 (선택사항)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 이미지 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            제품 이미지
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>이미지 URL 추가</Label>
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddImage())
                }
              />
              <Button type="button" onClick={handleAddImage} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {imageUrls.length > 0 && (
            <div className="space-y-2">
              <Label>등록된 이미지</Label>
              <div className="grid gap-2">
                {imageUrls.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded"
                  >
                    <img
                      src={url}
                      alt={`제품 이미지 ${index + 1}`}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = "/api/placeholder/48/48";
                      }}
                    />
                    <span className="flex-1 text-sm truncate">{url}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveImage(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 태그 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            태그
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="인기상품, 신제품, 할인"
              defaultValue={defaultValues.tags?.join(", ")}
            />
            <p className="text-xs text-gray-500">
              검색과 분류에 사용될 태그를 쉼표로 구분하여 입력하세요
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 제품 규격 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            제품 규격
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {specifications.map((spec, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="규격명 (예: 크기)"
                value={spec.key}
                onChange={(e) =>
                  handleSpecificationChange(index, "key", e.target.value)
                }
              />
              <Input
                placeholder="값 (예: 25 x 15 x 10 cm)"
                value={spec.value}
                onChange={(e) =>
                  handleSpecificationChange(index, "value", e.target.value)
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveSpecification(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={handleAddSpecification}
          >
            <Plus className="h-4 w-4 mr-2" />
            규격 추가
          </Button>
        </CardContent>
      </Card>

      {/* 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>제품 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>재고 상태</Label>
              <p className="text-sm text-gray-500">
                고객이 구매할 수 있는 상태인지 설정합니다
              </p>
            </div>
            <Switch
              name="inStock"
              defaultChecked={defaultValues.inStock !== false}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>추천 제품</Label>
              <p className="text-sm text-gray-500">
                메인 페이지에 추천 제품으로 노출됩니다
              </p>
            </div>
            <Switch
              name="featured"
              defaultChecked={defaultValues.featured === true}
            />
          </div>
        </CardContent>
      </Card>

      {/* 제출 버튼 */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            submitButtonIcon
          )}
          {isSubmitting ? "처리 중..." : submitButtonText}
        </Button>
      </div>
    </form>
  );
}
