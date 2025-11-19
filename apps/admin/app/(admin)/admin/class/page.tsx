import { Suspense } from "react";
import AdminClassClientView from "./view";
import ClassHeader from "./(_components)/class-header";
import { LoadingSpinner } from "@repo/ui/components/loading-spinner";

export default function AdminClassPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ClassHeader />
      <Suspense
        fallback={
          <LoadingSpinner loadingText="기수 관리 페이지 로딩 중..." />
        }
      >
        <AdminClassClientView />
      </Suspense>
    </div>
  );
}

