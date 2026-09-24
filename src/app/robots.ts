import type { MetadataRoute } from "next";
import { URL_BASE } from "@/utils/site";

/*
  /match is left out on purpose: the teams live in whoever's localStorage opened it, so to a crawler
  it is always an empty screen, and an empty result is worse than none.
*/
const robots = (): MetadataRoute.Robots => ({
  rules: { userAgent: "*", allow: "/", disallow: "/match" },
  sitemap: `${URL_BASE}/sitemap.xml`,
});

export default robots;
