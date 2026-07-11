"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Tables } from "@/types/database";

type CatalogFiltersProps = {
  groups: Tables<"product_groups">[];
  typologies: Tables<"product_typologies">[];
};

export function CatalogFilters({ groups, typologies }: CatalogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  function applyFilters(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push("/prodotti?" + params.toString());
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilters({ q: query.trim() });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-brand-100 bg-white p-5">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca per nome..."
          className="pl-10"
        />
      </form>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700">Gruppo</label>
        <select
          value={searchParams.get("gruppo") || ""}
          onChange={(e) => applyFilters({ gruppo: e.target.value })}
          className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm"
        >
          <option value="">Tutti i gruppi</option>
          {groups.map((g) => (
            <option key={g.id} value={g.slug}>{g.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700">Tipologia</label>
        <select
          value={searchParams.get("tipologia") || ""}
          onChange={(e) => applyFilters({ tipologia: e.target.value })}
          className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm"
        >
          <option value="">Tutte le tipologie</option>
          {typologies.map((t) => (
            <option key={t.id} value={t.slug}>{t.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
