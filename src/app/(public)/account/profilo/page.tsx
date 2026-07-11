"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import type { Tables } from "@/types/database";

export default function AccountProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Tables<"customer_profiles"> | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email || "");
      const { data } = await supabase
        .from("customer_profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("customer_profiles").upsert({
      id: user.id,
      full_name: fullName,
      phone: phone || null,
    });

    if (error) {
      toast.error("Errore salvataggio");
    } else {
      toast.success("Profilo aggiornato");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Link href="/account" className="text-sm text-brand-600 hover:underline">
        Torna all account
      </Link>
      <h1 className="font-display mt-4 text-3xl font-bold text-ink-900">Profilo</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-brand-100 bg-white p-8">
        <Input label="Email" type="email" value={email} disabled />
        <Input label="Nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input label="Telefono" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Button type="submit" disabled={loading}>
          {loading ? "Salvataggio..." : "Salva modifiche"}
        </Button>
      </form>
    </div>
  );
}
