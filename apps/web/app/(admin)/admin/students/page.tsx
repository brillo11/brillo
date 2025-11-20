import { Suspense } from "react";
import AdminStudentsClientView from "./view";
import StudentsHeader from "./_components/students-header";
import { LoadingSpinner } from "@repo/ui/components/loading-spinner";

export default function AdminStudentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentsHeader />
      <Suspense
        fallback={
          <LoadingSpinner loadingText="수강생 관리자 페이지 로딩 중..." />
        }
      >
        <AdminStudentsClientView />
      </Suspense>
    </div>
  );
}
