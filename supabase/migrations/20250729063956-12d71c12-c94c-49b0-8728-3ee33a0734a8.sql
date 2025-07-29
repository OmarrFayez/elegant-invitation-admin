-- Regenerate slugs for existing weddings to use Arabic names properly
UPDATE public.weddings 
SET slug = (
  CASE 
    WHEN language = 'ar' THEN
      TRIM(BOTH '-' FROM REGEXP_REPLACE(
        TRIM(CONCAT(
          COALESCE(groom_name, ''),
          CASE WHEN groom_name IS NOT NULL AND bride_name IS NOT NULL THEN '-و-' ELSE '' END,
          COALESCE(bride_name, '')
        )), 
        '\s+', '-', 'g'
      ))
    ELSE
      TRIM(BOTH '-' FROM REGEXP_REPLACE(
        LOWER(TRIM(CONCAT(
          COALESCE(groom_name, ''),
          CASE WHEN groom_name IS NOT NULL AND bride_name IS NOT NULL THEN '-and-' ELSE '' END,
          COALESCE(bride_name, '')
        ))), 
        '[^a-z0-9]+', '-', 'g'
      ))
  END
)
WHERE slug IS NOT NULL;

-- Regenerate slugs for existing events to use Arabic names properly  
UPDATE public.events 
SET slug = (
  CASE 
    WHEN language = 'ar' THEN
      TRIM(BOTH '-' FROM REGEXP_REPLACE(TRIM(event_name), '\s+', '-', 'g'))
    ELSE
      TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(TRIM(event_name)), '[^a-z0-9]+', '-', 'g'))
  END
)
WHERE slug IS NOT NULL;