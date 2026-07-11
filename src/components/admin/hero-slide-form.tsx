"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { getSiteAssetUrl } from "@/lib/utils";
import { HERO_PRODUCT_POSITIONS, parseHeroProductPosition } from "@/lib/hero/constants";
import type { HeroProductPosition } from "@/lib/hero/constants";
import { formatSiteAssetMaxSize } from "@/lib/images/content-type";
import { uploadSiteAssetClient } from "@/lib/site-assets/upload-client";
import { DeleteResourceButton } from "@/components/admin/delete-resource-button";
import type { Tables } from "@/types/database";
import toast from "react-hot-toast";

type HeroSlideFormProps = {
  slide?: Tables<"hero_slides">;
  products: Tables<"products">[];
};

export function HeroSlideForm({ slide, products }: HeroSlideFormProps) {
  const router = useRouter();
  const [productId, setProductId] = useState(slide?.product_id || products[0]?.id || "");
  const [productPosition, setProductPosition] = useState<HeroProductPosition>(
    parseHeroProductPosition(slide?.product_position)
  );
  const [titleOverride, setTitleOverride] = useState(slide?.title_override || "");
  const [subtitleOverride, setSubtitleOverride] = useState(slide?.subtitle_override || "");
  const [ctaLabel, setCtaLabel] = useState(slide?.cta_label || "Scopri");
  const [sortOrder, setSortOrder] = useState(String(slide?.sort_order || 0));
  const [isActive, setIsActive] = useState(slide?.is_active ?? true);
  const [background, setBackground] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = products.length > 0 && Boolean(productId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!canSubmit) {
      toast.error("Crea almeno un prodotto attivo prima di salvare la slide");
      return;
    }

    if (!slide && !background) {
      toast.error("Background obbligatorio");
      return;
    }

    setLoading(true);

    let backgroundPath: string | undefined;
    if (background) {
      const uploadToast = toast.loading("Upload immagine in corso...");
      const upload = await uploadSiteAssetClient(background, "hero");
      toast.dismiss(uploadToast);

      if (!upload.ok) {
        toast.error(upload.error);
        setLoading(false);
        return;
      }

      backgroundPath = upload.path;
    }

    const payload = {
      productId,
      productPosition,
      titleOverride,
      subtitleOverride,
      ctaLabel,
      sortOrder,
      isActive,
      backgroundPath,
    };

    const url = slide ? "/api/admin/hero-slides/" + slide.id : "/api/admin/hero-slides";
    const method = slide ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      toast.error(data.error || "Errore salvataggio");
      setLoading(false);
      return;
    }

    toast.success(slide ? "Slide aggiornata" : "Slide creata");
    router.push("/admin/hero");
    router.refresh();
  }

  if (products.length === 0) {
    return (
      <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        Nessun prodotto disponibile. Crea almeno un prodotto attivo prima di configurare l&apos;hero.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-200">Prodotto in evidenza</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
          className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-white"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-200">Posizione prodotto</label>
        <select
          value={productPosition}
          onChange={(e) => setProductPosition(parseHeroProductPosition(e.target.value))}
          className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-white"
        >
          {HERO_PRODUCT_POSITIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <ImageUploadField
        label="Background hero"
        required={!slide}
        currentUrl={slide?.background_path ? getSiteAssetUrl(slide.background_path) : null}
        onChange={setBackground}
      />
      <p className="text-xs text-ink-500">
        Supportati JPEG, PNG, GIF, WebP animato e altri formati immagine fino a {formatSiteAssetMaxSize()}.
      </p>
      <Input label="Titolo override" value={titleOverride} onChange={(e) => setTitleOverride(e.target.value)} />
      <Input label="Sottotitolo override" value={subtitleOverride} onChange={(e) => setSubtitleOverride(e.target.value)} />
      <Input label="Testo pulsante" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
      <Input label="Ordine" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
      <label className="flex items-center gap-2 text-sm text-ink-200">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Attiva
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={loading || !canSubmit}>
          {loading ? "Salvataggio..." : "Salva"}
        </Button>
        {slide && (
          <DeleteResourceButton
            apiUrl={"/api/admin/hero-slides/" + slide.id}
            redirectTo="/admin/hero"
            resourceLabel="questa slide hero"
          />
        )}
      </div>
    </form>
  );
}
