ALTER TABLE hero_slides
  ADD COLUMN IF NOT EXISTS product_group_id uuid REFERENCES product_groups(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS product_typology_id uuid REFERENCES product_typologies(id) ON DELETE SET NULL;

ALTER TABLE hero_slides
  DROP CONSTRAINT IF EXISTS hero_slides_single_feature_check;

ALTER TABLE hero_slides
  ADD CONSTRAINT hero_slides_single_feature_check CHECK (
    (
      (CASE WHEN product_id IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN product_group_id IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN product_typology_id IS NOT NULL THEN 1 ELSE 0 END)
    ) <= 1
  );
