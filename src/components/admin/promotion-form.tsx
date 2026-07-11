"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DeleteResourceButton } from "@/components/admin/delete-resource-button";
import {
  PROMOTION_TYPE_INSTRUCTIONS,
  PROMOTION_TYPE_LABELS,
  PROMOTION_TYPES,
  PROMOTION_TARGET_LABELS,
  type PromotionWithTargets,
} from "@/lib/promotions/types";
import type { Enums, Tables } from "@/types/database";
import toast from "react-hot-toast";

type TargetRow = {
  target_type: Enums<"promotion_target_type">;
  target_id: string;
};

type PromotionFormProps = {
  promotion?: PromotionWithTargets;
  products: Tables<"products">[];
  groups: Tables<"product_groups">[];
  typologies: Tables<"product_typologies">[];
};

export function PromotionForm({
  promotion,
  products,
  groups,
  typologies,
}: PromotionFormProps) {
  const router = useRouter();
  const [name, setName] = useState(promotion?.name || "");
  const [code, setCode] = useState(promotion?.code || "");
  const [promotionType, setPromotionType] = useState<Enums<"promotion_type">>(
    promotion?.promotion_type || "percent_off"
  );
  const [isActive, setIsActive] = useState(promotion?.is_active ?? true);
  const [startsAt, setStartsAt] = useState(
    promotion?.starts_at ? promotion.starts_at.slice(0, 16) : ""
  );
  const [endsAt, setEndsAt] = useState(
    promotion?.ends_at ? promotion.ends_at.slice(0, 16) : ""
  );
  const [priority, setPriority] = useState(String(promotion?.priority ?? 0));
  const [usageLimit, setUsageLimit] = useState(
    promotion?.usage_limit != null ? String(promotion.usage_limit) : ""
  );
  const [minCartAmount, setMinCartAmount] = useState(
    promotion?.min_cart_amount != null ? String(promotion.min_cart_amount) : ""
  );
  const [minQuantity, setMinQuantity] = useState(String(promotion?.min_quantity ?? 1));
  const [discountValue, setDiscountValue] = useState(String(promotion?.discount_value ?? 0));
  const [bundleQuantity, setBundleQuantity] = useState(
    promotion?.bundle_quantity != null ? String(promotion.bundle_quantity) : ""
  );
  const [requiresCode, setRequiresCode] = useState(promotion?.requires_code ?? false);
  const [usageInstructions, setUsageInstructions] = useState(
    promotion?.usage_instructions || PROMOTION_TYPE_INSTRUCTIONS.percent_off
  );
  const [adminNotes, setAdminNotes] = useState(promotion?.admin_notes || "");
  const [targets, setTargets] = useState<TargetRow[]>(
    promotion?.promotion_targets?.length
      ? promotion.promotion_targets.map((t) => ({
          target_type: t.target_type,
          target_id: t.target_id || "",
        }))
      : [{ target_type: "all", target_id: "" }]
  );
  const [loading, setLoading] = useState(false);

  function handleTypeChange(value: Enums<"promotion_type">) {
    setPromotionType(value);
    if (!promotion) {
      setUsageInstructions(PROMOTION_TYPE_INSTRUCTIONS[value]);
    }
  }

  function updateTarget(index: number, patch: Partial<TargetRow>) {
    setTargets((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  function addTarget() {
    setTargets((rows) => [...rows, { target_type: "product", target_id: "" }]);
  }

  function removeTarget(index: number) {
    setTargets((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      code: code.trim() || null,
      promotion_type: promotionType,
      is_active: isActive,
      starts_at: startsAt || null,
      ends_at: endsAt || null,
      priority,
      usage_limit: usageLimit || null,
      min_cart_amount: minCartAmount || null,
      min_quantity: minQuantity,
      discount_value: discountValue,
      bundle_quantity: bundleQuantity || null,
      requires_code: requiresCode,
      usage_instructions: usageInstructions,
      admin_notes: adminNotes || null,
      targets: targets
        .filter((t) => t.target_type === "all" || t.target_id)
        .map((t) => ({
          target_type: t.target_type,
          target_id: t.target_type === "all" ? null : t.target_id,
        })),
    };

    const url = promotion
      ? "/api/admin/promotions/" + promotion.id
      : "/api/admin/promotions";
    const method = promotion ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      toast.error("Errore salvataggio promozione");
      setLoading(false);
      return;
    }

    toast.success(promotion ? "Promozione aggiornata" : "Promozione creata");
    router.push("/admin/sconti");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-4">
        <p className="text-sm font-medium text-brand-200">Come funziona</p>
        <p className="mt-2 text-sm text-ink-300">{PROMOTION_TYPE_INSTRUCTIONS[promotionType]}</p>
      </div>

      <Input label="Nome promozione" required value={name} onChange={(e) => setName(e.target.value)} />
      <Input
        label="Codice sconto (opzionale)"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-200">Tipo promozione</label>
        <select
          value={promotionType}
          onChange={(e) => handleTypeChange(e.target.value as Enums<"promotion_type">)}
          className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-white"
        >
          {PROMOTION_TYPES.map((type) => (
            <option key={type} value={type}>
              {PROMOTION_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <Textarea
        label="Istruzioni uso (visibili in admin)"
        rows={4}
        required
        value={usageInstructions}
        onChange={(e) => setUsageInstructions(e.target.value)}
      />
      <Textarea
        label="Note interne admin"
        rows={2}
        value={adminNotes}
        onChange={(e) => setAdminNotes(e.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Priorita" type="number" value={priority} onChange={(e) => setPriority(e.target.value)} />
        <Input
          label="Limite utilizzi"
          type="number"
          value={usageLimit}
          onChange={(e) => setUsageLimit(e.target.value)}
        />
        <Input
          label="Minimo carrello EUR"
          type="number"
          step="0.01"
          value={minCartAmount}
          onChange={(e) => setMinCartAmount(e.target.value)}
        />
        <Input
          label="Quantita minima"
          type="number"
          value={minQuantity}
          onChange={(e) => setMinQuantity(e.target.value)}
        />
        <Input
          label="Sconto / valore"
          type="number"
          step="0.01"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
        />
        <Input
          label="Quantita bundle"
          type="number"
          value={bundleQuantity}
          onChange={(e) => setBundleQuantity(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Inizio validita"
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
        />
        <Input
          label="Fine validita"
          type="datetime-local"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-200">
        <input type="checkbox" checked={requiresCode} onChange={(e) => setRequiresCode(e.target.checked)} />
        Richiede codice al checkout
      </label>
      <label className="flex items-center gap-2 text-sm text-ink-200">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Attiva
      </label>

      <div className="space-y-3 rounded-xl border border-ink-700 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink-200">Target (prodotti, gruppi, tipologie)</p>
          <Button type="button" size="sm" variant="secondary" onClick={addTarget}>
            Aggiungi target
          </Button>
        </div>
        {targets.map((target, index) => (
          <div key={index} className="grid gap-2 sm:grid-cols-3">
            <select
              value={target.target_type}
              onChange={(e) =>
                updateTarget(index, {
                  target_type: e.target.value as Enums<"promotion_target_type">,
                  target_id: "",
                })
              }
              className="rounded-xl border border-ink-600 bg-ink-900 px-3 py-2 text-sm text-white"
            >
              {Object.entries(PROMOTION_TARGET_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {target.target_type !== "all" && (
              <select
                value={target.target_id}
                onChange={(e) => updateTarget(index, { target_id: e.target.value })}
                className="rounded-xl border border-ink-600 bg-ink-900 px-3 py-2 text-sm text-white sm:col-span-2"
              >
                <option value="">Seleziona...</option>
                {target.target_type === "product" &&
                  products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                {target.target_type === "product_group" &&
                  groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                {target.target_type === "product_typology" &&
                  typologies.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>
            )}
            {targets.length > 1 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => removeTarget(index)}>
                Rimuovi
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvataggio..." : "Salva promozione"}
        </Button>
        {promotion && (
          <DeleteResourceButton
            apiUrl={"/api/admin/promotions/" + promotion.id}
            redirectTo="/admin/sconti"
            resourceLabel={"la promozione \"" + promotion.name + "\""}
          />
        )}
      </div>
    </form>
  );
}
