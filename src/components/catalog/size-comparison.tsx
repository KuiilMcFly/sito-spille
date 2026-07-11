import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { getCustomPrice } from "@/lib/orders/pricing-client";
import type { Tables } from "@/types/database";

type SizeComparisonProps = {
  sizes: Tables<"pin_sizes">[];
};

const MAX_VISUAL_MM = 40;

export function SizeComparison({ sizes }: SizeComparisonProps) {
  if (sizes.length === 0) {
    return (
      <p className="py-12 text-center text-ink-500">
        Nessuna taglia disponibile al momento.
      </p>
    );
  }

  const maxDiameter = Math.max(...sizes.map((s) => s.diameter_mm), 1);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-center gap-8 md:gap-12">
        {sizes.map((size) => {
          const visualPx = Math.round((size.diameter_mm / maxDiameter) * MAX_VISUAL_MM * 4);
          const price = getCustomPrice(size);
          return (
            <div key={size.id} className="flex flex-col items-center text-center">
              <div
                className="relative flex items-center justify-center rounded-full border-4 border-brand-400 bg-gradient-to-br from-brand-50 to-white shadow-lg"
                style={{ width: visualPx, height: visualPx }}
              >
                <span className="text-xs font-bold text-brand-700 md:text-sm">
                  {size.diameter_mm} mm
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{size.name}</h3>
              <p className="mt-1 text-xl font-bold text-brand-600">{formatPrice(price)}</p>
              {size.description && (
                <p className="mt-2 max-w-[180px] text-sm text-ink-600">{size.description}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-brand-100 bg-white">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="px-5 py-4 font-semibold text-ink-900">Taglia</th>
              <th className="px-5 py-4 font-semibold text-ink-900">Diametro</th>
              <th className="px-5 py-4 font-semibold text-ink-900">Prezzo custom</th>
              <th className="px-5 py-4 font-semibold text-ink-900">Note</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((size) => (
              <tr key={size.id} className="border-b border-brand-50 last:border-0">
                <td className="px-5 py-4 font-medium text-ink-900">{size.name}</td>
                <td className="px-5 py-4 text-ink-700">{size.diameter_mm} mm</td>
                <td className="px-5 py-4 font-semibold text-brand-600">
                  {formatPrice(getCustomPrice(size))}
                </td>
                <td className="px-5 py-4 text-ink-600">{size.description || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center">
        <Link href="/crea" className="btn-primary inline-block">
          Crea la tua spilla
        </Link>
      </div>
    </div>
  );
}
