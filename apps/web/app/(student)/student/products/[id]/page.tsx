import { requireStudent } from "@/shared/lib/auth-guards";
import { getProductDetail } from "@/serverActions/product.actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@repo/ui/components/button";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { Star } from "lucide-react";

// SSR + Dynamic - 항상 최신 데이터, 캐시 없음
export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 🛡️ 서버에서 권한 검증 (미들웨어 통과 후 2차 검증)
  await requireStudent();

  const resolvedParams = await params;
  const product = await getProductDetail(resolvedParams.id);

  if (!product) {
    notFound();
  }

  const specs = product.specifications as any;
  const icon = specs?.icon || "🔮";
  const rating = specs?.rating || 0;
  const reviewCount = specs?.reviewCount || 0;
  const sampleLink = specs?.sampleLink;
  const serviceType = specs?.serviceType || "개별 서비스 (1인)";
  const provisionType = specs?.provisionType || "PDF 파일";
  const deliveryMethod = specs?.deliveryMethod || "이메일";
  const timeRequired = specs?.timeRequired || "결제 후 3영업일 이내";

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : 0;

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < fullStars
                ? "fill-[#FFD700] text-[#FFD700]"
                : i === fullStars && hasHalfStar
                  ? "fill-[#FFD700]/50 text-[#FFD700]"
                  : "fill-none text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-70px)] bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 뒤로가기 버튼 */}
        <Link
          href="/student/products"
          className="inline-flex items-center gap-2 text-slate-700 hover:text-[#3B82F6] transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">상품 목록으로 돌아가기</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 좌측: 상품 이미지 */}
          <div className="space-y-4">
            {/* 메인 이미지 */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                  />
                ) : (
                  <div className="text-8xl">{icon}</div>
                )}
              </div>
            </div>

            {/* 썸네일 이미지들 */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-2 gap-4">
                {product.images
                  .slice(0, 2)
                  .map((image: string, index: number) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-4 shadow-sm border-2 border-transparent hover:border-[#3B82F6]/30 transition-all"
                    >
                      <div className="relative aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        {index === 0 ? (
                          <span className="text-xs text-gray-500">
                            표지 이미지
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">
                            속지 이미지
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* 우측: 상품 정보 */}
          <div className="space-y-6">
            {/* 상단 배너 */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-red-700">
                실제 상품 결과를 확인해보세요!
              </span>
              {sampleLink && (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  결과 미리보기
                </Button>
              )}
            </div>

            {/* 상품 제목 및 상태 */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">
                  {product.name}
                </h1>
                {product.inStock && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    활성화
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">코드: {product.id}</p>
            </div>

            {/* 가격 정보 */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-sm text-gray-600">₩ 판매가</span>
                {discount > 0 && (
                  <span className="text-sm text-red-600 font-semibold">
                    {discount}% 할인
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-3">
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <span className="text-lg text-gray-400 line-through">
                      {product.originalPrice.toLocaleString()}원
                    </span>
                  )}
                <span className="text-3xl font-bold text-[#3B82F6]">
                  {product.price.toLocaleString()}원
                </span>
              </div>
            </div>

            {/* 별점 및 리뷰 */}
            {rating > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-3">
                  {renderStars(rating)}
                  <span className="text-sm text-gray-600">
                    ({reviewCount}개 리뷰)
                  </span>
                </div>
              </div>
            )}

            {/* 기본 정보 */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-lg font-semibold text-[#3B82F6] mb-4 flex items-center gap-2">
                <span>●</span> 기본 정보
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">상품설명</span>
                  <p className="text-sm text-slate-700 mt-1">
                    {product.description}
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">서비스 형태</span>
                  <span className="text-sm font-medium text-slate-700">
                    {serviceType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">샘플 링크</span>
                  <span className="text-sm text-gray-500">
                    {sampleLink || "링크가 제공되지 않았습니다"}
                  </span>
                </div>
              </div>
            </div>

            {/* 제공 정보 */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-lg font-semibold text-[#3B82F6] mb-4 flex items-center gap-2">
                <span>●</span> 제공 정보
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">제공 형태</span>
                  <span className="text-sm font-medium text-slate-700">
                    {provisionType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">전송 방법</span>
                  <span className="text-sm font-medium text-slate-700">
                    {deliveryMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">소요 시간</span>
                  <span className="text-sm font-medium text-slate-700">
                    ● {timeRequired}
                  </span>
                </div>
              </div>
            </div>

            {/* 등록일/수정일 */}
            <div className="text-xs text-gray-500">
              <p>
                등록일:{" "}
                {new Date(product.createdAt).toLocaleDateString("ko-KR")}
              </p>
              <p>
                수정일:{" "}
                {new Date(product.updatedAt).toLocaleDateString("ko-KR")}
              </p>
            </div>

            {/* 구매 버튼 */}
            <Button className="w-full bg-gradient-to-r from-[#3B82F6] to-[#1E3A8A] text-white hover:opacity-90 py-6 text-lg font-semibold">
              상품 주문하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
