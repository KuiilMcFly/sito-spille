import { getPublicSettings, getStoreBranding } from "@/lib/settings";

export const metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const [branding, settings] = await Promise.all([
    getStoreBranding(),
    getPublicSettings(),
  ]);
  const email =
    (settings.store_email as { email?: string })?.email || "info@valeriasenpai.it";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-ink">
      <h1 className="font-display text-4xl font-bold">Privacy Policy</h1>
      <p className="mt-4 text-ink-700">
        {branding.fullTitle} rispetta la tua privacy. I dati raccolti
        (email, telefono, immagini caricate) sono utilizzati esclusivamente per
        elaborare e consegnare il tuo ordine.
      </p>
      <h2 className="mt-8 text-xl font-bold">Dati raccolti</h2>
      <ul className="mt-2 list-disc pl-6 text-ink-700">
        <li>Dati di contatto forniti al checkout</li>
        <li>Immagini caricate per la personalizzazione</li>
        <li>Dati di pagamento gestiti da PayPal (non memorizziamo dati carta)</li>
      </ul>
      <h2 className="mt-8 text-xl font-bold">Diritti dell&apos;utente</h2>
      <p className="mt-2 text-ink-700">
        Puoi richiedere accesso, rettifica o cancellazione dei tuoi dati
        scrivendo a {email}.
      </p>
    </div>
  );
}
