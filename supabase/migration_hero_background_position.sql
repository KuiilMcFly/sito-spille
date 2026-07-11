ALTER TABLE hero_slides
  ADD COLUMN IF NOT EXISTS background_position text NOT NULL DEFAULT '50% 50%';
