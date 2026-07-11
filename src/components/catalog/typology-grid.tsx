import Link from "next/link";
import { Tags } from "lucide-react";
import type { Tables } from "@/types/database";

export type TypologyWithCount = Tables<"product_typologies"> & { product_count: number };

type TypologyGridProps = {
  typologies: TypologyWithCount[];
  emptyMessage?: string;
};

export function TypologyGrid({ typologies, emptyMessage }: TypologyGridProps) {
  if (typologies.length === 0) {
    return (
      <p className="py-12 text-center text-ink-500">
        {emptyMessage || "Nessuna tipologia trovata."}
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {typologies.map((typology) => (
        <Link
          key={typology.id}
          href={"/tipologie/" + typology.slug}
          className="group overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm transition hover:shadow-lg"
        >
          <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-brand-50 to-accent-50">
            <Tags className="h-14 w-14 text-brand-400 transition group-hover:scale-110" />
          </div>
          <div className="p-5">
            <h2 className="font-display text-xl font-bold text-ink-900">{typology.name}</h2>
            <p className="mt-2 text-xs text-brand-600">
              {typology.product_count} prodott{typology.product_count === 1 ? "o" : "i"}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
