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
  TITLE: "브릴로",
  DESCRIPTION: "당신만의 프리미엄 퍼스널 비주얼디렉팅",
  THUMBNAIL: "/thumbnail1.png",
  COMPANY_NAME: "BRILLO",
  getThumbnailUrl: () => getAbsoluteUrl("/thumbnail1.png"),
};
