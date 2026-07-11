"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";

type WishlistButtonProps = {
  productId: string;
  initialSaved?: boolean;
  loggedIn?: boolean;
};

export function WishlistButton({
  productId,
  initialSaved = false,
  loggedIn = false,
}: WishlistButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loggedIn) return;
    fetch("/api/wishlist/" + productId)
      .then((r) => r.json())
      .then((data) => setSaved(Boolean(data.saved)))
      .catch(() => null);
  }, [productId, loggedIn]);

  async function toggle() {
    if (!loggedIn) {
      router.push("/accedi");
      return;
    }

    setLoading(true);
    try {
      if (saved) {
        const response = await fetch("/api/wishlist/" + productId, { method: "DELETE" });
        if (!response.ok) throw new Error("Errore");
        setSaved(false);
        toast.success("Rimosso dai preferiti");
      } else {
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (!response.ok) throw new Error("Errore");
        setSaved(true);
        toast.success("Aggiunto ai preferiti");
      }
    } catch {
      toast.error("Operazione non riuscita");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition " +
        (saved
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-brand-200 bg-white text-ink-700 hover:bg-brand-50")
      }
    >
      <Heart className={"h-4 w-4 " + (saved ? "fill-current" : "")} />
      {saved ? "Nei preferiti" : "Preferiti"}
    </button>
  );
}
