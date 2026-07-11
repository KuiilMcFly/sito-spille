ALTER TABLE hero_slides
  ADD COLUMN IF NOT EXISTS product_position text NOT NULL DEFAULT 'center';

ALTER TABLE hero_slides
  DROP CONSTRAINT IF EXISTS hero_slides_product_position_check;

ALTER TABLE hero_slides
  ADD CONSTRAINT hero_slides_product_position_check
  CHECK (product_position IN ('left', 'center', 'right'));
