"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { getSiteAssetUrl } from "@/lib/utils";
import type { Tables } from "@/types/database";
import toast from "react-hot-toast";

type HeroSlideFormProps = {
  slide?: Tables<"hero_slides">;
  products: Tables<"products">[];
};

export function HeroSlideForm({ slide, products }: HeroSlideFormProps) {
  const router = useRouter();
  const [productId, setProductId] = useState(slide?.product_id || products[0]?.id || "");
  const [titleOverride, setTitleOverride] = useState(slide?.title_override || "");
  const [subtitleOverride, setSubtitleOverride] = useState(slide?.subtitle_override || "");
  const [ctaLabel, setCtaLabel] = useState(slide?.cta_label || "Scopri");
  const [sortOrder, setSortOrder] = useState(String(slide?.sort_order || 0));
  const [isActive, setIsActive] = useState(slide?.is_active ?? true);
  const [background, setBackground] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("titleOverride", titleOverride);
    formData.append("subtitleOverride", subtitleOverride);
    formData.append("ctaLabel", ctaLabel);
    formData.append("sortOrder", sortOrder);
    formData.append("isActive", String(isActive));
    if (background) formData.append("background", background);

    const url = slide ? "/api/admin/hero-slides/" + slide.id : "/api/admin/hero-slides";
    const method = slide ? "PUT" : "POST";

    const response = await fetch(url, { method, body: formData });

    if (!response.ok) {
      toast.error("Errore salvataggio");
      setLoading(false);
      return;
    }

    toast.success(slide ? "Slide aggiornata" : "Slide creata");
    router.push("/admin/hero");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-200">Prodotto</label>
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
      <ImageUploadField
        label="Background hero"
        required={!slide}
        currentUrl={slide?.background_path ? getSiteAssetUrl(slide.background_path) : null}
        onChange={setBackground}
      />
      <Input label="Titolo override" value={titleOverride} onChange={(e) => setTitleOverride(e.target.value)} />
      <Input label="Sottotitolo override" value={subtitleOverride} onChange={(e) => setSubtitleOverride(e.target.value)} />
      <Input label="Testo pulsante" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
      <Input label="Ordine" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
      <label className="flex items-center gap-2 text-sm text-ink-200">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Attiva
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? "Salvataggio..." : "Salva"}
      </Button>
    </form>
  );
}
