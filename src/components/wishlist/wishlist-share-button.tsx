"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import toast from "react-hot-toast";

export function WishlistShareButton() {
  const [loading, setLoading] = useState(false);

  async function handleShare() {
    setLoading(true);
    try {
      const response = await fetch("/api/wishlist/share");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Errore");

      const shareUrl = data.shareUrl as string;
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "I miei preferiti",
          text: "Guarda la mia lista preferiti",
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link preferiti copiato");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      toast.error(err instanceof Error ? err.message : "Errore condivisione");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
    >
      <Link2 className="h-4 w-4" />
      {loading ? "..." : "Condividi lista"}
    </button>
  );
}
