ALTER TABLE pin_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active pin sizes" ON pin_sizes;
CREATE POLICY "Public read active pin sizes" ON pin_sizes
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read active products" ON products;
CREATE POLICY "Public read active products" ON products
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read active product images" ON product_images;
CREATE POLICY "Public read active product images" ON product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_images.product_id AND p.is_active = true
    )
  );

DROP POLICY IF EXISTS "Public read active shipping methods" ON shipping_methods;
CREATE POLICY "Public read active shipping methods" ON shipping_methods
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read site settings" ON site_settings;
CREATE POLICY "Public read site settings" ON site_settings
  FOR SELECT USING (true);

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
