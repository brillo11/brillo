export const METADATA = {
  TITLE: "연화당 - 전통 사주를 현대적으로",
  DESCRIPTION: "연화당 - 전통 사주를 현대적으로",
  THUMBNAIL: "/thumbnail.png",
  // 절대 URL 버전 추가
  getThumbnailUrl: () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return `${baseUrl}/thumbnail.png`;
  },
};
