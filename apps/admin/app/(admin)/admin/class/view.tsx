"use client";

import { AdminDataTable } from "@/app/(admin)/admin/components/datatable/admin-data-table";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import { getAdminClassList } from "@/serverActions/admin/class.sa";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayoutWrapper } from "@/app/(admin)/admin/components/layout/admin-layout-wrapper";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";

export default function AdminClassClientView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 30;

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "title",
      header: "기수명",
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {(row.getValue("title") as string) || ""}
        </div>
      ),
    },
    {
      accessorKey: "slug",
      header: "슬러그",
      cell: ({ row }) => (
        <div className="text-center text-gray-600">
          {(row.getValue("slug") as string) || ""}
        </div>
      ),
    },
    {
      accessorKey: "_count.users",
      header: "학생 수",
      cell: ({ row }) => {
        const userCount = (row.original._count?.users as number) || 0;
        return (
          <div className="text-center">
            <Badge variant="outline">{userCount}명</Badge>
          </div>
        );
      },
    },
    {
      header: "생성일",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <div className="text-center">
          {kdayjs(row.getValue("createdAt")).format("YYYY-MM-DD")}
        </div>
      ),
    },
    {
      header: "수정일",
      accessorKey: "updatedAt",
      cell: ({ row }) => (
        <div className="text-center">
          {kdayjs(row.getValue("updatedAt")).format("YYYY-MM-DD")}
        </div>
      ),
    },
    {
      header: "관리",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="space-x-2 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              router.push(`/admin/class/edit/${row.original.id}`);
            }}
          >
            상세보기
          </Button>
        </div>
      ),
    },
  ];

  const queryName = "adminClass";
  const params = {
    page,
    size,
  };

  const queryFn = async () => {
    try {
      const result = await getAdminClassList({
        params,
        tableState: {},
        keyword: searchKeyword,
      });
      return result;
    } catch (error) {
      console.error("기수 목록 조회 실패:", error);
      return { data: [], total: 0, totalPages: 0 };
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setSearchKeyword(keyword);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [queryName] });
        queryClient.refetchQueries({ queryKey: [queryName] });
      }, 0);
    }
  };

  const options = {
    isCreateAvailable: true,
    onCreateClick: () => {
      router.push("/admin/class/new");
    },
    searchBar: {
      placeholder: "기수명 또는 슬러그로 검색 (엔터키 입력)",
      value: keyword,
      onChange: (value: string) => setKeyword(value),
      onKeyDown: handleSearch,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminLayoutWrapper>
        <AdminDataTable
          columns={columns}
          queryName={queryName}
          params={params}
          queryFn={queryFn}
          options={options}
        />
      </AdminLayoutWrapper>
    </div>
  );
}

