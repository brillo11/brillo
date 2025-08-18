"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Separator } from "@repo/ui/components/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Package,
  MessageCircle,
  Plus,
  Minus,
  Check,
  Gift,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PlaceholderLogo } from "@repo/ui/components/proBlocks/placeholder-logo";
import { useRouter } from "next/navigation";

interface ProductDetailClientProps {
  product: any;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("블랙");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const images: string[] = useMemo(() => {
    if (!product?.images) return [];
    try {
      return Array.isArray(product.images) ? product.images.map(String) : [];
    } catch {
      return [];
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-24 w-24 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            제품을 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 mb-6">
            요청하신 제품이 존재하지 않거나 삭제되었습니다.
          </p>
          <Button onClick={() => router.push("/products")}>
            제품 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    const cartItem = {
      id: String(product.id),
      name: product.name,
      price: product.price,
      image: images[0] ?? "",
      color: selectedColor,
      quantity,
    };
    console.log("장바구니에 추가:", cartItem);
    alert("장바구니에 추가되었습니다!");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">
              홈
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-gray-900">
              제품
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* 제품 이미지 */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
              {/* 메인 이미지 */}
              <div className="w-full h-full relative">
                {/* 플레이스홀더 로고 (기본 표시) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlaceholderLogo companyName={product.name} />
                </div>

                {/* 실제 이미지 */}
                {!imageError && images[selectedImageIndex] && (
                  <Image
                    src={images[selectedImageIndex]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                )}

                {/* 이미지 네비게이션 버튼 */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* 배지들 */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.featured && (
                    <Badge className="bg-red-500 text-white text-xs">
                      FEATURED
                    </Badge>
                  )}
                </div>

                {/* 재고 상태 */}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge className="bg-gray-600 text-white">품절</Badge>
                  </div>
                )}
              </div>
            </div>

            {/* 썸네일 이미지들 */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-gray-200 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? "border-emerald-500"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="h-8 w-8" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 제품 정보 */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">4.7</span>
                <span className="text-gray-500">(0개 리뷰)</span>
              </div>
            </div>

            {/* 가격 정보 */}
            <div className="border-t border-b py-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {product.price.toLocaleString()}원
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    {product.originalPrice.toLocaleString()}원
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                <Check className="h-4 w-4" />
                <span>무료배송</span>
              </div>
            </div>

            {/* 구매 옵션 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  색상 선택
                </label>
                <div className="flex gap-2">
                  {["블랙", "화이트", "네이비"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        selectedColor === color
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-gray-300 hover:border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수량
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 border border-gray-300 rounded-lg min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    disabled={quantity >= 99}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 구매 버튼 */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-4"
                onClick={handleBuyNow}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                바로 구매하기
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="py-3"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  장바구니
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="py-3"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${isWishlisted ? "fill-current text-red-500" : ""}`}
                  />
                  {isWishlisted ? "찜됨" : "찜하기"}
                </Button>
              </div>
            </div>

            {/* 혜택 정보 */}
            <div className="bg-emerald-50 rounded-lg p-4">
              <h3 className="font-semibold text-emerald-800 mb-3">
                🎁 구매 혜택
              </h3>
              <div className="space-y-2 text-sm text-emerald-700">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  <span>런칭 기념 사은품 증정</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>전국 무료배송 (제주/도서산간 포함)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>1년 품질보증 + 무상 A/S</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 상세 정보 탭 */}
        <div className="mb-16">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">상세정보</TabsTrigger>
              <TabsTrigger value="reviews">리뷰 (0)</TabsTrigger>
              <TabsTrigger value="qa">Q&A</TabsTrigger>
              <TabsTrigger value="shipping">배송/교환</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>제품 상세 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">제품 설명</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-3">제품 규격</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(product.specifications || {}).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between py-2 border-b border-gray-100"
                          >
                            <span className="font-medium text-gray-700">
                              {key}
                            </span>
                            <span className="text-gray-900">
                              {String(value)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>고객 리뷰</span>
                    <Link href="/board/reviews">
                      <Button variant="outline" size="sm">
                        더 많은 리뷰 보기
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>아직 리뷰가 없습니다.</p>
                    <p className="text-sm mt-1">첫 번째 리뷰를 작성해보세요!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qa" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>자주 묻는 질문</span>
                    <Link href="/board/qna">
                      <Button variant="outline" size="sm">
                        질문하기
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-b border-gray-100 pb-4">
                      <h4 className="font-medium mb-2">
                        Q. 배송은 언제 되나요?
                      </h4>
                      <p className="text-gray-600 text-sm">
                        A. 주문 확인 후 1-2일 내에 발송되며, 배송은 2-3일
                        소요됩니다.
                      </p>
                    </div>
                    <div className="border-b border-gray-100 pb-4">
                      <h4 className="font-medium mb-2">
                        Q. 교환/환불이 가능한가요?
                      </h4>
                      <p className="text-gray-600 text-sm">
                        A. 수령 후 7일 이내 미개봉 상품에 한해 교환/환불이
                        가능합니다.
                      </p>
                    </div>
                    <div className="border-b border-gray-100 pb-4">
                      <h4 className="font-medium mb-2">
                        Q. A/S는 어떻게 받나요?
                      </h4>
                      <p className="text-gray-600 text-sm">
                        A. 고객센터로 연락주시면 무상 A/S를 도와드립니다.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>배송 및 교환/환불 안내</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Truck className="h-5 w-5 text-emerald-600" />
                      배송 안내
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-600 ml-7">
                      <li>• 전국 무료배송 (제주/도서산간 지역 포함)</li>
                      <li>• 주문 확인 후 1-2일 내 발송</li>
                      <li>• 배송 기간: 2-3일 (영업일 기준)</li>
                      <li>• 택배사: CJ대한통운, 로젠택배</li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <RotateCcw className="h-5 w-5 text-blue-600" />
                      교환/환불 안내
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-600 ml-7">
                      <li>• 수령 후 7일 이내 교환/환불 가능</li>
                      <li>• 미개봉, 미사용 제품에 한함</li>
                      <li>• 고객 변심 시 왕복 배송비 고객 부담</li>
                      <li>• 불량품의 경우 무료 교환/환불</li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      품질보증 안내
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-600 ml-7">
                      <li>• 구매일로부터 1년 품질보증</li>
                      <li>• 정상 사용 중 발생한 불량 무상 수리</li>
                      <li>• 전국 서비스센터 운영</li>
                      <li>• 24시간 고객센터: 1588-0000</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* 추천 제품 */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            이런 제품은 어떠세요?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="group hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                  <h3 className="font-medium mb-2 group-hover:text-emerald-600 transition-colors">
                    추천 제품 {i}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold">79,000원</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm">4.7 (0)</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 하단 구매 바 (모바일 최적화) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-50">
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setIsWishlisted(!isWishlisted)}
            >
              <Heart
                className={`h-4 w-4 mr-2 ${isWishlisted ? "fill-current text-red-500" : ""}`}
              />
              {isWishlisted ? "찜됨" : "찜"}
            </Button>
            <Button
              size="sm"
              className="flex-[2] bg-emerald-600 hover:bg-emerald-700"
              onClick={handleBuyNow}
              disabled={!product.inStock}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              구매하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
