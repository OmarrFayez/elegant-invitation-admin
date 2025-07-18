-- Create customized_invitations table
CREATE TABLE public.customized_invitations (
  id SERIAL PRIMARY KEY,
  design_name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE,
  canvas_size JSONB NOT NULL DEFAULT '{"width": 400, "height": 600}',
  elements JSONB NOT NULL DEFAULT '[]',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Enable RLS
ALTER TABLE public.customized_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to published invitations
CREATE POLICY "Allow public view of published customized invitations" 
ON public.customized_invitations 
FOR SELECT 
USING (is_published = true);

-- Create policies for admin access
CREATE POLICY "Allow admin full access to customized invitations" 
ON public.customized_invitations 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to generate slug for customized invitations
CREATE OR REPLACE FUNCTION public.generate_customized_invitation_slug(design_name text)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from design name
  base_slug := LOWER(TRIM(design_name));
  
  -- Replace spaces and special characters with hyphens
  base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9]+', '-', 'g');
  -- Remove leading/trailing hyphens
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- Ensure slug is not empty
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'custom-invitation';
  END IF;
  
  final_slug := base_slug;
  
  -- Handle duplicates by adding counter
  WHILE EXISTS (SELECT 1 FROM customized_invitations WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$function$

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customized_invitations_updated_at
BEFORE UPDATE ON public.customized_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();