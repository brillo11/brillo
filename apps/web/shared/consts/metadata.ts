export const METADATA = {
  TITLE: "TubeInsight - YouTube 컨텐츠 제작 어시스턴트 플랫폼",
  DESCRIPTION:
    "AI 어시스턴트가 페르소나부터 대본, 썸네일, 메타데이터까지 YouTube 콘텐츠 제작의 모든 과정을 도와드립니다",
  THUMBNAIL: "/thumbnail.png",
  COMPANY_NAME: "TALOS WORKS",
  // 절대 URL 버전 추가
  getThumbnailUrl: () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return `${baseUrl}/thumbnail.png`;
  },
};
