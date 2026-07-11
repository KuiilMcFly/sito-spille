CREATE TABLE IF NOT EXISTS customizer_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pin_size_id uuid NOT NULL REFERENCES pin_sizes(id) ON DELETE CASCADE,
  name text,
  source_path text NOT NULL,
  preview_path text,
  customization_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customizer_drafts_user ON customizer_drafts(user_id);

CREATE TABLE IF NOT EXISTS customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Casa',
  full_name text,
  phone text,
  street_line1 text NOT NULL,
  street_line2 text,
  city text NOT NULL,
  province text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'IT',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_user ON customer_addresses(user_id);

CREATE TABLE IF NOT EXISTS wishlist_shares (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  share_token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE customizer_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own drafts" ON customizer_drafts;
CREATE POLICY "Users manage own drafts" ON customizer_drafts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own addresses" ON customer_addresses;
CREATE POLICY "Users manage own addresses" ON customer_addresses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own wishlist share" ON wishlist_shares;
CREATE POLICY "Users manage own wishlist share" ON wishlist_shares
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public read wishlist share token" ON wishlist_shares;
CREATE POLICY "Public read wishlist share token" ON wishlist_shares
  FOR SELECT USING (true);
