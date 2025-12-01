"use client";

import { AdminDataTable } from "@/app/(admin)/admin/components/datatable/admin-data-table";
import { PATH } from "@/shared/consts/path";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import { getYoutubeChannelsList } from "@/serverActions/admin/youtube-channels.sa";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Input } from "@repo/ui/components/input";
import { Search, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AdminYoutubeChannelsView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchKeyword = searchParams.get("search") || "";
  const regionFilter = searchParams.get("region") || "all";
  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 30;

  const [keyword, setKeyword] = useState(searchKeyword);

  useEffect(() => {
    setKeyword(searchKeyword);
  }, [searchKeyword]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "channel",
      header: "채널 정보",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
            {row.original.thumbnailUrl ? (
              <Image
                src={row.original.thumbnailUrl}
                alt={row.original.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Youtube className="w-6 h-6 text-slate-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 truncate">
              {row.original.title || "제목 없음"}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {row.original.id}
            </div>
          </div>
        </div>
      ),
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
      accessorKey: "overallAvgView",
      header: "평균 조회수",
      cell: ({ row }) => {
        const avg = row.getValue("overallAvgView") as number | null;
        return (
          <div className="text-center">
            {avg !== null ? (
              <span className="text-sm text-slate-700">
                {Math.round(avg).toLocaleString()}
              </span>
            ) : (
              <span className="text-slate-400 text-xs">-</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "videoCount",
      header: "영상 수",
      cell: ({ row }) => {
        const count = row.getValue("videoCount") as number | null;
        return (
          <div className="text-center text-sm text-slate-700">
            {count !== null ? count.toLocaleString() : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "lastCrawledAt",
      header: "마지막 수집",
      cell: ({ row }) => {
        const date = row.getValue("lastCrawledAt") as Date | null;
        return (
          <div className="text-center text-xs text-slate-500">
            {date ? kdayjs(date).format("YYYY-MM-DD HH:mm") : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "관리",
      cell: ({ row }) => {
        const channelId = row.original.id;
        return (
          <div className="flex items-center justify-center gap-2">
            <Link
              href={`https://www.youtube.com/channel/${channelId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="text-xs">
                YouTube
              </Button>
            </Link>
          </div>
        );
      },
    },
  ];

  const queryName = "youtubeChannels";
  const params = {
    page,
    size,
    search: searchKeyword,
    regionCode: regionFilter !== "all" ? regionFilter : undefined,
  };

  const queryFn = async () => {
    try {
      const result = await getYoutubeChannelsList({
        page,
        size,
        search: searchKeyword,
        regionCode: regionFilter !== "all" ? regionFilter : undefined,
      });
      return result;
    } catch (error) {
      console.error("채널 목록 조회 실패:", error);
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
                    placeholder="채널 제목으로 검색..."
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
                        : "border-slate-300 text-slate-700 hover:bg-slate-50"
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
                        : "border-slate-300 text-slate-700 hover:bg-slate-50"
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
                        : "border-slate-300 text-slate-700 hover:bg-slate-50"
                    }
                  >
                    미국 (US)
                  </Button>
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
