import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { services } from "@/lib/data/services";
import { blogPosts } from "@/lib/data/blog-posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;

  const now = new Date();
  const staticPages = [
    { url: base, changeFrequency: "weekly" as const, priority: 1.0, lastModified: now },
    { url: `${base}/about`, changeFrequency: "monthly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/services`, changeFrequency: "weekly" as const, priority: 0.9, lastModified: now },
    { url: `${base}/products`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/brands`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/blog`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/faq`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/contact`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/book-service`, changeFrequency: "weekly" as const, priority: 0.9, lastModified: now },
    { url: `${base}/privacy-policy`, changeFrequency: "yearly" as const, priority: 0.3, lastModified: now },
    { url: `${base}/terms`, changeFrequency: "yearly" as const, priority: 0.3, lastModified: now },
  ];

  const servicePages = services.map((s) => ({
    url: `${base}/services/${s.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const blogPages = blogPosts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
    lastModified: new Date(p.publishedAt),
  }));

  return [...staticPages, ...servicePages, ...blogPages];
}
