"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-2xl border border-brand-200 bg-white p-4 shadow-xl md:left-auto md:right-6">
      <p className="text-sm text-ink-700">
        Utilizziamo cookie tecnici per il funzionamento del sito. Continuando
        accetti la nostra{" "}
        <Link href="/cookie" className="text-brand-600 underline">
          Cookie Policy
        </Link>
        .
      </p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={accept}>
          Accetta
        </Button>
      </div>
    </div>
  );
}
