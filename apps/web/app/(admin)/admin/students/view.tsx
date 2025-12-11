"use client";

import { AdminDataTable } from "@/app/(admin)/admin/components/datatable/admin-data-table";
import { PATH } from "@/shared/consts/path";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import {
  getAdminUserList,
  updateAdminUser,
  deleteAdminUser,
} from "@/serverActions/admin/user.sa";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayoutWrapper } from "@/app/(admin)/admin/components/layout/admin-layout-wrapper";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Input } from "@repo/ui/components/input";
import { GraduationCap, ShieldCheck, Search, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/alert-dialog";
import { toast } from "sonner";

// 사용자 액션 셀 컴포넌트
function UserActionsCell({
  user,
  queryName,
  router,
}: {
  user: any;
  queryName: string;
  router: ReturnType<typeof useRouter>;
}) {
  const queryClient = useQueryClient();
  const isAdmin = user.role === "ADMIN";
  const isStudent = user.role === "STUDENT";
  const needsApproval =
    isStudent && (user.status === "UNKNOWN" || user.status === "PENDING");

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const handleRoleChange = async () => {
    try {
      setIsUpdating(true);
      await updateAdminUser(user.id, { role: "STUDENT" });
      toast.success("역할이 변경되었습니다.");
      queryClient.invalidateQueries({ queryKey: [queryName] });
    } catch (error) {
      console.error("역할 변경 실패:", error);
      toast.error("역할 변경에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await updateAdminUser(user.id, { status: "ACTIVE" });
      toast.success("사용자가 승인되었습니다.");
      queryClient.invalidateQueries({ queryKey: [queryName] });
    } catch (error) {
      console.error("승인 실패:", error);
      toast.error("승인 처리에 실패했습니다.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleDecline = async () => {
    try {
      setIsDeclining(true);
      await updateAdminUser(user.id, { status: "INACTIVE" });
      toast.success("사용자가 거부되었습니다.");
      queryClient.invalidateQueries({ queryKey: [queryName] });
    } catch (error) {
      console.error("거부 실패:", error);
      toast.error("거부 처리에 실패했습니다.");
    } finally {
      setIsDeclining(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteAdminUser(user.id);
      toast.success(
        isAdmin ? "관리자가 삭제되었습니다." : "사용자가 삭제되었습니다."
      );
      queryClient.invalidateQueries({ queryKey: [queryName] });
    } catch (error) {
      console.error("삭제 실패:", error);
      toast.error("삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {/* STUDENT이고 UNKNOWN 또는 PENDING인 경우 */}
      {needsApproval && (
        <>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-50"
                disabled={isApproving}
              >
                Approve
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>사용자 승인</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-2">
                    <p>이 사용자를 승인하시겠습니까?</p>
                    <div className="p-3 bg-gray-50 rounded border-l-4 border-green-500">
                      <p className="font-medium text-gray-900">
                        {user.name || user.nickname || user.email}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        현재 상태:{" "}
                        {user.status === "PENDING" ? "대기" : "알 수 없음"}
                      </p>
                    </div>
                    <p className="text-green-600 font-medium">
                      승인 시 상태가 <strong>활성</strong>으로 변경됩니다.
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isApproving}>
                  취소
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isApproving}
                >
                  {isApproving ? "승인 중..." : "승인 확인"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={isDeclining}
              >
                Decline
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>사용자 거부</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-2">
                    <p>이 사용자를 거부하시겠습니까?</p>
                    <div className="p-3 bg-gray-50 rounded border-l-4 border-gray-500">
                      <p className="font-medium text-gray-900">
                        {user.name || user.nickname || user.email}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        현재 상태:{" "}
                        {user.status === "PENDING" ? "대기" : "알 수 없음"}
                      </p>
                    </div>
                    <p className="text-gray-600 font-medium">
                      거부 시 상태가 <strong>비활성</strong>으로 변경됩니다.
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeclining}>
                  취소
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDecline}
                  className="bg-gray-600 hover:bg-gray-700"
                  disabled={isDeclining}
                >
                  {isDeclining ? "거부 중..." : "거부 확인"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>사용자 삭제</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-2">
                    <p>정말로 이 사용자를 삭제하시겠습니까?</p>
                    <div className="p-3 bg-gray-50 rounded border-l-4 border-red-500">
                      <p className="font-medium text-gray-900">
                        {user.name || user.nickname || user.email}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        사용자 ID: {user.id}
                      </p>
                    </div>
                    <p className="text-red-600 font-medium">
                      ⚠️ 삭제된 사용자와 계정 정보는 복구할 수 없습니다.
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  취소
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? "삭제 중..." : "삭제 확인"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {/* ADMIN인 경우 */}
      {isAdmin && (
        <>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                disabled={isUpdating}
              >
                학생으로 변경
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>역할 변경</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-2">
                    <p>
                      이 관리자의 역할을 <strong>Student</strong>로
                      변경하시겠습니까?
                    </p>
                    <div className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                      <p className="font-medium text-gray-900">
                        {user.name || user.nickname || user.email}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        현재 역할: 관리자
                      </p>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isUpdating}>
                  취소
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRoleChange}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isUpdating}
                >
                  {isUpdating ? "변경 중..." : "변경 확인"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>관리자 삭제</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-2">
                    <p>정말로 이 관리자를 삭제하시겠습니까?</p>
                    <div className="p-3 bg-gray-50 rounded border-l-4 border-red-500">
                      <p className="font-medium text-gray-900">
                        {user.name || user.nickname || user.email}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        관리자 ID: {user.id}
                      </p>
                    </div>
                    <p className="text-red-600 font-medium">
                      ⚠️ 삭제된 관리자는 복구할 수 없습니다.
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  취소
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? "삭제 중..." : "삭제 확인"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}

export default function AdminUserClientView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // QueryString에서 필터 값 가져오기
  const roleFilter = searchParams.get("role") || "STUDENT";
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
    {
      accessorKey: "userinfo",
      header: "유저 정보",
      cell: ({ row }) => (
        <div className="text-left">
          <div className="font-bold">{row.original.nickname || ""}</div>
          <div className="text-xs text-gray-500">{row.original.name || ""}</div>
          <div className="text-xs text-gray-500">
            {row.original.email || ""}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "역할",
      cell: ({ row }) => {
        const role = (row.getValue("role") as string) || "";
        return (
          <div className="text-center">
            {role === "STUDENT" && (
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                학생
              </Badge>
            )}
            {role === "ADMIN" && (
              <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                관리자
              </Badge>
            )}
            {!["STUDENT", "ADMIN"].includes(role) && (
              <Badge variant="outline">{role}</Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "cohort",
      header: "기수",
      cell: ({ row }) => {
        return (
          <div className="text-center">{row.original.cohort?.title || "-"}</div>
        );
      },
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
      cell: ({ row }) => {
        return (
          <UserActionsCell
            user={row.original}
            queryName={queryName}
            router={router}
          />
        );
      },
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
        <Card className="mb-6 max-w-screen-xl mx-auto rounded-lg bg-white shadow-sm border border-slate-200">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* 검색 섹션 - 상단 강조 */}
              <div className="pb-4 border-b border-slate-200">
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  검색
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="이름 또는 닉네임으로 검색..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      className="pl-10 h-10 border-slate-300 focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-[#3B82F6] to-[#1E3A8A] text-white hover:opacity-90 px-6 h-10"
                  >
                    검색
                  </Button>
                </div>
              </div>

              {/* 필터 섹션 - 그리드 레이아웃 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 사용자 유형 */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-900">
                    사용자 유형
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={roleFilter === "STUDENT" ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "flex items-center gap-2 transition-all",
                        roleFilter === "STUDENT"
                          ? "bg-gradient-to-r from-[#3B82F6] to-[#1E3A8A] text-white hover:opacity-90 shadow-sm"
                          : "border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-[#3B82F6] hover:text-[#3B82F6]"
                      )}
                      onClick={() => handleFilterChange("role", "STUDENT")}
                    >
                      <GraduationCap className="h-4 w-4" />
                      수강생
                    </Button>
                    <Button
                      variant={roleFilter === "ADMIN" ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "flex items-center gap-2 transition-all",
                        roleFilter === "ADMIN"
                          ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:opacity-90 shadow-sm"
                          : "border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-red-600 hover:text-red-600"
                      )}
                      onClick={() => handleFilterChange("role", "ADMIN")}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      관리자
                    </Button>
                  </div>
                </div>

                {/* 상태 필터 */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-900">
                    상태
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={statusFilter === "all" ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "transition-all",
                        statusFilter === "all"
                          ? "bg-slate-700 text-white hover:bg-slate-800 shadow-sm"
                          : "border-slate-300 text-slate-700 hover:bg-slate-50"
                      )}
                      onClick={() => handleFilterChange("status", "all")}
                    >
                      전체
                    </Button>
                    <Button
                      variant={
                        statusFilter === "ACTIVE" ? "default" : "outline"
                      }
                      size="sm"
                      className={cn(
                        "transition-all",
                        statusFilter === "ACTIVE"
                          ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:opacity-90 shadow-sm"
                          : "border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-green-600 hover:text-green-600"
                      )}
                      onClick={() => handleFilterChange("status", "ACTIVE")}
                    >
                      활성
                    </Button>
                    <Button
                      variant={
                        statusFilter === "PENDING" ? "default" : "outline"
                      }
                      size="sm"
                      className={cn(
                        "transition-all",
                        statusFilter === "PENDING"
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:opacity-90 shadow-sm"
                          : "border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-yellow-500 hover:text-yellow-600"
                      )}
                      onClick={() => handleFilterChange("status", "PENDING")}
                    >
                      대기
                    </Button>
                    <Button
                      variant={
                        statusFilter === "INACTIVE" ? "default" : "outline"
                      }
                      size="sm"
                      className={cn(
                        "transition-all",
                        statusFilter === "INACTIVE"
                          ? "bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:opacity-90 shadow-sm"
                          : "border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-600 hover:text-slate-600"
                      )}
                      onClick={() => handleFilterChange("status", "INACTIVE")}
                    >
                      비활성
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
      </AdminLayoutWrapper>
    </div>
  );
}
