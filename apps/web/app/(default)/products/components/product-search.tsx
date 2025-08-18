"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Search, X, TrendingUp, Clock, Star } from "lucide-react";

interface SearchSuggestion {
  id: string;
  text: string;
  type: "product" | "category" | "tag";
  icon: React.ComponentType<{ className?: string }>;
}

const mockSuggestions: SearchSuggestion[] = [
  { id: "1", text: "보컬 트레이닝", type: "category", icon: TrendingUp },
  { id: "2", text: "마이크", type: "product", icon: Star },
  { id: "3", text: "보컬 레슨", type: "product", icon: Clock },
  { id: "4", text: "음성 분석", type: "product", icon: Star },
  { id: "5", text: "워밍업", type: "tag", icon: TrendingUp },
  { id: "6", text: "프리미엄", type: "tag", icon: Star },
];

interface ProductSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export function ProductSearch({ onSearch, placeholder = "제품명, 카테고리, 태그로 검색..." }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim()) {
      // 실제 구현에서는 API 호출로 대체
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
    setSelectedIndex(-1);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query.trim());
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    onSearch?.(suggestion.text);
    setIsFocused(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]!);
        } else {
          handleSubmit(e);
        }
        break;
      case "Escape":
        setIsFocused(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={suggestionsRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-10 pr-10 h-12 text-base"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-4"
          disabled={!query.trim()}
        >
          검색
        </Button>
      </form>

      {/* 검색 제안 */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                index === selectedIndex ? "bg-blue-50" : ""
              }`}
            >
              <suggestion.icon className="h-4 w-4 text-gray-500" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{suggestion.text}</div>
                <div className="text-xs text-gray-500 capitalize">
                  {suggestion.type === "product" ? "제품" : 
                   suggestion.type === "category" ? "카테고리" : "태그"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 인기 검색어 */}
      {isFocused && query === "" && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <h4 className="text-sm font-medium text-gray-700">인기 검색어</h4>
          </div>
          <div className="p-2">
            <div className="flex flex-wrap gap-2">
              {["보컬 트레이닝", "마이크", "보컬 레슨", "음성 분석"].map((term) => (
                <Button
                  key={term}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery(term);
                    onSearch?.(term);
                  }}
                  className="text-xs"
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
