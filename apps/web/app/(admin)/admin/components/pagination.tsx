import { Button } from "@repo/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  setPage: (page: number) => void;
}

const Pagination = ({
  page,
  totalPages,
  pageSize,
  totalCount,
  setPage
}: PaginationProps) => {
  return (
    <div className="mt-6 flex items-center justify-center">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.max(page - 1, 1))}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          이전
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNumber) => (
              <Button
                key={pageNumber}
                variant={page === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(pageNumber)}
                className={
                  page === pageNumber ? "bg-[#E53935] hover:bg-[#d32f2f]" : ""
                }
              >
                {pageNumber}
              </Button>
            )
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.min(page + 1, totalPages))}
          disabled={page === totalPages}
        >
          다음
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
