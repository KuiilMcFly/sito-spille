import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

type BuildPageMetadataInput = {
  title: string;
  description: string;
  path?: string;
  imageUrl?: string | null;
  type?: "website" | "article";
};

export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const url = input.path ? siteUrl + input.path : siteUrl;
  const images = input.imageUrl ? [{ url: input.imageUrl, width: 1200, height: 630, alt: input.title }] : [];

  return {
    title: input.title,
    description: input.description,
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: undefined,
      locale: "it_IT",
      type: input.type || "website",
      images,
    },
    twitter: {
      card: input.imageUrl ? "summary_large_image" : "summary",
      title: input.title,
      description: input.description,
      images: input.imageUrl ? [input.imageUrl] : undefined,
    },
  };
}
