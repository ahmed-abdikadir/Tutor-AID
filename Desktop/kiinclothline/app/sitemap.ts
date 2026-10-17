import type { MetadataRoute } from "next";
import { site } from "@/app/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://kiinclothline.com";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
