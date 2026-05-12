import type { MetadataRoute } from "next";
import { getAbsoluteUrl } from "@/shared/consts/metadata";

const ROUTES = [
  "/",
  "/about",
  "/faq",
  "/man",
  "/woman",
  "/vip",
  "/blog",
  "/privacy",
  "/terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: getAbsoluteUrl(route),
    lastModified,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
