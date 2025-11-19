import { Suspense } from "react";
import AdminUserClientView from "./view";
import UserHeader from "./(_components)/user-header";
import { LoadingSpinner } from "@repo/ui/components/loading-spinner";

export default function AdminUserPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      <Suspense
        fallback={
          <LoadingSpinner loadingText="유저 관리자 페이지 로딩 중..." />
        }
      >
        <AdminUserClientView />
      </Suspense>
    </div>
  );
}
