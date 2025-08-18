"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { ArrowUpDown, ArrowUp, ArrowDown, Star, TrendingUp, Clock } from "lucide-react";

export type SortOption = 
  | "popularity"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "newest"
  | "name-asc"
  | "name-desc";

interface SortOptionConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: SortOption;
}

const sortOptions: SortOptionConfig[] = [
  {
    label: "인기도순",
    icon: TrendingUp,
    value: "popularity"
  },
  {
    label: "가격 낮은순",
    icon: ArrowUp,
    value: "price-asc"
  },
  {
    label: "가격 높은순",
    icon: ArrowDown,
    value: "price-desc"
  },
  {
    label: "평점순",
    icon: Star,
    value: "rating"
  },
  {
    label: "최신순",
    icon: Clock,
    value: "newest"
  },
  {
    label: "이름순",
    icon: ArrowUpDown,
    value: "name-asc"
  },
  {
    label: "이름 역순",
    icon: ArrowUpDown,
    value: "name-desc"
  }
];

interface ProductSortProps {
  currentSort?: SortOption;
  onSortChange?: (sort: SortOption) => void;
}

export function ProductSort({ currentSort = "popularity", onSortChange }: ProductSortProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSortChange = (sort: SortOption) => {
    onSortChange?.(sort);
    setIsOpen(false);
  };

  const currentSortOption = sortOptions.find(option => option.value === currentSort);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">정렬</h3>
        
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[160px] justify-between">
              <div className="flex items-center gap-2">
                {currentSortOption && (
                  <>
                    <currentSortOption.icon className="h-4 w-4" />
                    <span>{currentSortOption.label}</span>
                  </>
                )}
              </div>
              <ArrowUpDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`cursor-pointer ${
                  currentSort === option.value ? "bg-blue-50 text-blue-700" : ""
                }`}
              >
                <option.icon className="h-4 w-4 mr-2" />
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
