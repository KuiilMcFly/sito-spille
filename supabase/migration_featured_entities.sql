ALTER TABLE product_groups
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

ALTER TABLE product_typologies
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

ALTER TABLE pin_sizes
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_product_groups_featured ON product_groups(is_featured, sort_order);
CREATE INDEX IF NOT EXISTS idx_product_typologies_featured ON product_typologies(is_featured, sort_order);
CREATE INDEX IF NOT EXISTS idx_pin_sizes_featured ON pin_sizes(is_featured, sort_order);
