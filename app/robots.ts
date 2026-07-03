import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/platform/",
          "/_next/",
        ],
      },
      {
        // Allow Google to crawl specific API routes for rich results
        userAgent: "Googlebot",
        allow: ["/", "/services/", "/blog/", "/about", "/contact", "/book-service"],
        disallow: ["/admin/", "/api/", "/platform/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
