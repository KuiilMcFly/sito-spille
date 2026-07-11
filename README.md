# Valeria Senpai Spille Custom

E-commerce per spille rotonde personalizzate con Next.js, Supabase e PayPal.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres, Auth, Storage, RLS)
- PayPal Checkout Orders API v2
- Resend (email transazionali, opzionale)

## Setup locale

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

## Variabili ambiente

Vedi `.env.local.example` per l'elenco completo.

## Creare utente admin

1. Vai su Supabase Dashboard → Authentication → Users → Add user
2. Copia l'UUID dell'utente
3. Esegui in SQL Editor:

```sql
INSERT INTO admin_profiles (id, full_name, role)
VALUES ('UUID-UTENTE', 'Admin', 'admin');
```

## PayPal Sandbox

1. Crea app su [developer.paypal.com](https://developer.paypal.com)
2. Inserisci `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` in `.env.local`
3. Configura webhook su `https://tuodominio.com/api/webhooks/paypal`
4. Inserisci `PAYPAL_WEBHOOK_ID`

## Struttura

- `/` — Home e vetrina
- `/crea` — Customizer spilla
- `/prodotti` — Catalogo
- `/admin` — Pannello gestionale

## Database

Schema applicato su Supabase con tabelle: `pin_sizes`, `products`, `product_images`, `orders`, `order_items`, `payments`, `payment_events`, `order_status_history`, `site_settings`, `admin_profiles`.
