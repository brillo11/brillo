/**
 * 비디오 모달 및 카드에서 사용하는 공통 비디오 타입
 */
export interface VideoForModal {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelSubscriberCount: number | null;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number | null;
  commentCount: number | null;
  duration: string;
  channelId: string | null;
  categoryId: number | null;
  viewsPerHour: number | null;
  outlierVph: number | null;
  outlierView: number | null;
  outlierSubscriber: number | null;
}
