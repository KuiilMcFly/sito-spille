import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sparkles, User } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/prodotti", label: "Prodotti" },
  { href: "/crea", label: "Crea la tua spilla" },
  { href: "/contatti", label: "Contatti" },
];

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: adminProfile } = await supabase
      .from("admin_profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = adminProfile?.role === "admin";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white pin-shadow">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-lg font-bold leading-tight text-ink-900">
              Valeria Senpai
            </p>
            <p className="text-xs text-brand-600">Spille Custom</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-700 transition hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/account"
                className="hidden items-center gap-1 text-sm font-medium text-ink-700 hover:text-brand-600 sm:flex"
              >
                <User className="h-4 w-4" />
                Il mio account
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden text-sm font-medium text-ink-400 hover:text-brand-600 md:block"
                >
                  Admin
                </Link>
              )}
            </>
          ) : (
            <Link
              href="/accedi"
              className="text-sm font-medium text-ink-700 hover:text-brand-600"
            >
              Accedi
            </Link>
          )}
          <Link
            href="/crea"
            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600"
          >
            Personalizza
          </Link>
        </div>
      </div>
    </header>
  );
}
