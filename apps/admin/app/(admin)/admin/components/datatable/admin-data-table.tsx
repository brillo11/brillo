"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@repo/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import Pagination from "@/app/(admin)/admin/components/pagination";

interface AdminDataTableProps {
  columns: ColumnDef<any>[];
  queryName: string;
  params: any;
  queryFn: (params: any) => Promise<any>;
  options: {
    isCreateAvailable?: boolean;
    createPath?: string;
    searchBar?: {
      placeholder: string;
      value: string;
      onChange: (value: string) => void;
      onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    };
  };
}

export function AdminDataTable({
  columns,
  queryName,
  params,
  queryFn,
  options,
}: AdminDataTableProps) {
  const pathname = usePathname();
  const router = useRouter();

  const editPath = options?.isCreateAvailable
    ? options?.createPath || `${pathname}/edit`
    : null;

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const page = params.page;
  const setPage = (newPage: number) => {
    const newSearchParams = new URLSearchParams(window.location.search);
    newSearchParams.set("page", newPage.toString());
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const tableState = { sorting, columnFilters, columnVisibility, rowSelection };

  const { data, isLoading } = useQuery({
    queryKey: [queryName, { ...params, tableState }],
    queryFn: () => {
      return queryFn({ params, tableState });
    },
  });

  const table = useReactTable({
    data: isLoading ? [] : data?.data || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: tableState,
    manualPagination: true,
    pageCount: data?.totalPages || 0,
  });

  const handlePageChange = (newPage: number) => {
    const newSearchParams = new URLSearchParams(window.location.search);
    newSearchParams.set("page", newPage.toString());
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  function handleCreateButtonClick() {
    if (!editPath) {
      toast.error("등록 경로가 없습니다.");
      return;
    }

    router.push(editPath);
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-4">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between bg-white">
          <CardTitle>목록 ({data?.data?.length || 0}개)</CardTitle>
          {options.searchBar && (
            <div className="max-w-md flex-1 bg-white">
              <input
                type="text"
                placeholder={options.searchBar.placeholder}
                value={options.searchBar.value}
                onChange={(e) => options.searchBar?.onChange(e.target.value)}
                onKeyDown={options.searchBar.onKeyDown}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}
          {options?.isCreateAvailable && (
            <Button onClick={handleCreateButtonClick} className="ml-4">
              등록
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="text-center">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {isLoading ? "로딩 중..." : "데이터가 없습니다."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {/* 페이지네이션 */}
          {data?.totalPages > 0 && (
            <Pagination
              page={params.page || page}
              totalPages={data.totalPages}
              pageSize={params.size}
              totalCount={data?.data?.length || 0}
              setPage={setPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
