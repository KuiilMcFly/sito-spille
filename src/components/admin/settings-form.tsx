"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

type SettingsFormProps = {
  initial: Record<string, Record<string, unknown>>;
};

export function SettingsForm({ initial }: SettingsFormProps) {
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    String(initial.free_shipping_threshold?.amount || "35")
  );
  const [email, setEmail] = useState(String(initial.store_email?.email || ""));
  const [phone, setPhone] = useState(String(initial.store_phone?.phone || ""));
  const [heroTitle, setHeroTitle] = useState(String(initial.hero_title?.text || ""));
  const [heroSubtitle, setHeroSubtitle] = useState(String(initial.hero_subtitle?.text || ""));
  const [loading, setLoading] = useState(false);

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
      await saveSetting("free_shipping_threshold", {
        amount: parseFloat(freeShippingThreshold),
        currency: "EUR",
      });
      await saveSetting("store_email", { email });
      await saveSetting("store_phone", { phone });
      await saveSetting("hero_title", { text: heroTitle });
      await saveSetting("hero_subtitle", { text: heroSubtitle });
      toast.success("Impostazioni salvate");
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
      <Input label="Titolo hero home" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
      <Input label="Sottotitolo hero home" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
      <Button type="submit" disabled={loading}>
        {loading ? "Salvataggio..." : "Salva impostazioni"}
      </Button>
    </form>
  );
}
