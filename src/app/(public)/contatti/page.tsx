import { getPublicSettings, getSocialLinks } from "@/lib/settings";

export const metadata = { title: "Contatti" };

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  youtube: "YouTube",
  threads: "Threads",
};

export default async function ContactPage() {
  const [settings, social] = await Promise.all([
    getPublicSettings(),
    getSocialLinks(),
  ]);
  const email = (settings.store_email as { email?: string })?.email || "info@valeriasenpai.it";
  const phone = (settings.store_phone as { phone?: string })?.phone || "";
  const socialEntries = Object.entries(social).filter(([, url]) => url && String(url).trim());

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
        {socialEntries.length > 0 && (
          <div>
            <p className="font-semibold">Social</p>
            <ul className="mt-2 space-y-1">
              {socialEntries.map(([key, url]) => (
                <li key={key}>
                  <a
                    href={String(url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:underline"
                  >
                    {SOCIAL_LABELS[key] || key}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="text-sm text-ink-400">
          Rispondiamo entro 24-48 ore lavorative.
        </p>
      </div>
    </div>
  );
}
