import { getPublicSettings } from "@/lib/settings";

export const metadata = { title: "Contatti" };

export default async function ContactPage() {
  const settings = await getPublicSettings();
  const email = (settings.store_email as { email?: string })?.email || "info@valeriasenpai.it";
  const phone = (settings.store_phone as { phone?: string })?.phone || "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-ink-900">Contatti</h1>
      <p className="mt-4 text-ink-700">
        Hai domande sul tuo ordine o sulla personalizzazione? Scrivici!
      </p>
      <div className="mt-8 space-y-4 rounded-2xl border border-brand-100 bg-white p-8">
        <p>
          <span className="font-semibold">Email:</span>{" "}
          <a href={"mailto:" + email} className="text-brand-600 hover:underline">
            {email}
          </a>
        </p>
        {phone && (
          <p>
            <span className="font-semibold">Telefono:</span> {phone}
          </p>
        )}
        <p className="text-sm text-ink-400">
          Rispondiamo entro 24-48 ore lavorative.
        </p>
      </div>
    </div>
  );
}
