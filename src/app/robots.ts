import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://dr4checker.com/sitemap.xml",
    host: "https://dr4checker.com",
  };
}
