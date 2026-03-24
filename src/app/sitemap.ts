import type { MetadataRoute } from "next";
import { getNews } from "@/lib/data/content-service";
import { siteConfig } from "@/lib/constants/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const news = await getNews("published");

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: `${siteConfig.url}/calendar`,
      lastModified: new Date(),
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/events`,
      lastModified: new Date(),
      priority: 0.85,
    },
    {
      url: `${siteConfig.url}/news`,
      lastModified: new Date(),
      priority: 0.85,
    },
    {
      url: `${siteConfig.url}/contact`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/privacy-policy`,
      lastModified: new Date(),
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/terms-of-use`,
      lastModified: new Date(),
      priority: 0.5,
    },
  ];

  const newsRoutes: MetadataRoute.Sitemap = news.map((item) => ({
    url: `${siteConfig.url}/news/${item.slug}`,
    lastModified: new Date(item.created_at),
    priority: 0.75,
  }));

  return [...staticRoutes, ...newsRoutes];
}
