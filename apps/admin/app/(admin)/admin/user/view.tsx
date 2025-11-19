"use client";

import { AdminDataTable } from "@/app/(admin)/admin/components/datatable/admin-data-table";
import { PATH } from "@/shared/consts/path";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import { getAdminUserList } from "@/serverActions/admin/user.sa";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayoutWrapper } from "@/app/(admin)/admin/components/layout/admin-layout-wrapper";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Input } from "@repo/ui/components/input";
import { GraduationCap, ShieldCheck, Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export default function AdminUserClientView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // QueryString에서 필터 값 가져오기
  const roleFilter = searchParams.get("role") || "USER";
  const statusFilter = searchParams.get("status") || "all";
  const searchKeyword = searchParams.get("search") || "";

  const [keyword, setKeyword] = useState(searchKeyword);
  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 30;

  // QueryString 변경 시 keyword 동기화
  useEffect(() => {
    setKeyword(searchKeyword);
  }, [searchKeyword]);

  const columns: ColumnDef<any>[] = [
    // {
    //   accessorKey: "id",
    //   header: "ID",
    //   cell: ({ row }) => (
    //     <div className="text-center">
    //       {(row.getValue("id") as any)?.toString() || ""}
    //     </div>
    //   ),
    // },
    {
      accessorKey: "nickname",
      header: "닉네임",
      cell: ({ row }) => (
        <div className="text-center">
          {(row.getValue("nickname") as string) || ""}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "상태",
      cell: ({ row }) => {
        const status = (row.getValue("status") as string) || "";
        return (
          <div className="text-center">
            {status === "PENDING" && (
              <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                대기
              </Badge>
            )}
            {status === "ACTIVE" && (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                활성
              </Badge>
            )}
            {status === "INACTIVE" && (
              <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                비활성
              </Badge>
            )}
            {!["PENDING", "ACTIVE", "INACTIVE"].includes(status) && (
              <Badge variant="outline">{status}</Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "역할",
      cell: ({ row }) => {
        const role = (row.getValue("role") as string) || "";
        return (
          <div className="text-center">
            {role === "USER" && (
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                학생
              </Badge>
            )}
            {role === "ADMIN" && (
              <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                관리자
              </Badge>
            )}
            {!["USER", "ADMIN"].includes(role) && (
              <Badge variant="outline">{role}</Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "이메일",
      cell: ({ row }) => (
        <div className="text-center">
          {(row.getValue("email") as string) || ""}
        </div>
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
    // {
    //   header: "수강 이력",
    //   accessorKey: "_count.enrollments",
    //   cell: ({ row }) => (
    //     <div className="text-center">
    //       {row.original._count?.enrollments || 0}
    //     </div>
    //   ),
    // },
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
    role: roleFilter !== "all" ? roleFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchKeyword,
  };

  const queryFn = async () => {
    try {
      const result = await getAdminUserList({
        params: { page, size },
        tableState: {},
        keyword: searchKeyword,
        role: roleFilter !== "all" ? roleFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      console.log(result);
      return result;
    } catch (error) {
      console.error("사용자 목록 조회 실패:", error);
      return { data: [], total: 0, totalPages: 0 };
    }
  };

  // 필터 변경 핸들러
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set("page", "1"); // 필터 변경 시 첫 페이지로
    router.push(`?${params.toString()}`);
  };

  // 검색 핸들러
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
    <div className="min-h-screen bg-gray-50">
      <AdminLayoutWrapper>
        {/* 필터모듈 */}
        <Card className="mb-6 max-w-screen-xl mx-auto space-y-4 rounded-lg bg-white">
          <CardContent>
            {/* 수강생/관리자 구분 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                사용자 유형
              </label>
              <div className="flex gap-2">
                <Button
                  variant={roleFilter === "USER" ? "default" : "outline"}
                  className={cn(
                    "flex items-center gap-2",
                    roleFilter === "USER" && "bg-blue-600 hover:bg-blue-700"
                  )}
                  onClick={() => handleFilterChange("role", "USER")}
                >
                  <GraduationCap className="h-4 w-4" />
                  수강생
                </Button>
                <Button
                  variant={roleFilter === "ADMIN" ? "default" : "outline"}
                  className={cn(
                    "flex items-center gap-2",
                    roleFilter === "ADMIN" && "bg-red-600 hover:bg-red-700"
                  )}
                  onClick={() => handleFilterChange("role", "ADMIN")}
                >
                  <ShieldCheck className="h-4 w-4" />
                  관리자
                </Button>
              </div>
            </div>

            {/* 활성상태 구분 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">상태</label>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("status", "all")}
                >
                  전체
                </Button>
                <Button
                  variant={statusFilter === "ACTIVE" ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    statusFilter === "ACTIVE" &&
                      "bg-green-600 hover:bg-green-700"
                  )}
                  onClick={() => handleFilterChange("status", "ACTIVE")}
                >
                  활성
                </Button>
                <Button
                  variant={statusFilter === "PENDING" ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    statusFilter === "PENDING" &&
                      "bg-yellow-600 hover:bg-yellow-700"
                  )}
                  onClick={() => handleFilterChange("status", "PENDING")}
                >
                  대기
                </Button>
                <Button
                  variant={statusFilter === "INACTIVE" ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    statusFilter === "INACTIVE" &&
                      "bg-gray-600 hover:bg-gray-700"
                  )}
                  onClick={() => handleFilterChange("status", "INACTIVE")}
                >
                  비활성
                </Button>
              </div>
            </div>

            {/* 이름/닉네임 검색 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                이름/닉네임 검색
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="이름/닉네임 검색"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch}>검색</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 데이타테이블 */}
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
