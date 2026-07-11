"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const urlError = searchParams.get("error");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Email o password non corretti"
          : authError.message
      );
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Errore durante l'accesso");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      await supabase.auth.signOut();
      setError("Account non autorizzato come admin");
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-4 rounded-2xl border border-ink-700 bg-ink-800 p-8"
      >
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-white">
            Admin Login
          </h1>
          <p className="mt-1 text-sm text-ink-400">Valeria Senpai Spille Custom</p>
        </div>

        {(error || urlError) && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error || (urlError === "unauthorized" ? "Accesso non autorizzato" : "Errore accesso")}
          </p>
        )}

        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-ink-600 bg-ink-900 text-white"
        />
        <PasswordInput
          label="Password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-ink-600 bg-ink-900 text-white"
          labelClassName="text-ink-200"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Accesso..." : "Accedi"}
        </Button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
