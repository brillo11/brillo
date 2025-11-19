"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Star } from "lucide-react";

export interface Product {
  id: number;
  icon: string;
  title: string;
  description: string;
  price: string;
  href: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  badge?: "베스트" | "신규";
}

interface ProductListProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
  showRating?: boolean;
}

export function ProductList({
  products,
  title = "연화당의 사주 서비스",
  subtitle = "다양한 관점에서 여러분의 인생을 깊이 있게 분석해드립니다",
  showFilters = false,
  showRating = false,
}: ProductListProps) {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortBy, setSortBy] = useState("인기순");

  // 카테고리 목록 추출
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) {
        // 카테고리 매핑 (HTML 기준)
        if (p.category.includes("종합") || p.title.includes("종합")) {
          cats.add("종합사주");
        } else if (
          p.category.includes("인간") ||
          p.title.includes("궁합") ||
          p.title.includes("자녀")
        ) {
          cats.add("인간관계");
        } else if (p.category.includes("운세") || p.title.includes("운")) {
          cats.add("운세");
        } else if (
          p.title.includes("택일") ||
          p.title.includes("이사") ||
          p.title.includes("결혼")
        ) {
          cats.add("택일");
        }
      }
    });
    return Array.from(cats);
  }, [products]);

  // 필터링 및 정렬
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // 카테고리 필터
    if (selectedCategory !== "전체") {
      filtered = filtered.filter((p) => {
        if (selectedCategory === "종합사주") {
          return p.category?.includes("종합") || p.title.includes("종합");
        } else if (selectedCategory === "인간관계") {
          return (
            p.category?.includes("인간") ||
            p.title.includes("궁합") ||
            p.title.includes("자녀")
          );
        } else if (selectedCategory === "운세") {
          return p.category?.includes("운세") || p.title.includes("운");
        } else if (selectedCategory === "택일") {
          return (
            p.title.includes("택일") ||
            p.title.includes("이사") ||
            p.title.includes("결혼")
          );
        }
        return true;
      });
    }

    // 정렬
    if (sortBy === "인기순") {
      filtered = [...filtered].sort(
        (a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)
      );
    } else if (sortBy === "가격 낮은순") {
      filtered = [...filtered].sort((a, b) => {
        const priceA = parseInt(a.price.replace(/[^0-9]/g, "")) || 0;
        const priceB = parseInt(b.price.replace(/[^0-9]/g, "")) || 0;
        return priceA - priceB;
      });
    } else if (sortBy === "가격 높은순") {
      filtered = [...filtered].sort((a, b) => {
        const priceA = parseInt(a.price.replace(/[^0-9]/g, "")) || 0;
        const priceB = parseInt(b.price.replace(/[^0-9]/g, "")) || 0;
        return priceB - priceA;
      });
    } else if (sortBy === "평점순") {
      filtered = [...filtered].sort(
        (a, b) => (b.rating || 0) - (a.rating || 0)
      );
    }

    return filtered;
  }, [products, selectedCategory, sortBy]);

  const renderStars = (rating: number = 0) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <div className="flex items-center justify-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
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
    <div className="flex flex-col">
      {/* 페이지 헤더 */}
      {showFilters && (
        <div className="bg-white px-5 py-6 text-center border-b border-[#F2779C]/10">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">{title}</h1>
          <p className="text-sm text-[#7f8c8d]">{subtitle}</p>
        </div>
      )}

      {/* 필터 섹션 */}
      {showFilters && (
        <div className="bg-white px-5 py-4 border-b border-[#F2779C]/10">
          <div className="max-w-7xl mx-auto flex justify-between items-center gap-4 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory("전체")}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border-2 ${
                  selectedCategory === "전체"
                    ? "border-[#F2779C] bg-gradient-to-r from-[#F2779C] to-[#3BB4C1] text-white"
                    : "border-gray-300 bg-white text-[#7f8c8d] hover:border-[#F2779C]"
                }`}
              >
                전체
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border-2 ${
                    selectedCategory === cat
                      ? "border-[#F2779C] bg-gradient-to-r from-[#F2779C] to-[#3BB4C1] text-white"
                      : "border-gray-300 bg-white text-[#7f8c8d] hover:border-[#F2779C]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] border-2 border-gray-300 rounded-lg text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="인기순">인기순</SelectItem>
                <SelectItem value="가격 낮은순">가격 낮은순</SelectItem>
                <SelectItem value="가격 높은순">가격 높은순</SelectItem>
                <SelectItem value="평점순">평점순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* 상품 그리드 */}
      <section
        className={`${
          showFilters
            ? "bg-gradient-to-br from-[#F9EBDD] to-[#FAF0E6]"
            : "bg-white"
        } px-5 py-5`}
      >
        <div className="max-w-7xl mx-auto">
          {!showFilters && (
            <>
              <h2 className="text-center text-2xl font-bold text-[#2C3E50] mb-2">
                {title}
              </h2>
              <p className="text-center text-xs text-[#7f8c8d] mb-5">
                {subtitle}
              </p>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAndSortedProducts.map((product) => (
              <Link
                key={product.id}
                href={product.href}
                className="bg-white rounded-2xl p-5 text-center shadow-md transition-all hover:-translate-y-1 hover:shadow-lg border-2 border-transparent hover:border-[#F2779C]/30 relative block"
              >
                {/* 상단 그라데이션 바 */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F2779C] to-[#3BB4C1] rounded-t-2xl" />

                {/* 배지 */}
                {product.badge && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-[#F2779C] to-[#3BB4C1] text-white px-2.5 py-1 rounded-xl text-[11px] font-semibold">
                    {product.badge}
                  </div>
                )}

                <div className="text-4xl mb-2">{product.icon}</div>

                {/* 카테고리 */}
                {product.category && (
                  <div className="text-[#F2779C] text-[11px] font-semibold uppercase tracking-wide mb-1.5">
                    {product.category}
                  </div>
                )}

                <h3 className="text-lg font-semibold text-[#2C3E50] mb-1.5">
                  {product.title}
                </h3>

                {/* 별점 및 리뷰 */}
                {showRating && (product.rating || product.reviewCount) && (
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {renderStars(product.rating || 0)}
                    <span className="text-[11px] text-[#7f8c8d]">
                      ({product.reviewCount || 0})
                    </span>
                  </div>
                )}

                <p className="text-[#7f8c8d] text-xs leading-snug mb-2.5 line-clamp-2">
                  {product.description}
                </p>
                <div className="text-xl font-bold text-[#F2779C] mb-3">
                  {product.price}
                </div>
                <Button className="w-full bg-gradient-to-r from-[#F2779C] to-[#3BB4C1] text-white px-5 py-2 rounded-2xl text-xs font-semibold border-none hover:opacity-90 hover:-translate-y-0.5 hover:shadow-md transition-all">
                  자세히 보기
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
