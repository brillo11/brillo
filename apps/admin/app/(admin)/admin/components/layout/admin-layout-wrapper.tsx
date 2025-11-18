import { LoadingSpinner } from "@repo/ui/components/loading-spinner";
import { Suspense } from "react";

export function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={<LoadingSpinner loadingText="관리자 페이지 로딩 중..." />}
    >
      <div className="p-4 md:p-8">{children}</div>
    </Suspense>
  );
}
