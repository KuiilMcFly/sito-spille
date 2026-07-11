"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { buildThemeColors, normalizeHex } from "@/lib/theme/generate-palette";
import { DEFAULT_THEME } from "@/lib/theme/defaults";

type ThemeSettingsFormProps = {
  initialPrimary?: string;
  initialAccent?: string;
};

export function ThemeSettingsForm({
  initialPrimary,
  initialAccent,
}: ThemeSettingsFormProps) {
  const [primary, setPrimary] = useState(initialPrimary || DEFAULT_THEME.primary);
  const [accent, setAccent] = useState(initialAccent || DEFAULT_THEME.accent);
  const [loading, setLoading] = useState(false);

  const preview = useMemo(
    () => buildThemeColors({ primary, accent }),
    [primary, accent]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "theme_colors",
          value: {
            primary: normalizeHex(primary),
            accent: normalizeHex(accent),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Errore salvataggio");
      }

      toast.success("Colori aggiornati. Ricarica il sito per vederli ovunque.");
      window.location.reload();
    } catch {
      toast.error("Impossibile salvare i colori");
    } finally {
      setLoading(false);
    }
  }

  function handlePrimaryChange(value: string) {
    setPrimary(normalizeHex(value));
  }

  function handleAccentChange(value: string) {
    setAccent(normalizeHex(value));
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5 rounded-xl border border-ink-700 bg-ink-800 p-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Colori del sito</h2>
        <p className="mt-1 text-sm text-ink-400">
          Scegli il colore principale: la palette rosa del sito si adattera automaticamente.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-ink-300">
            Colore principale
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={normalizeHex(primary)}
              onChange={(e) => handlePrimaryChange(e.target.value)}
              className="h-11 w-14 cursor-pointer rounded-lg border border-ink-600 bg-transparent"
            />
            <Input
              value={normalizeHex(primary)}
              onChange={(e) => handlePrimaryChange(e.target.value)}
              className="font-mono uppercase"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink-300">
            Colore accento
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={normalizeHex(accent)}
              onChange={(e) => handleAccentChange(e.target.value)}
              className="h-11 w-14 cursor-pointer rounded-lg border border-ink-600 bg-transparent"
            />
            <Input
              value={normalizeHex(accent)}
              onChange={(e) => handleAccentChange(e.target.value)}
              className="font-mono uppercase"
            />
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-ink-300">Anteprima palette</p>
        <div className="grid grid-cols-7 gap-2">
          {[preview.brand50, preview.brand100, preview.brand200, preview.brand300, preview.brand400, preview.brand500, preview.brand600].map(
            (color) => (
              <div
                key={color}
                className="h-10 rounded-lg border border-ink-600"
                style={{ backgroundColor: color }}
                title={color}
              />
            )
          )}
        </div>
      </div>

      <div
        className="rounded-2xl border border-ink-600 p-5"
        style={{ background: preview.background }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: preview.brand600 }}>
          Anteprima home
        </p>
        <h3 className="mt-2 text-2xl font-bold text-ink-900">Valeria Senpai Spille</h3>
        <p className="mt-2 text-sm text-ink-700">Esempio di come apparira la palette sul sito.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span
            className="rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: preview.brand500 }}
          >
            CTA principale
          </span>
          <span
            className="rounded-full border-2 px-4 py-2 text-sm font-semibold"
            style={{ borderColor: preview.brand300, color: preview.brand700 }}
          >
            Secondario
          </span>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Salvataggio..." : "Salva colori"}
      </Button>
    </form>
  );
}
