import { Suspense } from "react";
import AdminYoutubeChannelsView from "./view";
import { ChannelsHeader } from "./_components/channels-header";
import { LoadingSpinner } from "@repo/ui/components/loading-spinner";
import { AdminLayoutWrapper } from "@/app/(admin)/admin/components/layout/admin-layout-wrapper";

export default function AdminYoutubeChannelsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminLayoutWrapper>
        <div className="w-full max-w-7xl mx-auto">
          <ChannelsHeader />
          <Suspense
            fallback={
              <LoadingSpinner loadingText="YouTube 채널 목록 로딩 중..." />
            }
          >
            <AdminYoutubeChannelsView />
          </Suspense>
        </div>
      </AdminLayoutWrapper>
    </div>
  );
}
