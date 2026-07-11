import { loadProductionItems } from "@/lib/production/load-production-items";
import { ProductionBoard } from "@/components/admin/production-board";

export const metadata = { title: "Produzione" };

export default async function AdminProductionPage() {
  const items = await loadProductionItems();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Vista produzione</h1>
      <p className="mt-1 text-ink-400">
        Ordini accettati e in produzione con anteprima design, taglia ed effetto pellicola.
      </p>
      <div className="mt-8">
        <ProductionBoard items={items} />
      </div>
    </div>
  );
}
