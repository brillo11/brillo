export const METADATA = {
  TITLE: "brillo",
  DESCRIPTION: "",
  THUMBNAIL: "/thumbnail.png",
  COMPANY_NAME: "TALOS WORKS",
  // 절대 URL 버전 추가
  getThumbnailUrl: () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return `${baseUrl}/thumbnail.png`;
  },
};
