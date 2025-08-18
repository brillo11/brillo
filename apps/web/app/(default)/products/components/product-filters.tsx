"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Slider } from "@repo/ui/components/slider";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Label } from "@repo/ui/components/label";
import { Separator } from "@repo/ui/components/separator";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";

const categories = [
  "보컬 트레이닝",
  "소프트웨어",
  "하드웨어",
  "도서",
  "온라인 레슨",
  "악기",
  "건강식품",
  "스튜디오",
  "마스터 클래스",
  "의상",
  "오디오",
];

const tags = [
  "초급", "중급", "고급", "기초", "분석", "전문가", "고품질", "워밍업",
  "가이드", "1:1", "연습용", "휴대용", "보조제", "건강", "퍼포먼스",
  "스타일", "커버", "테크닉"
];

const priceRanges = [
  { label: "3만원 이하", min: 0, max: 30000 },
  { label: "3만원 ~ 10만원", min: 30000, max: 100000 },
  { label: "10만원 ~ 30만원", min: 100000, max: 300000 },
  { label: "30만원 이상", min: 300000, max: 1000000 },
];

interface FilterState {
  categories: Set<string>;
  tags: Set<string>;
  priceRange: [number, number];
  inStockOnly: boolean;
  hasDiscount: boolean;
  isNew: boolean;
  isHot: boolean;
}

export function ProductFilters() {
  const [isOpen, setIsOpen] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    categories: new Set(),
    tags: new Set(),
    priceRange: [0, 1000000],
    inStockOnly: false,
    hasDiscount: false,
    isNew: false,
    isHot: false,
  });

  const toggleCategory = (category: string) => {
    const newCategories = new Set(filters.categories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setFilters(prev => ({ ...prev, categories: newCategories }));
  };

  const toggleTag = (tag: string) => {
    const newTags = new Set(filters.tags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setFilters(prev => ({ ...prev, tags: newTags }));
  };

  const clearFilters = () => {
    setFilters({
      categories: new Set(),
      tags: new Set(),
      priceRange: [0, 1000000],
      inStockOnly: false,
      hasDiscount: false,
      isNew: false,
      isHot: false,
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.categories.size > 0) count++;
    if (filters.tags.size > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) count++;
    if (filters.inStockOnly) count++;
    if (filters.hasDiscount) count++;
    if (filters.isNew) count++;
    if (filters.isHot) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">필터</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-1" />
              초기화
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-6">
          {/* 카테고리 필터 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">카테고리</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.categories.has(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* 태그 필터 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">태그</h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={filters.tags.has(tag) ? "default" : "secondary"}
                  className={`cursor-pointer transition-colors ${
                    filters.tags.has(tag)
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* 가격 범위 필터 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">가격 범위</h4>
            <div className="px-2">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                max={1000000}
                min={0}
                step={10000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>{filters.priceRange[0].toLocaleString()}원</span>
                <span>{filters.priceRange[1].toLocaleString()}원</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {priceRanges.map((range) => (
                <Button
                  key={range.label}
                  variant="outline"
                  size="sm"
                  className={`text-xs ${
                    filters.priceRange[0] === range.min && filters.priceRange[1] === range.max
                      ? "border-blue-600 text-blue-600"
                      : ""
                  }`}
                  onClick={() => setFilters(prev => ({ ...prev, priceRange: [range.min, range.max] }))}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* 기타 옵션 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">기타 옵션</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inStockOnly"
                  checked={filters.inStockOnly}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, inStockOnly: !!checked }))}
                />
                <Label htmlFor="inStockOnly" className="text-sm text-gray-700 cursor-pointer">
                  재고 있는 상품만
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasDiscount"
                  checked={filters.hasDiscount}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasDiscount: !!checked }))}
                />
                <Label htmlFor="hasDiscount" className="text-sm text-gray-700 cursor-pointer">
                  할인 상품만
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isNew"
                  checked={filters.isNew}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, isNew: !!checked }))}
                />
                <Label htmlFor="isNew" className="text-sm text-gray-700 cursor-pointer">
                  신상품만
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isHot"
                  checked={filters.isHot}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, isHot: !!checked }))}
                />
                <Label htmlFor="isHot" className="text-sm text-gray-700 cursor-pointer">
                  인기 상품만
                </Label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
