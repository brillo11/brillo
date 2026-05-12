const DEFAULT_SITE_URL = "https://brillo.kr";

const normalizeSiteUrl = (siteUrl: string) => siteUrl.replace(/\/+$/, "");

export const getSiteUrl = () => {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || DEFAULT_SITE_URL;

  return normalizeSiteUrl(siteUrl);
};

export const getAbsoluteUrl = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${getSiteUrl()}${normalizedPath}`;
};

export const METADATA = {
  TITLE: "브릴로 BRILLO | 인생을 바꾸는 비주얼 디렉팅",
  DESCRIPTION:
    "방법을 모르는 당신을 위한 확실한 솔루션. SM엔터테인먼트 출신 비주얼 디렉터가 데이터로 증명된 당신만의 맞춤 비주얼 로드맵을 제시합니다.",
  THUMBNAIL: "/thumbnail1.png",
  COMPANY_NAME: "브릴로 비주얼 디렉팅",
  ALTERNATE_NAME: ["브릴로", "BRILLO", "브릴로 BRILLO"],
  getThumbnailUrl: () => getAbsoluteUrl("/thumbnail1.png"),
};
