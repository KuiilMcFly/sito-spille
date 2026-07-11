import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddressesManager } from "@/components/account/addresses-manager";

export const metadata = { title: "Indirizzi salvati" };

export default async function AccountAddressesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/accedi");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/account" className="text-sm text-brand-600 hover:underline">
        Torna all account
      </Link>
      <h1 className="font-display mt-4 text-3xl font-bold text-ink-900">Indirizzi salvati</h1>
      <p className="mt-2 text-ink-600">Usati al checkout per spedire piu velocemente.</p>
      <div className="mt-8">
        <AddressesManager />
      </div>
    </div>
  );
}
