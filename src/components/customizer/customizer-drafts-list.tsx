"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFinishEffectLabel } from "@/lib/customizer/finish-effects";
import type { CustomizationData, CustomizerDraftWithSize } from "@/types/database";
import toast from "react-hot-toast";

type DraftListItem = CustomizerDraftWithSize & { previewUrl?: string | null };

export function CustomizerDraftsList() {
  const [drafts, setDrafts] = useState<DraftListItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDrafts() {
    setLoading(true);
    try {
      const response = await fetch("/api/customizer/drafts");
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setDrafts(data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDrafts();
  }, []);

  async function deleteDraft(id: string) {
    if (!window.confirm("Eliminare questa bozza?")) return;
    const response = await fetch("/api/customizer/drafts/" + id, { method: "DELETE" });
    if (response.ok) {
      toast.success("Bozza eliminata");
      await loadDrafts();
    } else {
      toast.error("Errore eliminazione");
    }
  }

  if (loading) {
    return <p className="text-ink-500">Caricamento bozze...</p>;
  }

  if (drafts.length === 0) {
    return (
      <p className="text-ink-500">
        Nessuna bozza salvata.{" "}
        <Link href="/crea" className="text-brand-600 underline">
          Crea una spilla
        </Link>
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {drafts.map((draft) => {
        const customization = draft.customization_data as CustomizationData;
        const sizeName = draft.pin_sizes?.name || "Taglia";
        return (
          <div key={draft.id} className="overflow-hidden rounded-2xl border border-brand-100 bg-white">
            <div className="aspect-square bg-brand-50">
              {draft.previewUrl ? (
                <img src={draft.previewUrl} alt="Bozza" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="p-4">
              <h2 className="font-semibold text-ink-900">{draft.name || "Bozza senza nome"}</h2>
              <p className="mt-1 text-sm text-ink-600">{sizeName}</p>
              <p className="text-xs text-ink-400">
                Effetto: {getFinishEffectLabel(customization?.finishEffect)}
              </p>
              <p className="mt-1 text-xs text-ink-400">
                Aggiornata il {new Date(draft.updated_at).toLocaleDateString("it-IT")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={"/crea?draft=" + draft.id}
                  className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
                >
                  Riprendi
                </Link>
                <button
                  type="button"
                  onClick={() => deleteDraft(draft.id)}
                  className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                >
                  Elimina
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
