"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

type DeleteResourceButtonProps = {
  apiUrl: string;
  resourceLabel: string;
  redirectTo?: string;
  variant?: "button" | "link";
  size?: "sm" | "md";
};

export function DeleteResourceButton({
  apiUrl,
  resourceLabel,
  redirectTo,
  variant = "button",
  size = "md",
}: DeleteResourceButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const message = "Eliminare " + resourceLabel + "? L'operazione non puo essere annullata.";
    if (!window.confirm(message)) return;

    setLoading(true);
    const response = await fetch(apiUrl, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      toast.error(data.error || "Errore eliminazione");
      setLoading(false);
      return;
    }

    toast.success("Eliminato");
    if (redirectTo) {
      router.push(redirectTo);
    }
    router.refresh();
    setLoading(false);
  }

  if (variant === "link") {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="text-red-400 hover:text-red-300 hover:underline disabled:opacity-50"
      >
        {loading ? "Eliminazione..." : "Elimina"}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="danger"
      size={size}
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {loading ? "Eliminazione..." : "Elimina"}
    </Button>
  );
}
