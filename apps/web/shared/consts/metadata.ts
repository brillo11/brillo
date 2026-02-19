export const METADATA = {
  TITLE: "brillo",
  DESCRIPTION: "",
  THUMBNAIL: "/thumbnail1.png",
  COMPANY_NAME: "BRILLO",
  // 절대 URL 버전 추가
  getThumbnailUrl: () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return `${baseUrl}/thumbnail1.png`;
  },
};
