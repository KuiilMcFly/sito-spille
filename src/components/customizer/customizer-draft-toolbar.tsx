"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Save, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

type CustomizerDraftToolbarProps = {
  loggedIn: boolean;
  saving: boolean;
  onSaveDraft: (name: string | null) => Promise<void>;
};

export function CustomizerDraftToolbar({
  loggedIn,
  saving,
  onSaveDraft,
}: CustomizerDraftToolbarProps) {
  const [draftName, setDraftName] = useState("");

  if (!loggedIn) {
    return (
      <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-ink-700">
        <Link href="/accedi" className="font-semibold text-brand-600 underline">
          Accedi
        </Link>{" "}
        per salvare bozze e riprenderle in seguito.
      </div>
    );
  }

  async function handleSave() {
    try {
      await onSaveDraft(draftName.trim() || null);
      toast.success("Bozza salvata");
      setDraftName("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore salvataggio bozza");
    }
  }

  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
      <p className="text-sm font-semibold text-ink-900">Salva bozza</p>
      <p className="mt-1 text-xs text-ink-600">
        Riprendi la personalizzazione da{" "}
        <Link href="/account/bozze" className="text-brand-600 underline">
          Le mie bozze
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          placeholder="Nome bozza (opzionale)"
          className="min-w-[180px] flex-1 rounded-xl border border-ink-200 px-3 py-2 text-sm"
        />
        <Button type="button" variant="outline" disabled={saving} onClick={handleSave}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salva
        </Button>
        <Link
          href="/account/bozze"
          className="inline-flex items-center rounded-xl border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-white"
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          Bozze
        </Link>
      </div>
    </div>
  );
}

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export { readFileAsDataUrl };
