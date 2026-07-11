"use client";

import { useState } from "react";
import { DEFAULT_STORE_NAME, DEFAULT_STORE_TAGLINE } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import toast from "react-hot-toast";

type SettingsFormProps = {
  initial: Record<string, Record<string, unknown>>;
  logoUrl?: string | null;
};

export function SettingsForm({ initial, logoUrl }: SettingsFormProps) {
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    String(initial.free_shipping_threshold?.amount || "35")
  );
  const [email, setEmail] = useState(String(initial.store_email?.email || ""));
  const [phone, setPhone] = useState(String(initial.store_phone?.phone || ""));
  const [heroTitle, setHeroTitle] = useState(String(initial.hero_title?.text || ""));
  const [heroSubtitle, setHeroSubtitle] = useState(String(initial.hero_subtitle?.text || ""));
  const [storeName, setStoreName] = useState(String(initial.store_name?.text || DEFAULT_STORE_NAME));
  const [storeTagline, setStoreTagline] = useState(String(initial.store_tagline?.text || DEFAULT_STORE_TAGLINE));
  const [instagram, setInstagram] = useState(String(initial.social_links?.instagram || ""));
  const [tiktok, setTiktok] = useState(String(initial.social_links?.tiktok || ""));
  const [facebook, setFacebook] = useState(String(initial.social_links?.facebook || ""));
  const [youtube, setYoutube] = useState(String(initial.social_links?.youtube || ""));
  const [threads, setThreads] = useState(String(initial.social_links?.threads || ""));
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleLogoChange(file: File | null) {
    setLogoFile(file);
    if (file) setRemoveLogo(false);
    if (!file && !logoUrl) setRemoveLogo(false);
  }

  function handleLogoClear() {
    setLogoFile(null);
    if (logoUrl) setRemoveLogo(true);
  }

  async function saveSetting(key: string, value: Record<string, unknown>) {
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (removeLogo) {
        const logoRes = await fetch("/api/admin/settings/logo", { method: "DELETE" });
        if (!logoRes.ok) throw new Error("Errore rimozione logo");
      } else if (logoFile) {
        const formData = new FormData();
        formData.append("logo", logoFile);
        const logoRes = await fetch("/api/admin/settings/logo", {
          method: "POST",
          body: formData,
        });
        if (!logoRes.ok) throw new Error("Errore upload logo");
      }

      await saveSetting("free_shipping_threshold", {
        amount: parseFloat(freeShippingThreshold),
        currency: "EUR",
      });
      await saveSetting("store_email", { email });
      await saveSetting("store_phone", { phone });
      await saveSetting("hero_title", { text: heroTitle });
      await saveSetting("hero_subtitle", { text: heroSubtitle });
      await saveSetting("store_name", { text: storeName.trim() });
      await saveSetting("store_tagline", { text: storeTagline.trim() });
      await saveSetting("social_links", {
        instagram: instagram.trim(),
        tiktok: tiktok.trim(),
        facebook: facebook.trim(),
        youtube: youtube.trim(),
        threads: threads.trim(),
      });
      toast.success("Impostazioni salvate");
      window.location.reload();
    } catch {
      toast.error("Errore salvataggio");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <Input
        label="Soglia spedizione gratuita (EUR)"
        type="number"
        step="0.01"
        value={freeShippingThreshold}
        onChange={(e) => setFreeShippingThreshold(e.target.value)}
      />
      <p className="text-xs text-ink-400">
        Sopra questo importo di subtotale la spedizione sara gratuita per i clienti.
      </p>
      <Input label="Email negozio" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input label="Telefono negozio" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Input
        label="Nome sito (header)"
        value={storeName}
        onChange={(e) => setStoreName(e.target.value)}
      />
      <Input
        label="Sottotitolo header"
        value={storeTagline}
        onChange={(e) => setStoreTagline(e.target.value)}
      />
      <p className="text-xs text-ink-400">
        Appare in alto a sinistra su tutte le pagine del sito.
      </p>
      <ImageUploadField
        label="Logo sito (header)"
        currentUrl={removeLogo ? null : logoUrl}
        onChange={(file) => {
          if (file) handleLogoChange(file);
          else handleLogoClear();
        }}
      />
      <p className="text-xs text-ink-400">
        Se non carichi un logo viene mostrata l&apos;icona predefinita. Consigliato quadrato o rotondo, min 200x200px.
      </p>
      <Input label="Titolo hero home" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
      <Input label="Sottotitolo hero home" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
      <div className="border-t border-ink-700 pt-4">
        <p className="mb-3 text-sm font-semibold text-white">Social</p>
        <div className="space-y-3">
          <Input label="Instagram URL" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
          <Input label="TikTok URL" value={tiktok} onChange={(e) => setTiktok(e.target.value)} />
          <Input label="Facebook URL" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
          <Input label="YouTube URL" value={youtube} onChange={(e) => setYoutube(e.target.value)} />
          <Input label="Threads URL" value={threads} onChange={(e) => setThreads(e.target.value)} />
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Salvataggio..." : "Salva impostazioni"}
      </Button>
    </form>
  );
}
