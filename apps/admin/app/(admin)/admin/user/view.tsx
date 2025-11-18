"use client";

import { AdminDataTable } from "@/app/(admin)/admin/components/datatable/admin-data-table";
import { PATH } from "@/consts/path";
import { kdayjs } from "@/lib/utils/dayjs";
import { getAdminUserList } from "@/serverActions/admin/user.sa";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayoutWrapper } from "@/app/(admin)/admin/components/layout/admin-layout-wrapper";
import { Button } from "@repo/ui/components/button";

export default function AdminUserClientView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 30;

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="text-center">
          {(row.getValue("id") as any)?.toString() || ""}
        </div>
      ),
    },
    {
      header: "닉네임",
      accessorKey: "nickname",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("nickname")}</div>
      ),
    },
    // {
    //   header: "계정 ID",
    //   accessorKey: "accountId",
    //   cell: ({ row }) => (
    //     <div className="text-center">{row.getValue("accountId")}</div>
    //   )
    // },
    // {
    //   header: "역할",
    //   accessorKey: "role",
    //   cell: ({ row }) => (
    //     <span
    //       className={`rounded px-2 py-1 text-xs font-medium ${
    //         row.getValue("role") === "ADMIN"
    //           ? "bg-red-100 text-red-800"
    //           : "bg-gray-100 text-gray-800"
    //       }`}
    //     >
    //       {row.getValue("role") === "ADMIN" ? "관리자" : "일반 사용자"}
    //     </span>
    //   )
    // },
    // {
    //   header: "상태",
    //   accessorKey: "status",
    //   cell: ({ row }) => (
    //     <span
    //       className={`rounded px-2 py-1 text-xs font-medium ${
    //         row.getValue("status") === "ACTIVE"
    //           ? "bg-green-100 text-green-800"
    //           : "bg-gray-100 text-gray-800"
    //       }`}
    //     >
    //       {row.getValue("status") === "ACTIVE" ? "활성" : "비활성"}
    //     </span>
    //   )
    // },
    // {
    //   header: "신규 사용자",
    //   accessorKey: "isNewUser",
    //   cell: ({ row }) => (
    //     <span
    //       className={`rounded px-2 py-1 text-xs font-medium ${
    //         row.getValue("isNewUser")
    //           ? "bg-blue-100 text-blue-800"
    //           : "bg-gray-100 text-gray-800"
    //       }`}
    //     >
    //       {row.getValue("isNewUser") ? "신규" : "기존"}
    //     </span>
    //   )
    // },
    // {
    //   header: "리뷰 수",
    //   accessorKey: "_count.reviews",
    //   cell: ({ row }) => (
    //     <div className="text-center">{row.original._count?.reviews || 0}</div>
    //   )
    // },
    {
      header: "수강 이력",
      accessorKey: "_count.enrollments",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original._count?.enrollments || 0}
        </div>
      ),
    },
    {
      header: "가입일",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <div className="text-center">
          {kdayjs(row.getValue("createdAt")).format("YYYY-MM-DD")}
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
              router.push(`${PATH.ADMIN_USER}/edit/${row.getValue("id")}`);
            }}
          >
            상세보기
          </Button>
          {/* <button
            className="rounded-md bg-red-500 px-2 py-1 text-sm text-white"
            onClick={() => {
              if (
                confirm(
                  "정말 이 사용자를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다."
                )
              ) {
                deleteAdminUser((row.getValue("id") as any)?.toString() || "");
                queryClient.invalidateQueries({ queryKey: ["adminUser"] });
              }
            }}
          >
            삭제
          </button> */}
        </div>
      ),
    },
  ];

  const queryName = "adminUser";
  const params = {
    page,
    size,
  };

  const queryFn = async () => {
    try {
      const result = await getAdminUserList({
        params,
        tableState: {},
        keyword: searchKeyword,
      });
      return result;
    } catch (error) {
      console.error("사용자 목록 조회 실패:", error);
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
    isCreateAvailable: false,
    searchBar: {
      placeholder: "닉네임으로 검색 (엔터키 입력)",
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
