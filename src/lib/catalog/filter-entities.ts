import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { GroupWithCount } from "@/components/catalog/group-grid";
import type { TypologyWithCount } from "@/components/catalog/typology-grid";

export type CatalogSearchParams = {
  q?: string;
  gruppo?: string;
  tipologia?: string;
};

type FilterOption = {
  id: string;
  name: string;
  slug: string;
};

export async function loadFilterOptions(
  supabase: SupabaseClient<Database>
): Promise<{ groups: FilterOption[]; typologies: FilterOption[] }> {
  const [{ data: groups }, { data: typologies }] = await Promise.all([
    supabase.from("product_groups").select("id, name, slug").eq("is_active", true).order("sort_order"),
    supabase.from("product_typologies").select("id, name, slug").eq("is_active", true).order("sort_order"),
  ]);

  return {
    groups: groups || [],
    typologies: typologies || [],
  };
}

async function loadProductGroupIdsByTypology(
  supabase: SupabaseClient<Database>,
  typologySlug: string
): Promise<Set<string> | null> {
  const { data: typology } = await supabase
    .from("product_typologies")
    .select("id")
    .eq("slug", typologySlug)
    .eq("is_active", true)
    .maybeSingle();

  if (!typology) return new Set();

  const { data: products } = await supabase
    .from("products")
    .select("product_group_id")
    .eq("product_typology_id", typology.id)
    .eq("is_active", true);

  const ids = new Set<string>();
  for (const product of products || []) {
    if (product.product_group_id) ids.add(product.product_group_id);
  }
  return ids;
}

async function loadProductTypologyIdsByGroup(
  supabase: SupabaseClient<Database>,
  groupSlug: string
): Promise<Set<string> | null> {
  const { data: group } = await supabase
    .from("product_groups")
    .select("id")
    .eq("slug", groupSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (!group) return new Set();

  const { data: products } = await supabase
    .from("products")
    .select("product_typology_id")
    .eq("product_group_id", group.id)
    .eq("is_active", true);

  const ids = new Set<string>();
  for (const product of products || []) {
    if (product.product_typology_id) ids.add(product.product_typology_id);
  }
  return ids;
}

function matchesQuery(name: string, description: string | null | undefined, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (name.toLowerCase().includes(q)) return true;
  if (description && description.toLowerCase().includes(q)) return true;
  return false;
}

export async function loadFilteredGroups(
  supabase: SupabaseClient<Database>,
  params: CatalogSearchParams
): Promise<GroupWithCount[]> {
  const { data: groups } = await supabase
    .from("product_groups")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (!groups?.length) return [];

  let filtered = groups;

  if (params.gruppo) {
    filtered = filtered.filter((group) => group.slug === params.gruppo);
  }

  if (params.q?.trim()) {
    filtered = filtered.filter((group) => matchesQuery(group.name, group.description, params.q || ""));
  }

  if (params.tipologia) {
    const groupIds = await loadProductGroupIdsByTypology(supabase, params.tipologia);
    if (groupIds) {
      filtered = filtered.filter((group) => groupIds.has(group.id));
    }
  }

  const withCounts = await Promise.all(
    filtered.map(async (group) => {
      let countQuery = supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("product_group_id", group.id)
        .eq("is_active", true);

      if (params.tipologia) {
        const { data: typology } = await supabase
          .from("product_typologies")
          .select("id")
          .eq("slug", params.tipologia)
          .maybeSingle();
        if (typology) {
          countQuery = countQuery.eq("product_typology_id", typology.id);
        }
      }

      const { count } = await countQuery;
      return { ...group, product_count: count || 0 };
    })
  );

  return withCounts;
}

export async function loadFilteredTypologies(
  supabase: SupabaseClient<Database>,
  params: CatalogSearchParams
): Promise<TypologyWithCount[]> {
  const { data: typologies } = await supabase
    .from("product_typologies")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (!typologies?.length) return [];

  let filtered = typologies;

  if (params.tipologia) {
    filtered = filtered.filter((typology) => typology.slug === params.tipologia);
  }

  if (params.q?.trim()) {
    filtered = filtered.filter((typology) => matchesQuery(typology.name, null, params.q || ""));
  }

  if (params.gruppo) {
    const typologyIds = await loadProductTypologyIdsByGroup(supabase, params.gruppo);
    if (typologyIds) {
      filtered = filtered.filter((typology) => typologyIds.has(typology.id));
    }
  }

  const withCounts = await Promise.all(
    filtered.map(async (typology) => {
      let countQuery = supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("product_typology_id", typology.id)
        .eq("is_active", true);

      if (params.gruppo) {
        const { data: group } = await supabase
          .from("product_groups")
          .select("id")
          .eq("slug", params.gruppo)
          .maybeSingle();
        if (group) {
          countQuery = countQuery.eq("product_group_id", group.id);
        }
      }

      const { count } = await countQuery;
      return { ...typology, product_count: count || 0 };
    })
  );

  return withCounts;
}

export async function loadHomeGroupsPreview(
  supabase: SupabaseClient<Database>,
  limit: number
): Promise<GroupWithCount[]> {
  const groups = await loadFilteredGroups(supabase, {});
  return groups.slice(0, limit);
}

export async function loadHomeTypologiesPreview(
  supabase: SupabaseClient<Database>,
  limit: number
): Promise<TypologyWithCount[]> {
  const typologies = await loadFilteredTypologies(supabase, {});
  return typologies.slice(0, limit);
}
