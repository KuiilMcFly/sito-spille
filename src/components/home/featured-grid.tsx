import Link from "next/link";
import { Layers, Ruler, Tags } from "lucide-react";
import { ProductCard } from "@/components/catalog/product-card";
import { formatPrice, getSiteAssetUrl } from "@/lib/utils";
import type { FeaturedItem } from "@/lib/featured/types";

type FeaturedGridProps = {
  items: FeaturedItem[];
  emptyMessage?: string;
};

function FeaturedGroupCard({ item }: { item: Extract<FeaturedItem, { kind: "group" }> }) {
  const group = item.group;

  return (
    <Link
      href={"/gruppi/" + group.slug}
      className="card-hover-lift group overflow-hidden rounded-3xl border border-brand-100 bg-white"
    >
      <div className="relative aspect-[4/3] bg-brand-50">
        {group.cover_path ? (
          <img
            src={getSiteAssetUrl(group.cover_path)}
            alt={group.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-300">
            <Layers className="h-16 w-16" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
          Gruppo
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-ink-900">{group.name}</h3>
        {group.description && (
          <p className="mt-1 line-clamp-2 text-sm text-ink-600">{group.description}</p>
        )}
      </div>
    </Link>
  );
}

function FeaturedTypologyCard({ item }: { item: Extract<FeaturedItem, { kind: "typology" }> }) {
  const typology = item.typology;

  return (
    <Link
      href={"/tipologie/" + typology.slug}
      className="card-hover-lift group overflow-hidden rounded-3xl border border-brand-100 bg-white"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-brand-50 to-accent-50">
        <Tags className="card-image-zoom h-16 w-16 text-brand-400" />
        <span className="absolute left-3 top-3 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
          Tipologia
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-ink-900">{typology.name}</h3>
        <p className="mt-2 text-sm text-brand-600">Esplora il catalogo</p>
      </div>
    </Link>
  );
}

function FeaturedSizeCard({ item }: { item: Extract<FeaturedItem, { kind: "size" }> }) {
  const size = item.size;
  const price = size.custom_price ?? size.base_price;

  return (
    <Link
      href="/crea"
      className="card-hover-lift group overflow-hidden rounded-3xl border border-brand-100 bg-white"
    >
      <div className="relative flex aspect-square items-center justify-center bg-brand-50">
        <Ruler className="card-image-zoom h-16 w-16 text-brand-400" />
        <span className="absolute left-3 top-3 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
          Taglia
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-ink-900">{size.name}</h3>
        <p className="mt-1 text-sm text-ink-400">{size.diameter_mm} mm</p>
        {size.description && (
          <p className="mt-1 line-clamp-2 text-sm text-ink-600">{size.description}</p>
        )}
        <p className="mt-3 text-xl font-bold text-brand-600">{formatPrice(price)}</p>
      </div>
    </Link>
  );
}

export function FeaturedGrid({ items, emptyMessage }: FeaturedGridProps) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-ink-400">
        {emptyMessage || "Nessun elemento in evidenza."}
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        if (item.kind === "product") {
          return <ProductCard key={"product-" + item.product.id} product={item.product} />;
        }
        if (item.kind === "group") {
          return <FeaturedGroupCard key={"group-" + item.group.id} item={item} />;
        }
        if (item.kind === "typology") {
          return <FeaturedTypologyCard key={"typology-" + item.typology.id} item={item} />;
        }
        return <FeaturedSizeCard key={"size-" + item.size.id} item={item} />;
      })}
    </div>
  );
}
