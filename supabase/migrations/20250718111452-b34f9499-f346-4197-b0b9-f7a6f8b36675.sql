-- Add slug column to weddings table for SEO-friendly URLs
ALTER TABLE public.weddings 
ADD COLUMN slug VARCHAR(255) UNIQUE;

-- Create function to generate slug from names
CREATE OR REPLACE FUNCTION generate_wedding_slug(groom_name TEXT, bride_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from names
  base_slug := LOWER(TRIM(CONCAT(
    COALESCE(groom_name, ''),
    CASE WHEN groom_name IS NOT NULL AND bride_name IS NOT NULL THEN '-and-' ELSE '' END,
    COALESCE(bride_name, '')
  )));
  
  -- Replace spaces and special characters with hyphens
  base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9]+', '-', 'g');
  -- Remove leading/trailing hyphens
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- Ensure slug is not empty
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'wedding-invitation';
  END IF;
  
  final_slug := base_slug;
  
  -- Handle duplicates by adding counter
  WHILE EXISTS (SELECT 1 FROM weddings WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Update existing records with generated slugs
UPDATE public.weddings 
SET slug = generate_wedding_slug(groom_name, bride_name)
WHERE slug IS NULL;