import { LoadingSpinner } from "@repo/ui/components/loading-spinner";

export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <LoadingSpinner loadingText="관리자 대시보드를 불러오는 중..." />
        <p className="mt-4 text-sm text-gray-600">
          권한을 확인하고 데이터를 로딩하고 있습니다.
        </p>
      </div>
    </div>
  );
}
