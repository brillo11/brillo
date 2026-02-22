export const METADATA = {
  TITLE: "브릴로",
  DESCRIPTION: "당신만의 프리미엄 퍼스널 비주얼디렉팅",
  THUMBNAIL: "/thumbnail1.png",
  COMPANY_NAME: "BRILLO",
  // 절대 URL 버전 추가
  getThumbnailUrl: () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return `${baseUrl}/thumbnail1.png`;
  },
};
