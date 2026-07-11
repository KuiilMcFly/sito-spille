import { Suspense } from "react";
import { createClientIfConfigured } from "@/lib/supabase/server";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { TypologyGrid } from "@/components/catalog/typology-grid";
import { loadFilterOptions, loadFilteredTypologies } from "@/lib/catalog/filter-entities";

export const metadata = { title: "Tipologie" };

type Props = {
  searchParams: Promise<{ q?: string; gruppo?: string; tipologia?: string }>;
};

export default async function TypologiesPage({ searchParams }: Props) {
  const params = await searchParams;
  let typologies: Awaited<ReturnType<typeof loadFilteredTypologies>> = [];
  let groups: Awaited<ReturnType<typeof loadFilterOptions>>["groups"] = [];
  let filterTypologies: Awaited<ReturnType<typeof loadFilterOptions>>["typologies"] = [];

  const supabase = await createClientIfConfigured();

  if (supabase) {
    try {
      const options = await loadFilterOptions(supabase);
      groups = options.groups;
      filterTypologies = options.typologies;
      typologies = await loadFilteredTypologies(supabase, params);
    } catch {
      typologies = [];
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-ink-900">Tipologie</h1>
      <p className="mt-2 text-ink-700">
        Anime, serie TV, film, videogiochi e altre categorie.
      </p>
      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        <Suspense>
          <CatalogFilters basePath="/tipologie" groups={groups} typologies={filterTypologies} />
        </Suspense>
        <TypologyGrid typologies={typologies} />
      </div>
    </div>
  );
}
