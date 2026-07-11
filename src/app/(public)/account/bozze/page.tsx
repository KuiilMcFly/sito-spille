import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CustomizerDraftsList } from "@/components/customizer/customizer-drafts-list";

export const metadata = { title: "Le mie bozze" };

export default async function AccountDraftsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/accedi");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/account" className="text-sm text-brand-600 hover:underline">
        Torna all account
      </Link>
      <h1 className="font-display mt-4 text-3xl font-bold text-ink-900">Le mie bozze</h1>
      <p className="mt-2 text-ink-600">Riprendi le personalizzazioni salvate dal customizer.</p>
      <div className="mt-8">
        <CustomizerDraftsList />
      </div>
    </div>
  );
}
