-- Create the set_config function for database context
CREATE OR REPLACE FUNCTION public.set_config(setting text, value text, is_local boolean)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT set_config(setting, value, is_local);
$$;