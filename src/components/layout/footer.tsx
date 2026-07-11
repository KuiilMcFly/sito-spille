import Link from "next/link";
import { getStoreBranding, getSocialLinks } from "@/lib/settings";

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  youtube: "YouTube",
  threads: "Threads",
};

export async function FooterSocialLinks() {
  const social = await getSocialLinks();
  const entries = Object.entries(social).filter(([, url]) => url && String(url).trim());

  if (entries.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {entries.map(([key, url]) => (
        <a
          key={key}
          href={String(url)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-brand-600 hover:underline"
        >
          {SOCIAL_LABELS[key] || key}
        </a>
      ))}
    </div>
  );
}

export async function Footer() {
  const branding = await getStoreBranding();

  return (
    <footer className="mt-auto border-t border-brand-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold text-ink-900">
            {branding.fullTitle}
          </p>
          <p className="mt-2 text-sm text-ink-700">
            Spille rotonde personalizzate per zaini, borse e collezioni anime.
          </p>
          <FooterSocialLinks />
        </div>
        <div>
          <p className="font-semibold text-ink-900">Link utili</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-700">
            <li>
              <Link href="/gruppi" className="hover:text-brand-600">
                Gruppi
              </Link>
            </li>
            <li>
              <Link href="/prodotti" className="hover:text-brand-600">
                Catalogo
              </Link>
            </li>
            <li>
              <Link href="/crea" className="hover:text-brand-600">
                Crea la tua spilla
              </Link>
            </li>
            <li>
              <Link href="/contatti" className="hover:text-brand-600">
                Contatti
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-ink-900">Legale</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-700">
            <li>
              <Link href="/privacy" className="hover:text-brand-600">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/termini" className="hover:text-brand-600">
                Termini e condizioni
              </Link>
            </li>
            <li>
              <Link href="/cookie" className="hover:text-brand-600">
                Cookie Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-100 py-4 text-center text-xs text-ink-400">
        © {new Date().getFullYear()} {branding.fullTitle}. Tutti i diritti riservati.
      </div>
    </footer>
  );
}
