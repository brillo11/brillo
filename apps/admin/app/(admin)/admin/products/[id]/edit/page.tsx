import { requireAdmin } from "@/shared/lib/auth-guards";
import { getProduct, updateProduct } from "@/serverActions/admin/product.sa";
import { notFound } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { ArrowLeft, Package, Edit } from "lucide-react";
import Link from "next/link";
import { ProductForm } from "../../components/ProductForm";

// SSR + Dynamic - 최신 제품 정보
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: PageProps) {
  // 🛡️ 관리자 권한 확인
  await requireAdmin();

  const { id } = await params;

  try {
    const product = await getProduct(id);

    // 서버 액션에 id를 바인딩하는 함수
    const updateProductWithId = async (formData: FormData) => {
      "use server";
      return updateProduct(id, formData);
    };

    return (
      <div className="space-y-6 p-6">
        {/* 헤더 */}
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              목록으로
            </Button>
          </Link>

          <div>
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-orange-600" />
              <h1 className="text-3xl font-bold text-gray-900">제품 수정</h1>
            </div>
            <p className="text-gray-600 mt-2">
              "{product.name}" 제품의 정보를 수정합니다.
            </p>
          </div>
        </div>

        {/* 제품 수정 폼 */}
        <ProductForm
          action={updateProductWithId}
          submitButtonText="제품 수정"
          submitButtonIcon={<Edit className="h-4 w-4 mr-2" />}
          defaultValues={{
            name: product.name,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice,
            category: product.category,
            inStock: product.inStock,
            featured: product.featured,
            images: Array.isArray(product.images)
              ? (product.images as string[])
              : [],
            tags: Array.isArray(product.tags) ? product.tags : [],
            specifications:
              typeof product.specifications === "object" &&
              product.specifications
                ? (product.specifications as Record<string, string>)
                : {},
          }}
        />

        {/* 개발 모드 디버깅 정보 */}
        {process.env.NODE_ENV === "development" && (
          <div className="p-4 bg-white rounded-lg shadow text-xs space-y-2">
            <h4 className="font-semibold text-gray-900">
              🔧 개발자 디버깅 정보
            </h4>
            <div className="grid grid-cols-2 gap-4 text-gray-600">
              <div>
                <p>
                  <strong>페이지 타입:</strong> 제품 수정 페이지
                </p>
                <p>
                  <strong>렌더링:</strong> SSR + Dynamic
                </p>
                <p>
                  <strong>제품 ID:</strong> {product.id}
                </p>
              </div>
              <div>
                <p>
                  <strong>제품명:</strong> {product.name}
                </p>
                <p>
                  <strong>액션:</strong> updateProduct
                </p>
                <p>
                  <strong>생성 시간:</strong> {new Date().toISOString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("제품 조회 실패:", error);
    notFound();
  }
}
