"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import toast from "react-hot-toast";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "Email o password non validi"
          : error.message
      );
      setLoading(false);
      return;
    }

    window.location.href = redirect;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-ink-900">Accedi</h1>
      <p className="mt-2 text-ink-700">Accedi al tuo account per vedere i tuoi ordini.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-brand-100 bg-white p-8">
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          label="Password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Accesso..." : "Accedi"}
        </Button>
        <p className="text-center text-sm text-ink-700">
          Non hai un account?{" "}
          <Link href="/registrati" className="text-brand-600 underline">
            Registrati
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="py-16 text-center">Caricamento...</p>}>
      <LoginForm />
    </Suspense>
  );
}
