import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const supabase = createAdminClient();

  const { data: products } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("is_active", true);

  const staticPages = [
    "",
    "/prodotti",
    "/crea",
    "/contatti",
    "/privacy",
    "/termini",
    "/cookie",
  ];

  return [
    ...staticPages.map((path) => ({
      url: baseUrl + path,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...(products?.map((p) => ({
      url: baseUrl + "/prodotti/" + p.slug,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) || []),
  ];
}
