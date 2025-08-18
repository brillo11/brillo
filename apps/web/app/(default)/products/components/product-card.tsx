import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Card, CardContent } from "@repo/ui/components/card";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { PlaceholderLogo } from "@repo/ui/components/proBlocks/placeholder-logo";

// 제품 데이터 타입
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  tags: string[];
  inStock: boolean;
  isNew?: boolean;
  isHot?: boolean;
}

// 카드 변형 타입
export type CardVariant = "default" | "compact" | "featured" | "list";

// 카드 컴포넌트의 props 타입
interface ProductCardProps {
  product: Product;
  variant?: CardVariant;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
}

// 기본 제품 카드 컴포넌트
export function ProductCard({
  product,
  variant = "default",
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}: ProductCardProps) {
  const isListVariant = variant === "list";
  const [imageError, setImageError] = useState(false);

  const baseClasses = "group transition-all duration-200 hover:shadow-lg";
  const variantClasses = {
    default: "bg-white rounded-lg border border-gray-200",
    compact: "bg-white rounded-md border border-gray-100",
    featured:
      "bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 shadow-md",
    list: "bg-white rounded-lg border border-gray-200 flex-row",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <Card className="border-0 shadow-none h-full">
        <CardContent className={`p-0 h-full ${isListVariant ? "flex" : ""}`}>
          {/* 이미지 영역 */}
          <div
            className={`relative overflow-hidden ${isListVariant ? "w-48 flex-shrink-0" : ""}`}
          >
            <Link href={`/product/${product.id}`}>
              <div
                className={`${isListVariant ? "h-32" : "aspect-square"} relative bg-gray-100`}
              >
                {/* 플레이스홀더 로고 (기본 표시) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlaceholderLogo companyName={product.name} />
                </div>

                {/* 실제 이미지 (성공 시 표시) */}
                {!imageError && product.image && (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    onError={() => setImageError(true)}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}

                {/* 배지들 */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.isNew && (
                    <Badge className="bg-blue-500 text-white text-xs">
                      NEW
                    </Badge>
                  )}
                  {product.isHot && (
                    <Badge className="bg-red-500 text-white text-xs">HOT</Badge>
                  )}
                  {product.discount && (
                    <Badge className="bg-orange-500 text-white text-xs">
                      {product.discount}% OFF
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
            </Link>
          </div>

          {/* 내용 영역 */}
          <div
            className={`p-4 flex-1 ${isListVariant ? "flex flex-col justify-between" : ""}`}
          >
            {/* 카테고리 및 태그 */}
            <div className="mb-2">
              <span className="text-xs text-gray-500">{product.category}</span>
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* 제품명 */}
            <Link href={`/product/${product.id}`}>
              <h3
                className={`font-medium text-gray-900 mb-2 hover:text-blue-600 transition-colors ${
                  variant === "compact" ? "text-sm" : "text-base"
                }`}
              >
                {product.name}
              </h3>
            </Link>

            {/* 평점 */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    } ${variant === "compact" ? "h-3 w-3" : "h-4 w-4"}`}
                  />
                ))}
              </div>
              <span
                className={`text-gray-600 ${variant === "compact" ? "text-xs" : "text-sm"}`}
              >
                {product.rating} ({product.reviewCount})
              </span>
            </div>

            {/* 가격 */}
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`font-bold text-gray-900 ${
                    variant === "compact" ? "text-lg" : "text-xl"
                  }`}
                >
                  {product.price.toLocaleString()}원
                </span>
                {product.originalPrice && (
                  <span className="text-gray-400 line-through text-sm">
                    {product.originalPrice.toLocaleString()}원
                  </span>
                )}
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div
              className={`flex gap-2 ${variant === "compact" ? "flex-col" : ""}`}
            >
              <Button
                size={variant === "compact" ? "sm" : "default"}
                className="flex-1"
                disabled={!product.inStock}
                onClick={() => onAddToCart?.(product)}
              >
                <ShoppingCart
                  className={`${variant === "compact" ? "h-3 w-3" : "h-4 w-4"} mr-1`}
                />
                {variant === "compact" ? "담기" : "장바구니"}
              </Button>

              <Button
                variant="outline"
                size={variant === "compact" ? "sm" : "default"}
                onClick={() => onToggleWishlist?.(product)}
                className={isWishlisted ? "text-red-500 border-red-500" : ""}
              >
                <Heart
                  className={`${variant === "compact" ? "h-3 w-3" : "h-4 w-4"} ${
                    isWishlisted ? "fill-current" : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 컴팩트 버전
export const CompactProductCard = (
  props: Omit<ProductCardProps, "variant">
) => <ProductCard {...props} variant="compact" />;

// 피처드 버전
export const FeaturedProductCard = (
  props: Omit<ProductCardProps, "variant">
) => <ProductCard {...props} variant="featured" />;

// 리스트 버전
export const ListProductCard = (props: Omit<ProductCardProps, "variant">) => (
  <ProductCard {...props} variant="list" />
);
