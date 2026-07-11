import Link from "next/link";
import { Layers } from "lucide-react";
import { getSiteAssetUrl } from "@/lib/utils";
import type { Tables } from "@/types/database";

export type GroupWithCount = Tables<"product_groups"> & { product_count: number };

type GroupGridProps = {
  groups: GroupWithCount[];
  emptyMessage?: string;
};

export function GroupGrid({ groups, emptyMessage }: GroupGridProps) {
  if (groups.length === 0) {
    return (
      <p className="py-12 text-center text-ink-500">
        {emptyMessage || "Nessun gruppo trovato."}
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}
