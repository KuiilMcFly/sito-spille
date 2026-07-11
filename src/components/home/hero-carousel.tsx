"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice, getStorageUrl, getSiteAssetUrl } from "@/lib/utils";
import { parseHeroProductPosition } from "@/lib/hero/constants";
import type { HeroProductPosition } from "@/lib/hero/constants";
import type { HeroSlideWithProduct } from "@/types/database";

type HeroCarouselProps = {
  slides: HeroSlideWithProduct[];
  fallbackTitle: string;
  fallbackSubtitle: string;
};

function positionClass(position: HeroProductPosition): string {
  if (position === "left") return "justify-start";
  if (position === "right") return "justify-end";
  return "justify-center";
}

export function HeroCarousel({ slides, fallbackTitle, fallbackSubtitle }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [slides.length, next]);

  if (slides.length === 0) {
    return (
      <section className="gradient-hero px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="font-display mt-6 text-4xl font-bold leading-tight text-ink-900 md:text-6xl">
            {fallbackTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-700">{fallbackSubtitle}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/crea"
              className="rounded-full bg-brand-500 px-8 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600"
            >
              Crea la tua spilla
            </Link>
            <Link
              href="/prodotti"
              className="rounded-full border-2 border-brand-300 px-8 py-3 font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              Vedi catalogo
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const slide = slides[index];
  const product = slide.products;
  const primaryImage = product?.product_images?.find((img) => img.is_primary);
  const productImageUrl = primaryImage ? getStorageUrl(primaryImage.storage_path) : null;
  const bgUrl = getSiteAssetUrl(slide.background_path);
  const title = slide.title_override || product?.name || "";
  const subtitle = slide.subtitle_override || product?.description || "";
  const ctaLabel = slide.cta_label || "Scopri";
  const productHref = product ? "/prodotti/" + product.slug : "/prodotti";
  const position = parseHeroProductPosition(slide.product_position);

  return (
    <section className="relative min-h-[480px] overflow-hidden md:min-h-[560px]">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: "url(" + bgUrl + ")" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/50" />
      <div
        className={
          "relative mx-auto flex min-h-[480px] max-w-6xl items-center px-4 py-12 md:min-h-[560px] md:py-16 " +
          positionClass(position)
        }
      >
        <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-white/95 p-5 shadow-2xl backdrop-blur-md md:max-w-md md:p-7">
          {productImageUrl && (
            <div className="mb-5 overflow-hidden rounded-2xl bg-ink-100 shadow-lg">
              <img
                src={productImageUrl}
                alt={product?.name || ""}
                className="aspect-square w-full object-cover"
              />
            </div>
          )}
          <h1 className="font-display text-2xl font-bold text-ink-900 md:text-3xl">{title}</h1>
          {subtitle && (
            <p className="mt-3 text-sm text-ink-700 line-clamp-3 md:text-base">{subtitle}</p>
          )}
          {product && (
            <p className="mt-3 text-xl font-semibold text-brand-600">
              {formatPrice(product.price)}
            </p>
          )}
          <Link
            href={productHref}
            className="mt-5 inline-block rounded-full bg-brand-500 px-7 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-600 md:text-base"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
            aria-label="Slide precedente"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
            aria-label="Slide successiva"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={
                  "h-2 w-2 rounded-full transition " +
                  (i === index ? "bg-white w-6" : "bg-white/50")
                }
                aria-label={"Slide " + (i + 1)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
