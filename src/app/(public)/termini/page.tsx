import { getStoreBranding } from "@/lib/settings";

export const metadata = { title: "Termini e condizioni" };

export default async function TermsPage() {
  const branding = await getStoreBranding();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-ink-900">
        Termini e condizioni
      </h1>
      <div className="mt-6 space-y-4 text-ink-700">
        <p>
          Acquistando su {branding.fullTitle} accetti i seguenti termini.
        </p>
        <h2 className="text-xl font-bold text-ink-900">Ordini e pagamenti</h2>
        <p>
          Gli ordini sono confermati dopo il pagamento PayPal. I prezzi includono
          IVA ove applicabile. Le spedizioni avvengono in Italia salvo diversa indicazione.
        </p>
        <h2 className="text-xl font-bold text-ink-900">Personalizzazioni</h2>
        <p>
          Sei responsabile del contenuto delle immagini caricate. Non accettiamo
          contenuti illegali, offensivi o che violano diritti di terzi.
        </p>
        <h2 className="text-xl font-bold text-ink-900">Resi</h2>
        <p>
          Le spille personalizzate non sono soggette a reso salvo difetti di
          produzione. Contattaci entro 7 giorni dalla consegna per segnalare problemi.
        </p>
      </div>
    </div>
  );
}
