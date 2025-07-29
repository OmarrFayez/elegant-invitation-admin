-- Update wedding slug generation function to handle Arabic text
CREATE OR REPLACE FUNCTION public.generate_wedding_slug(groom_name text, bride_name text, language text DEFAULT 'en')
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from names
  base_slug := TRIM(CONCAT(
    COALESCE(groom_name, ''),
    CASE WHEN groom_name IS NOT NULL AND bride_name IS NOT NULL THEN 
      CASE WHEN language = 'ar' THEN '-و-' ELSE '-and-' END 
    ELSE '' END,
    COALESCE(bride_name, '')
  ));
  
  -- For Arabic text, preserve Arabic characters and only replace spaces with hyphens
  IF language = 'ar' THEN
    base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
    base_slug := TRIM(BOTH '-' FROM base_slug);
  ELSE
    -- For non-Arabic, use the original logic
    base_slug := LOWER(base_slug);
    base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9]+', '-', 'g');
    base_slug := TRIM(BOTH '-' FROM base_slug);
  END IF;
  
  -- Ensure slug is not empty
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := CASE WHEN language = 'ar' THEN 'دعوة-زفاف' ELSE 'wedding-invitation' END;
  END IF;
  
  final_slug := base_slug;
  
  -- Handle duplicates by adding counter
  WHILE EXISTS (SELECT 1 FROM public.weddings WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$function$;

-- Update event slug generation function to handle Arabic text
CREATE OR REPLACE FUNCTION public.generate_event_slug(event_name text, language text DEFAULT 'en')
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from event name
  base_slug := TRIM(event_name);
  
  -- For Arabic text, preserve Arabic characters and only replace spaces with hyphens
  IF language = 'ar' THEN
    base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
    base_slug := TRIM(BOTH '-' FROM base_slug);
  ELSE
    -- For non-Arabic, use the original logic
    base_slug := LOWER(base_slug);
    base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9]+', '-', 'g');
    base_slug := TRIM(BOTH '-' FROM base_slug);
  END IF;
  
  -- Ensure slug is not empty
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := CASE WHEN language = 'ar' THEN 'دعوة-حدث' ELSE 'event-invitation' END;
  END IF;
  
  final_slug := base_slug;
  
  -- Handle duplicates by adding counter
  WHILE EXISTS (SELECT 1 FROM public.events WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$function$;

-- Update customized invitation slug generation function to handle Arabic text
CREATE OR REPLACE FUNCTION public.generate_customized_invitation_slug(design_name text, language text DEFAULT 'en')
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from design name
  base_slug := TRIM(design_name);
  
  -- For Arabic text, preserve Arabic characters and only replace spaces with hyphens
  IF language = 'ar' THEN
    base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
    base_slug := TRIM(BOTH '-' FROM base_slug);
  ELSE
    -- For non-Arabic, use the original logic
    base_slug := LOWER(base_slug);
    base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9]+', '-', 'g');
    base_slug := TRIM(BOTH '-' FROM base_slug);
  END IF;
  
  -- Ensure slug is not empty
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := CASE WHEN language = 'ar' THEN 'دعوة-مخصصة' ELSE 'custom-invitation' END;
  END IF;
  
  final_slug := base_slug;
  
  -- Handle duplicates by adding counter
  WHILE EXISTS (SELECT 1 FROM public.customized_invitations WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$function$;