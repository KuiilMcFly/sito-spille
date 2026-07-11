"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import toast from "react-hot-toast";

type ShareButtonProps = {
  title: string;
  text?: string;
  url: string;
  className?: string;
};

export function ShareButton({ title, text, url, className }: ShareButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleShare() {
    setLoading(true);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title,
          text: text || title,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copiato negli appunti");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiato negli appunti");
      } catch {
        toast.error("Impossibile condividere");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={loading}
      className={
        className ||
        "inline-flex items-center gap-2 rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
      }
    >
      <Share2 className="h-4 w-4" />
      {loading ? "..." : "Condividi"}
    </button>
  );
}
