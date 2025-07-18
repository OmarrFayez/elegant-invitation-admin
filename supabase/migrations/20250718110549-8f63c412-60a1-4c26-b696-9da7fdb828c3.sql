-- Update RLS policy for modules table to allow public access
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.modules;

CREATE POLICY "Allow public access to modules" 
ON public.modules 
FOR SELECT 
USING (true);