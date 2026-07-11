"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error || !data.user) {
      toast.error(error?.message || "Errore registrazione");
      setLoading(false);
      return;
    }

    await supabase.from("customer_profiles").upsert({
      id: data.user.id,
      full_name: fullName,
      phone: phone || null,
    });

    toast.success("Account creato! Benvenuto.");
    router.push("/account");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-ink-900">Registrati</h1>
      <p className="mt-2 text-ink-700">Crea un account per tracciare i tuoi ordini.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-brand-100 bg-white p-8">
        <Input label="Nome completo" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Telefono" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <PasswordInput
          label="Password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Registrazione..." : "Crea account"}
        </Button>
        <p className="text-center text-sm text-ink-700">
          Hai già un account?{" "}
          <Link href="/accedi" className="text-brand-600 underline">
            Accedi
          </Link>
        </p>
      </form>
    </div>
  );
}
