-- Create events table for general event invitations
CREATE TABLE public.events (
  id SERIAL PRIMARY KEY,
  event_name VARCHAR NOT NULL,
  event_date DATE,
  phone_number VARCHAR,
  email VARCHAR,
  description1 TEXT,
  description2 TEXT,
  max_attendance INTEGER,
  wish_account TEXT,
  location_text TEXT,
  location_url TEXT,
  background_image VARCHAR,
  background_music VARCHAR,
  background_color VARCHAR DEFAULT '#f3f4f6',
  slug VARCHAR,
  user_id INTEGER,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (similar to weddings table)
CREATE POLICY "Allow public access to events" 
ON public.events 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to generate event slug
CREATE OR REPLACE FUNCTION public.generate_event_slug(event_name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from event name
  base_slug := LOWER(TRIM(event_name));
  
  -- Replace spaces and special characters with hyphens
  base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9]+', '-', 'g');
  -- Remove leading/trailing hyphens
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- Ensure slug is not empty
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'event-invitation';
  END IF;
  
  final_slug := base_slug;
  
  -- Handle duplicates by adding counter
  WHILE EXISTS (SELECT 1 FROM events WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$function$

-- Create event attendances table
CREATE TABLE public.event_attendances (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  guest_name VARCHAR,
  phone_number VARCHAR,
  status VARCHAR DEFAULT 'Attending',
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for event attendances
ALTER TABLE public.event_attendances ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to event attendances
CREATE POLICY "Allow public access to event attendances" 
ON public.event_attendances 
FOR ALL 
USING (true)
WITH CHECK (true);