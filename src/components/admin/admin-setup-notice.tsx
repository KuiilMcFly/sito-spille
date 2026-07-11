type AdminSetupNoticeProps = {
  missing: string[];
  present: string[];
};

export function AdminSetupNotice({ missing, present }: AdminSetupNoticeProps) {
  return (
    <div className="max-w-xl rounded-xl border border-amber-500/40 bg-amber-500/10 p-6">
      <h1 className="text-xl font-bold text-amber-100">Configurazione Supabase mancante</h1>
      <p className="mt-3 text-sm text-amber-50/90">
        Il pannello admin non puo connettersi al database. Su Vercel vai in
        Project Settings → Environment Variables, aggiungi le variabili mancanti
        per Production e Preview, poi fai Redeploy.
      </p>

      {missing.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-red-200">Mancanti su Vercel</p>
          <ul className="mt-2 space-y-2 text-sm font-mono text-red-100">
            {missing.map((name) => (
              <li key={name}>- {name}</li>
            ))}
          </ul>
        </div>
      )}

      {present.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-emerald-200">Gia presenti</p>
          <ul className="mt-2 space-y-2 text-sm font-mono text-emerald-100">
            {present.map((name) => (
              <li key={name}>- {name}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 rounded-lg bg-ink-900/40 p-4 text-sm text-amber-50/90">
        <p className="font-semibold text-amber-100">Dove trovare i valori</p>
        <p className="mt-2">
          Supabase Dashboard → il tuo progetto → Settings → API Keys
        </p>
        <ul className="mt-3 space-y-1 font-mono text-xs">
          <li>URL del progetto → NEXT_PUBLIC_SUPABASE_URL</li>
          <li>Publishable key → NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</li>
          <li>Secret key → SUPABASE_SECRET_KEY</li>
        </ul>
      </div>
    </div>
  );
}

export function getSupabaseEnvStatus() {
  const checks = [
    {
      name: "NEXT_PUBLIC_SUPABASE_URL",
      ok: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
      ),
    },
    {
      name: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      ok: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          process.env.SUPABASE_ANON_KEY
      ),
    },
    {
      name: "SUPABASE_SECRET_KEY",
      ok: Boolean(
        process.env.SUPABASE_SECRET_KEY ||
          process.env.SUPABASE_SERVICE_ROLE_KEY ||
          process.env.SUPABASE_SERVICE_KEY
      ),
    },
  ];

  return {
    missing: checks.filter((item) => !item.ok).map((item) => item.name),
    present: checks.filter((item) => item.ok).map((item) => item.name),
    ready: checks.every((item) => item.ok),
  };
}
