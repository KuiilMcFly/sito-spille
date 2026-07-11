import { Suspense } from "react";
import { createClientIfConfigured } from "@/lib/supabase/server";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { GroupGrid } from "@/components/catalog/group-grid";
import { loadFilterOptions, loadFilteredGroups } from "@/lib/catalog/filter-entities";

export const metadata = { title: "Gruppi" };

type Props = {
  searchParams: Promise<{ q?: string; gruppo?: string; tipologia?: string }>;
};

export default async function GroupsPage({ searchParams }: Props) {
  const params = await searchParams;
  let groups: Awaited<ReturnType<typeof loadFilteredGroups>> = [];
  let filterGroups: Awaited<ReturnType<typeof loadFilterOptions>>["groups"] = [];
  let typologies: Awaited<ReturnType<typeof loadFilterOptions>>["typologies"] = [];

  const supabase = await createClientIfConfigured();

  if (supabase) {
    try {
      const options = await loadFilterOptions(supabase);
      filterGroups = options.groups;
      typologies = options.typologies;
      groups = await loadFilteredGroups(supabase, params);
    } catch {
      groups = [];
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-ink-900">Gruppi</h1>
      <p className="mt-2 text-ink-700">Esplora le collezioni tematiche di spille.</p>
      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        <Suspense>
          <CatalogFilters basePath="/gruppi" groups={filterGroups} typologies={typologies} />
        </Suspense>
        <GroupGrid groups={groups} />
      </div>
    </div>
  );
}
