import { requireAdmin } from "@/lib/auth-guards";
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
import { ArrowLeft, Package, Save, ImageIcon, Plus, X } from "lucide-react";
import Link from "next/link";
import { createProduct } from "@/serverActions/admin/product.sa";
import { ProductForm } from "../components/ProductForm";

// CSR - 폼 인터랙션을 위해
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  // 🛡️ 관리자 권한 확인
  await requireAdmin();

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </Button>
        </Link>

        <div>
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-emerald-600" />
            <h1 className="text-3xl font-bold text-gray-900">새 제품 등록</h1>
          </div>
          <p className="text-gray-600 mt-2">
            새로운 제품을 등록하여 고객들이 구매할 수 있도록 합니다.
          </p>
        </div>
      </div>

      {/* 제품 등록 폼 */}
      <ProductForm
        action={createProduct}
        submitButtonText="제품 등록"
        submitButtonIcon={<Save className="h-4 w-4 mr-2" />}
      />

      {/* 개발 모드 디버깅 정보 */}
      {process.env.NODE_ENV === "development" && (
        <div className="p-4 bg-white rounded-lg shadow text-xs space-y-2">
          <h4 className="font-semibold text-gray-900">🔧 개발자 디버깅 정보</h4>
          <div className="grid grid-cols-2 gap-4 text-gray-600">
            <div>
              <p>
                <strong>페이지 타입:</strong> 제품 등록 페이지
              </p>
              <p>
                <strong>렌더링:</strong> SSR + Dynamic
              </p>
              <p>
                <strong>권한:</strong> 관리자 전용
              </p>
            </div>
            <div>
              <p>
                <strong>액션:</strong> createProduct
              </p>
              <p>
                <strong>리다이렉트:</strong> /admin/products
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
}
