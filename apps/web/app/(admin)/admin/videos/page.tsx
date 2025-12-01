import { VideosHeader } from "./_components/videos-header";
import AdminYoutubeVideosView from "./view";

export default function AdminYoutubeVideosPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-screen-xl">
      <VideosHeader />
      <AdminYoutubeVideosView />
    </div>
  );
}
