import { requireAdmin } from "@/shared/lib/auth-guards";
import {
  getAdminProducts,
  getProductStats,
} from "@/serverActions/admin/product.sa";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  ShoppingCart,
  AlertCircle,
  TrendingUp,
  Boxes,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { ProductActions } from "./components/ProductActions";

// SSR + Dynamic - 항상 최신 데이터
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  // 🛡️ 관리자 권한 확인
  const session = await requireAdmin();

  // searchParams를 await로 처리
  const params = await searchParams;
  const page = parseInt(params.page || "1");

  // 서버에서 데이터 페칭
  const [productsData, stats] = await Promise.all([
    getAdminProducts(page, 12),
    getProductStats(),
  ]);

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-emerald-600" />
            <h1 className="text-3xl font-bold text-gray-900">제품 관리</h1>
          </div>
          <p className="text-gray-600 mt-2">
            등록된 제품을 관리하고 새로운 제품을 추가합니다.
          </p>
        </div>

        <Link href="/admin/products/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />새 제품 등록
          </Button>
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 제품</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">판매 중</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.inStockProducts}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">추천 제품</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.featuredProducts}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 상품 가치</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{stats.totalValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 제품 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>등록된 제품</CardTitle>
        </CardHeader>
        <CardContent>
          {productsData.products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 text-lg">등록된 제품이 없습니다.</p>
              <p className="text-gray-400 mt-2">첫 번째 제품을 등록해보세요!</p>
              <Link href="/admin/products/new" className="mt-4 inline-block">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  제품 등록하기
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {productsData.products.map((product) => (
                <Card
                  key={product.id.toString()}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 relative">
                    {Array.isArray(product.images) &&
                    product.images.length > 0 ? (
                      <img
                        src={product.images[0] as string}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/api/placeholder/300/300";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-gray-400" />
                      </div>
                    )}

                    {/* 상태 배지 */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {!product.inStock && (
                        <Badge variant="destructive" className="text-xs">
                          품절
                        </Badge>
                      )}
                      {product.featured && (
                        <Badge className="bg-yellow-500 text-white text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          추천
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-emerald-600">
                          ₩{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            ₩{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {product.description || "설명이 없습니다."}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {product.viewCount}
                        </span>
                        <span>•</span>
                        <span>{product.category}</span>
                        <span>•</span>
                        <span>
                          {new Date(product.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* 태그 */}
                      {Array.isArray(product.tags) &&
                        product.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {product.tags
                              .slice(0, 3)
                              .map((tag: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            {product.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{product.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex gap-2 mt-4">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="h-3 w-3 mr-1" />
                          수정
                        </Button>
                      </Link>

                      <ProductActions
                        productId={product.id.toString()}
                        productName={product.name}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {productsData.pagination.totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex justify-center items-center gap-2">
              {productsData.pagination.hasPrev && (
                <Link
                  href={`/admin/products?page=${productsData.pagination.currentPage - 1}`}
                >
                  <Button variant="outline" size="sm">
                    이전
                  </Button>
                </Link>
              )}

              <div className="flex gap-1">
                {Array.from(
                  { length: Math.min(5, productsData.pagination.totalPages) },
                  (_, i) => {
                    const pageNum =
                      Math.max(1, productsData.pagination.currentPage - 2) + i;
                    if (pageNum > productsData.pagination.totalPages)
                      return null;

                    return (
                      <Link
                        key={pageNum}
                        href={`/admin/products?page=${pageNum}`}
                      >
                        <Button
                          variant={
                            pageNum === productsData.pagination.currentPage
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                        >
                          {pageNum}
                        </Button>
                      </Link>
                    );
                  }
                )}
              </div>

              {productsData.pagination.hasNext && (
                <Link
                  href={`/admin/products?page=${productsData.pagination.currentPage + 1}`}
                >
                  <Button variant="outline" size="sm">
                    다음
                  </Button>
                </Link>
              )}
            </div>

            <div className="text-center mt-4 text-sm text-gray-600">
              {productsData.pagination.currentPage} /{" "}
              {productsData.pagination.totalPages} 페이지 (총{" "}
              {productsData.pagination.totalCount}개)
            </div>
          </CardContent>
        </Card>
      )}

      {/* 개발 모드 디버깅 정보 */}
      {process.env.NODE_ENV === "development" && (
        <div className="p-4 bg-white rounded-lg shadow text-xs space-y-2">
          <h4 className="font-semibold text-gray-900">🔧 개발자 디버깅 정보</h4>
          <div className="grid grid-cols-2 gap-4 text-gray-600">
            <div>
              <p>
                <strong>렌더링:</strong> SSR + Dynamic (Server-Side Rendering)
              </p>
              <p>
                <strong>권한:</strong> {session.user?.role} (관리자)
              </p>
              <p>
                <strong>페이지:</strong> {productsData.pagination.currentPage}/
                {productsData.pagination.totalPages}
              </p>
            </div>
            <div>
              <p>
                <strong>총 제품:</strong> {productsData.pagination.totalCount}개
              </p>
              <p>
                <strong>페이지당 항목:</strong> 12개
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
