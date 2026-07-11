"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/utils";
import type { Tables } from "@/types/database";
import toast from "react-hot-toast";

type TypologyFormProps = {
  typology?: Tables<"product_typologies">;
};

export function TypologyForm({ typology }: TypologyFormProps) {
  const router = useRouter();
  const [name, setName] = useState(typology?.name || "");
  const [slug, setSlug] = useState(typology?.slug || "");
  const [sortOrder, setSortOrder] = useState(String(typology?.sort_order || 0));
  const [isActive, setIsActive] = useState(typology?.is_active ?? true);
  const [loading, setLoading] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!typology) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      slug,
      sort_order: parseInt(sortOrder) || 0,
      is_active: isActive,
    };

    const url = typology
      ? "/api/admin/typologies/" + typology.id
      : "/api/admin/typologies";
    const method = typology ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      toast.error("Errore salvataggio");
    } else {
      toast.success(typology ? "Tipologia aggiornata" : "Tipologia creata");
      router.push("/admin/tipologie");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <Input label="Nome" required value={name} onChange={(e) => handleNameChange(e.target.value)} />
      <Input label="Slug" required value={slug} onChange={(e) => setSlug(e.target.value)} />
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
