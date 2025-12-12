"use client";

import { AdminDataTable } from "@/app/(admin)/admin/components/datatable/admin-data-table";
import { PATH } from "@/shared/consts/path";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import { getYoutubeVideosList } from "@/serverActions/admin/youtube-videos.sa";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Input } from "@repo/ui/components/input";
import { Search, Youtube, PlayCircle, Link as LinkIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCount } from "@/shared/lib/utils/numberFormat";
import { getCategoryName } from "@/shared/lib/utils/youtubeCategory";

export default function AdminYoutubeVideosView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchKeyword = searchParams.get("search") || "";
  const regionFilter = searchParams.get("region") || "all";
  const categoryFilter = searchParams.get("category") || "all";
  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 30;

  const [keyword, setKeyword] = useState(searchKeyword);

  useEffect(() => {
    setKeyword(searchKeyword);
  }, [searchKeyword]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "video",
      header: "영상 정보",
      cell: ({ row }) => {
        const video = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="relative w-24 h-16 rounded overflow-hidden bg-slate-100 flex-shrink-0">
              {video.thumbnailUrl ? (
                <Image
                  src={video.thumbnailUrl}
                  alt={video.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PlayCircle className="w-6 h-6 text-slate-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 truncate max-w-[300px]">
                {video.title || "제목 없음"}
              </div>
              <div className="text-xs text-slate-500 truncate mb-1">
                {video.id}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {video.categoryId && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    {getCategoryName(video.categoryId.toString())}
                  </Badge>
                )}
                {video.viewsPerHour !== null && (
                  <Badge variant="outline" className="text-xs">
                    VPH: {Math.round(video.viewsPerHour).toLocaleString()}
                  </Badge>
                )}
                {video.outlierVph !== null && (
                  <Badge
                    variant={video.outlierVph >= 3 ? "default" : "outline"}
                    className={
                      video.outlierVph >= 3
                        ? "bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs"
                        : "text-xs"
                    }
                  >
                    Outlier: {video.outlierVph.toFixed(2)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "channel",
      header: "채널",
      cell: ({ row }) => {
        const channel = row.original.channel;
        return (
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
              {channel?.thumbnailUrl ? (
                <Image
                  src={channel.thumbnailUrl}
                  alt={channel.title || ""}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Youtube className="w-4 h-4 text-slate-400" />
                </div>
              )}
            </div>
            <div className="text-sm text-slate-700 truncate max-w-[100px]">
              {channel?.title || "-"}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "regionCode",
      header: "지역",
      cell: ({ row }) => {
        const region = row.getValue("regionCode") as string | null;
        return (
          <div className="text-center">
            {region ? (
              <Badge variant="outline" className="text-xs">
                {region}
              </Badge>
            ) : (
              <span className="text-slate-400 text-xs">-</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "viewCount",
      header: "조회수",
      cell: ({ row }) => {
        const count = row.getValue("viewCount") as number;
        return (
          <div className="text-center text-sm text-slate-700">
            {formatCount(count)}
          </div>
        );
      },
    },
    {
      accessorKey: "viewsPerHour",
      header: "VPH",
      cell: ({ row }) => {
        const vph = row.getValue("viewsPerHour") as number | null;
        return (
          <div className="text-center text-sm text-slate-700">
            {vph !== null ? Math.round(vph).toLocaleString() : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "outlierVph",
      header: "Outlier VPH",
      cell: ({ row }) => {
        const outlier = row.getValue("outlierVph") as number | null;
        return (
          <div className="text-center">
            {outlier !== null ? (
              <Badge
                variant={outlier >= 3 ? "default" : "outline"}
                className={
                  outlier >= 3
                    ? "bg-gradient-to-r from-red-600 to-orange-600 text-white"
                    : ""
                }
              >
                {outlier.toFixed(2)}
              </Badge>
            ) : (
              <span className="text-slate-400 text-xs">-</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "outlierView",
      header: "Outlier View",
      cell: ({ row }) => {
        const outlier = row.getValue("outlierView") as number | null;
        return (
          <div className="text-center">
            {outlier !== null ? (
              <Badge
                variant={outlier >= 2 ? "default" : "outline"}
                className={
                  outlier >= 2
                    ? "bg-gradient-to-r from-[#10B981] to-[#059669] text-white"
                    : ""
                }
              >
                {outlier.toFixed(2)}
              </Badge>
            ) : (
              <span className="text-slate-400 text-xs">-</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "outlierSubscriber",
      header: "Outlier (Sub)",
      cell: ({ row }) => {
        const outlier = row.getValue("outlierSubscriber") as number | null;
        return (
          <div className="text-center">
            {outlier !== null ? (
              <Badge
                variant={outlier >= 2 ? "default" : "outline"}
                className={
                  outlier >= 2
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                    : ""
                }
              >
                {outlier.toFixed(2)}
              </Badge>
            ) : (
              <span className="text-slate-400 text-xs">-</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "publishedAt",
      header: "게시일",
      cell: ({ row }) => {
        const date = row.getValue("publishedAt") as Date | null;
        return (
          <div className="text-center text-xs text-slate-500">
            {date ? kdayjs(date).format("YYYY-MM-DD") : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "채널 링크",
      cell: ({ row }) => {
        const videoId = row.original.id;
        return (
          <div className="flex items-center justify-center gap-2">
            <Link
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="text-xs">
                <LinkIcon />  
              </Button>
            </Link>
          </div>
        );
      },
    },
  ];

  const queryName = "youtubeVideos";
  const params = {
    page,
    size,
    search: searchKeyword,
    regionCode: regionFilter !== "all" ? regionFilter : undefined,
    categoryId: categoryFilter !== "all" ? Number(categoryFilter) : undefined,
  };

  const queryFn = async () => {
    try {
      const result = await getYoutubeVideosList({
        page,
        size,
        search: searchKeyword,
        regionCode: regionFilter !== "all" ? regionFilter : undefined,
        categoryId: categoryFilter !== "all" ? Number(categoryFilter) : undefined,
      });
      return result;
    } catch (error) {
      console.error("영상 목록 조회 실패:", error);
      return { data: [], total: 0, totalPages: 0, page: 1, size: 30 };
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (keyword.trim()) {
      params.set("search", keyword.trim());
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const options = {
    isCreateAvailable: false,
  };

  return (
    <>
      {/* 필터 모듈 */}
      <Card className="mb-6 max-w-screen-xl mx-auto rounded-lg bg-white shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* 검색 섹션 */}
            <div className="pb-4 border-b border-slate-200">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                검색
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="영상 제목으로 검색..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-10 h-10 border-slate-300 focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-red-600 to-orange-600 text-white hover:opacity-90 px-6 h-10"
                >
                  검색
                </Button>
              </div>
            </div>

            {/* 필터 섹션 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 지역 필터 */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-900">
                  지역
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={regionFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange("region", "all")}
                    className={
                      regionFilter === "all"
                        ? "bg-slate-700 text-white hover:bg-slate-800"
                        : "border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }
                  >
                    전체
                  </Button>
                  <Button
                    variant={regionFilter === "KR" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange("region", "KR")}
                    className={
                      regionFilter === "KR"
                        ? "bg-gradient-to-r from-red-600 to-orange-600 text-white hover:opacity-90"
                        : "border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }
                  >
                    한국 (KR)
                  </Button>
                  <Button
                    variant={regionFilter === "US" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange("region", "US")}
                    className={
                      regionFilter === "US"
                        ? "bg-gradient-to-r from-red-600 to-orange-600 text-white hover:opacity-90"
                        : "border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }
                  >
                    미국 (US)
                  </Button>
                </div>
              </div>

              {/* 카테고리 필터 */}
              <div className="space-y-3 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-900">
                  카테고리
                </label>
                <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Button
                    variant={categoryFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange("category", "all")}
                    className={
                      categoryFilter === "all"
                        ? "bg-slate-700 text-white hover:bg-slate-800 shadow-sm"
                        : "border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400"
                    }
                  >
                    전체
                  </Button>
                  {[
                    { id: "1", name: "영화 & 애니메이션" },
                    { id: "2", name: "자동차 & 차량" },
                    { id: "10", name: "음악" },
                    { id: "15", name: "반려동물 & 동물" },
                    { id: "17", name: "스포츠" },
                    { id: "18", name: "단편 영화" },
                    { id: "19", name: "여행 & 이벤트" },
                    { id: "20", name: "게임" },
                    { id: "21", name: "비디오 블로그" },
                    { id: "22", name: "인물 & 블로그" },
                    { id: "23", name: "코미디" },
                    { id: "24", name: "엔터테인먼트" },
                    { id: "25", name: "뉴스 & 정치" },
                    { id: "26", name: "노하우 & 스타일" },
                    { id: "27", name: "교육" },
                    { id: "28", name: "과학 & 기술" },
                    { id: "30", name: "영화" },
                    { id: "31", name: "애니메이션" },
                    { id: "32", name: "액션/어드벤처" },
                    { id: "33", name: "클래식" },
                    { id: "34", name: "코미디" },
                    { id: "35", name: "다큐멘터리" },
                    { id: "36", name: "드라마" },
                    { id: "37", name: "가족" },
                    { id: "38", name: "해외" },
                    { id: "39", name: "공포" },
                    { id: "40", name: "SF/판타지" },
                    { id: "41", name: "스릴러" },
                    { id: "42", name: "쇼츠" },
                    { id: "43", name: "쇼" },
                    { id: "44", name: "예고편" },
                  ].map((cat) => (
                    <Button
                      key={cat.id}
                      variant={categoryFilter === cat.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange("category", cat.id)}
                      className={
                        categoryFilter === cat.id
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:opacity-90 shadow-sm"
                          : "border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-blue-400"
                      }
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 데이터 테이블 */}
      <AdminDataTable
        columns={columns}
        queryName={queryName}
        params={params}
        queryFn={queryFn}
        options={options}
      />
    </>
  );
}
