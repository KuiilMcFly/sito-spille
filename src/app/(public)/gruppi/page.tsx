import Link from "next/link";
import { createClientIfConfigured } from "@/lib/supabase/server";
import { getSiteAssetUrl } from "@/lib/utils";
import type { Tables } from "@/types/database";
import { Layers } from "lucide-react";

export const metadata = { title: "Gruppi" };

type GroupWithCount = Tables<"product_groups"> & { product_count: number };

export default async function GroupsPage() {
  let groups: GroupWithCount[] = [];
  const supabase = await createClientIfConfigured();

  if (supabase) {
    try {
      const { data } = await supabase
        .from("product_groups")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (data) {
        const counts = await Promise.all(
          data.map(async (g) => {
            const { count } = await supabase
              .from("products")
              .select("*", { count: "exact", head: true })
              .eq("product_group_id", g.id)
              .eq("is_active", true);
            return { ...g, product_count: count || 0 };
          })
        );
        groups = counts;
      }
    } catch {
      groups = [];
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-ink-900">Gruppi</h1>
      <p className="mt-2 text-ink-700">Esplora le collezioni tematiche di spille.</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Link
            key={group.id}
            href={"/gruppi/" + group.slug}
            className="group overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm transition hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] bg-brand-50">
              {group.cover_path ? (
                <img
                  src={getSiteAssetUrl(group.cover_path)}
                  alt={group.name}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Layers className="h-12 w-12 text-brand-300" />
                </div>
              )}
            </div>
            <div className="p-5">
              <h2 className="font-display text-xl font-bold text-ink-900">{group.name}</h2>
              {group.description && (
                <p className="mt-1 line-clamp-2 text-sm text-ink-600">{group.description}</p>
              )}
              <p className="mt-2 text-xs text-brand-600">
                {group.product_count} prodott{group.product_count === 1 ? "o" : "i"}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {groups.length === 0 && (
        <p className="mt-8 text-center text-ink-500">Nessun gruppo disponibile.</p>
      )}
    </div>
  );
}
