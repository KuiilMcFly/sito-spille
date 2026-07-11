export function AdminSetupNotice() {
  return (
    <div className="max-w-xl rounded-xl border border-amber-500/40 bg-amber-500/10 p-6">
      <h1 className="text-xl font-bold text-amber-100">Configurazione Supabase mancante</h1>
      <p className="mt-3 text-sm text-amber-50/90">
        Il pannello admin non puo connettersi al database. Aggiungi queste variabili
        su Vercel in Settings → Environment Variables, poi esegui un redeploy.
      </p>
      <ul className="mt-4 space-y-2 text-sm font-mono text-amber-100">
        <li>NEXT_PUBLIC_SUPABASE_URL</li>
        <li>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</li>
        <li>SUPABASE_SECRET_KEY</li>
      </ul>
    </div>
  );
}
