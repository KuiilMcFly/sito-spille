ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS tracking_url text,
  ADD COLUMN IF NOT EXISTS discount_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS promotion_id uuid,
  ADD COLUMN IF NOT EXISTS promotion_code text;

CREATE TYPE promotion_type AS ENUM (
  'percent_off',
  'fixed_off',
  'free_shipping',
  'bundle_fixed_price',
  'bundle_percent_off',
  'quantity_deal'
);

CREATE TYPE promotion_target_type AS ENUM (
  'all',
  'product',
  'product_group',
  'product_typology'
);

CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE,
  promotion_type promotion_type NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  priority int NOT NULL DEFAULT 0,
  usage_limit int,
  usage_count int NOT NULL DEFAULT 0,
  min_cart_amount numeric,
  min_quantity int NOT NULL DEFAULT 1,
  discount_value numeric NOT NULL DEFAULT 0,
  bundle_quantity int,
  requires_code boolean NOT NULL DEFAULT false,
  usage_instructions text NOT NULL,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promotion_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id uuid NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  target_type promotion_target_type NOT NULL,
  target_id uuid
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_promotion_targets_unique
  ON promotion_targets(promotion_id, target_type, COALESCE(target_id, '00000000-0000-0000-0000-000000000000'::uuid));

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_promotion_id_fkey;

ALTER TABLE orders
  ADD CONSTRAINT orders_promotion_id_fkey
  FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_promotion_targets_promotion ON promotion_targets(promotion_id);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_targets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own wishlist" ON wishlist_items;
CREATE POLICY "Users manage own wishlist" ON wishlist_items
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public read active promotions" ON promotions;
CREATE POLICY "Public read active promotions" ON promotions
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read promotion targets" ON promotion_targets;
CREATE POLICY "Public read promotion targets" ON promotion_targets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM promotions p
      WHERE p.id = promotion_targets.promotion_id AND p.is_active = true
    )
  );
