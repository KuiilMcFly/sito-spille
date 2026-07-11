import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Ruler,
  ShoppingCart,
  CreditCard,
  Settings,
  LogOut,
  Truck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/prodotti", label: "Prodotti", icon: Package },
  { href: "/admin/taglie", label: "Taglie", icon: Ruler },
  { href: "/admin/spedizioni", label: "Spedizioni", icon: Truck },
  { href: "/admin/ordini", label: "Ordini", icon: ShoppingCart },
  { href: "/admin/pagamenti", label: "Pagamenti", icon: CreditCard },
  { href: "/admin/impostazioni", label: "Impostazioni", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen bg-ink-900">
      {user && (
        <aside className="hidden w-64 flex-shrink-0 border-r border-ink-700 bg-ink-900 p-4 md:block">
          <Link href="/admin" className="block px-3 py-4">
            <p className="font-display text-lg font-bold text-white">
              Valeria Senpai
            </p>
            <p className="text-xs text-brand-300">Pannello Admin</p>
          </Link>
          <nav className="mt-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-200 transition hover:bg-ink-700 hover:text-white"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <form action="/admin/logout" method="POST" className="mt-8">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 transition hover:bg-ink-700"
            >
              <LogOut className="h-4 w-4" />
              Esci
            </button>
          </form>
        </aside>
      )}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}
