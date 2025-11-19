import { Suspense } from "react";
import AdminCohortClientView from "./view";
import CohortHeader from "./(_components)/cohort-header";
import { LoadingSpinner } from "@repo/ui/components/loading-spinner";

export default function AdminCohortPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CohortHeader />
      <Suspense
        fallback={<LoadingSpinner loadingText="기수 관리 페이지 로딩 중..." />}
      >
        <AdminCohortClientView />
      </Suspense>
    </div>
  );
}
