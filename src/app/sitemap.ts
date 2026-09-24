import type { MetadataRoute } from "next";
import { URL_BASE } from "@/utils/site";

// One page worth finding. /match has no content of its own to index (see robots.ts).
const sitemap = (): MetadataRoute.Sitemap => [{ url: URL_BASE, changeFrequency: "monthly", priority: 1 }];

export default sitemap;
