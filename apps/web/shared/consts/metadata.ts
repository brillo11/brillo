export const METADATA = {
  TITLE: "LearnFlow - YouTube로 시작하는 개인화된 학습",
  DESCRIPTION: "YouTube 영상을 개인화된 학습 자료로 변환하는 LMS 플랫폼",
  THUMBNAIL: "/thumbnail.png",
  // 절대 URL 버전 추가
  getThumbnailUrl: () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return `${baseUrl}/thumbnail.png`;
  },
};
