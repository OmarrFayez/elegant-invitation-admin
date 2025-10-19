-- Update RLS policies to allow public access for all wedding-related tables

-- Update weddings table policies
DROP POLICY IF EXISTS "Allow public access to weddings" ON public.weddings;
CREATE POLICY "Allow public access to weddings" 
ON public.weddings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Update attendances table policies  
DROP POLICY IF EXISTS "Allow public access to attendances" ON public.attendances;
CREATE POLICY "Allow public access to attendances" 
ON public.attendances 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Update users table policies
DROP POLICY IF EXISTS "Allow public access to users" ON public.users;
CREATE POLICY "Allow public access to users" 
ON public.users 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Update roles table policies
DROP POLICY IF EXISTS "Allow public access to roles" ON public.roles;
CREATE POLICY "Allow public access to roles" 
ON public.roles 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Update role_permissions table policies
DROP POLICY IF EXISTS "Allow public access to role_permissions" ON public.role_permissions;
CREATE POLICY "Allow public access to role_permissions" 
ON public.role_permissions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Update user_permissions table policies
DROP POLICY IF EXISTS "Allow public access to user_permissions" ON public.user_permissions;
CREATE POLICY "Allow public access to user_permissions" 
ON public.user_permissions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Update storage policies for wedding-files bucket
DROP POLICY IF EXISTS "Allow public access to wedding-files" ON storage.objects;
CREATE POLICY "Allow public access to wedding-files" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'wedding-files') 
WITH CHECK (bucket_id = 'wedding-files');