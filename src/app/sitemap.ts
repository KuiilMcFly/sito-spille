import type { MetadataRoute } from "next";
import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000");

  const staticPages = [
    "",
    "/prodotti",
    "/crea",
    "/taglie",
    "/contatti",
    "/privacy",
    "/termini",
    "/cookie",
  ];

  const staticEntries = staticPages.map((path) => ({
    url: baseUrl + path,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  try {
    if (!hasSupabaseAdminEnv()) {
      return staticEntries;
    }

    const supabase = createAdminClient();
    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true);

    const productEntries =
      products?.map((p) => ({
        url: baseUrl + "/prodotti/" + p.slug,
        lastModified: new Date(p.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })) || [];

    return [...staticEntries, ...productEntries];
  } catch {
    return staticEntries;
  }
}
