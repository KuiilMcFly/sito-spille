CREATE TABLE IF NOT EXISTS product_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  cover_path text,
  background_path text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_typologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  background_path text NOT NULL,
  title_override text,
  subtitle_override text,
  cta_label text DEFAULT 'Scopri',
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  product_position text NOT NULL DEFAULT 'center' CHECK (product_position IN ('left', 'center', 'right')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS author text,
  ADD COLUMN IF NOT EXISTS product_group_id uuid REFERENCES product_groups(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS product_typology_id uuid REFERENCES product_typologies(id) ON DELETE SET NULL;

ALTER TYPE order_type ADD VALUE IF NOT EXISTS 'mixed';

CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_group ON products(product_group_id);
CREATE INDEX IF NOT EXISTS idx_products_typology ON products(product_typology_id);
CREATE INDEX IF NOT EXISTS idx_product_groups_slug ON product_groups(slug);
CREATE INDEX IF NOT EXISTS idx_product_typologies_slug ON product_typologies(slug);
CREATE INDEX IF NOT EXISTS idx_hero_slides_active ON hero_slides(is_active, sort_order);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets',
  'site-assets',
  true,
  52428800,
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
    'image/svg+xml',
    'image/bmp',
    'image/x-icon',
    'image/vnd.microsoft.icon',
    'image/heic',
    'image/heif',
    'image/tiff'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

ALTER TABLE product_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_typologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active groups" ON product_groups
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active typologies" ON product_typologies
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active hero slides" ON hero_slides
  FOR SELECT USING (is_active = true);
