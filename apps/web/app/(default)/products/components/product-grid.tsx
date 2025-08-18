"use client";

import { useState } from "react";
import {
  ProductCard,
  Product,
  CompactProductCard,
  FeaturedProductCard,
} from "./product-card";
import { Button } from "@repo/ui/components/button";
import { Grid3X3, List, Grid } from "lucide-react";

// 가상의 제품 데이터 (fallback)
const mockProducts: Product[] = [
  {
    id: "1",
    name: "프리미엄 보컬 트레이닝 키트",
    price: 89000,
    originalPrice: 129000,
    discount: 31,
    rating: 4.8,
    reviewCount: 247,
    image: "/api/placeholder/400/400",
    category: "보컬 트레이닝",
    tags: ["초급", "기초"],
    inStock: true,
    isNew: true,
  },
  {
    id: "2",
    name: "고급 음성 분석 소프트웨어",
    price: 159000,
    originalPrice: 199000,
    discount: 20,
    rating: 4.9,
    reviewCount: 156,
    image: "/api/placeholder/400/400",
    category: "소프트웨어",
    tags: ["고급", "분석"],
    inStock: true,
    isHot: true,
  },
  {
    id: "3",
    name: "전문가용 마이크 세트",
    price: 299000,
    originalPrice: 399000,
    discount: 25,
    rating: 4.7,
    reviewCount: 89,
    image: "/api/placeholder/400/400",
    category: "하드웨어",
    tags: ["전문가", "고품질"],
    inStock: true,
  },
  {
    id: "4",
    name: "보컬 워밍업 가이드북",
    price: 29000,
    originalPrice: 39000,
    discount: 26,
    rating: 4.6,
    reviewCount: 203,
    image: "/api/placeholder/400/400",
    category: "도서",
    tags: ["워밍업", "가이드"],
    inStock: true,
  },
  {
    id: "5",
    name: "온라인 보컬 레슨 10회권",
    price: 199000,
    originalPrice: 299000,
    discount: 33,
    rating: 4.8,
    reviewCount: 67,
    image: "/api/placeholder/400/400",
    category: "온라인 레슨",
    tags: ["1:1", "전문가"],
    inStock: true,
  },
  {
    id: "6",
    name: "보컬 연습용 피아노",
    price: 89000,
    originalPrice: 119000,
    discount: 25,
    rating: 4.5,
    reviewCount: 134,
    image: "/api/placeholder/400/400",
    category: "악기",
    tags: ["연습용", "휴대용"],
    inStock: true,
  },
  {
    id: "7",
    name: "보컬 건강 관리 보조제",
    price: 45000,
    originalPrice: 65000,
    discount: 31,
    rating: 4.4,
    reviewCount: 98,
    image: "/api/placeholder/400/400",
    category: "건강식품",
    tags: ["보조제", "건강"],
    inStock: false,
  },
  {
    id: "8",
    name: "보컬 녹음 스튜디오 패키지",
    price: 599000,
    originalPrice: 799000,
    discount: 25,
    rating: 4.9,
    reviewCount: 45,
    image: "/api/placeholder/400/400",
    category: "스튜디오",
    tags: ["전문가", "고급"],
    inStock: true,
  },
  {
    id: "9",
    name: "보컬 테크닉 마스터 클래스",
    price: 129000,
    originalPrice: 179000,
    discount: 28,
    rating: 4.7,
    reviewCount: 178,
    image: "/api/placeholder/400/400",
    category: "마스터 클래스",
    tags: ["고급", "테크닉"],
    inStock: true,
  },
  {
    id: "10",
    name: "보컬 퍼포먼스 의상 세트",
    price: 89000,
    originalPrice: 129000,
    discount: 31,
    rating: 4.3,
    reviewCount: 67,
    image: "/api/placeholder/400/400",
    category: "의상",
    tags: ["퍼포먼스", "스타일"],
    inStock: true,
  },
  {
    id: "11",
    name: "보컬 히트곡 커버 가이드",
    price: 35000,
    originalPrice: 49000,
    discount: 29,
    rating: 4.6,
    reviewCount: 156,
    image: "/api/placeholder/400/400",
    category: "도서",
    tags: ["커버", "가이드"],
    inStock: true,
  },
  {
    id: "12",
    name: "보컬 연습용 스피커",
    price: 159000,
    originalPrice: 199000,
    discount: 20,
    rating: 4.5,
    reviewCount: 89,
    image: "/api/placeholder/400/400",
    category: "오디오",
    tags: ["연습용", "고품질"],
    inStock: true,
  },
];

type ViewMode = "grid" | "list" | "compact";

interface ProductGridProps {
  items?: Product[];
}

export function ProductGrid({ items }: ProductGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const products = items && items.length > 0 ? items : mockProducts;

  const handleAddToCart = (product: Product) => {
    console.log("장바구니에 추가:", product.name);
  };

  const handleToggleWishlist = (product: Product) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(product.id)) {
      newWishlist.delete(product.id);
    } else {
      newWishlist.add(product.id);
    }
    setWishlist(newWishlist);
  };

  const renderGridLayout = () => {
    if (viewMode === "list") {
      return (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="w-full">
              <ProductCard
                product={product}
                variant="list"
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={wishlist.has(product.id)}
              />
            </div>
          ))}
        </div>
      );
    }

    if (viewMode === "compact") {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <div key={product.id}>
              <CompactProductCard
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={wishlist.has(product.id)}
              />
            </div>
          ))}
        </div>
      );
    }

    // 기본 그리드 레이아웃 (4:3 교차)
    return (
      <div className="space-y-8">
        {/* 첫 번째 행: 4개 제품 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <div key={product.id} className="h-full">
              <ProductCard
                product={product}
                variant="default"
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={wishlist.has(product.id)}
              />
            </div>
          ))}
        </div>

        {/* 두 번째 행: 3개 제품 (중앙 정렬) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {products.slice(4, 7).map((product) => (
            <div key={product.id} className="h-full">
              <ProductCard
                product={product}
                variant="default"
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={wishlist.has(product.id)}
              />
            </div>
          ))}
        </div>

        {/* 세 번째 행: 4개 제품 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(7, 11).map((product) => (
            <div key={product.id} className="h-full">
              <ProductCard
                product={product}
                variant="default"
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={wishlist.has(product.id)}
              />
            </div>
          ))}
        </div>

        {/* 네 번째 행: 1개 제품 (중앙 정렬) */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            {products[11] && (
              <FeaturedProductCard
                product={products[11]}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={wishlist.has(products[11].id)}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* 뷰 모드 선택 */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-600">
          총 {products.length}개의 제품
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 mr-2">보기 방식:</span>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="flex items-center gap-2"
          >
            <Grid className="h-4 w-4" />
            그리드
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            리스트
          </Button>
          <Button
            variant={viewMode === "compact" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("compact")}
            className="flex items-center gap-2"
          >
            <Grid3X3 className="h-4 w-4" />
            컴팩트
          </Button>
        </div>
      </div>

      {/* 제품 그리드 */}
      {renderGridLayout()}
    </div>
  );
}
