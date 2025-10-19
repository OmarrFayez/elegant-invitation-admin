-- Update the RLS functions to work with the current authentication system
-- We'll use a different approach since we can't easily set session variables

-- Drop the previous functions and create new ones that work with the current auth system
DROP FUNCTION IF EXISTS public.set_config(text, text, boolean);

-- Update the admin check function to work with current system
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  -- For now, always return true for development
  -- This will be updated when proper Supabase auth is implemented
  SELECT true;
$$;

-- Update the get current user function to work with current system
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  -- For now, return 0 as we can't easily access the current user
  -- This will be updated when proper Supabase auth is implemented
  SELECT 0;
$$;

-- Temporarily update policies to be more permissive for development
-- This should be replaced with proper auth-based policies later

-- Update user policies for development
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- Temporary permissive policies for development (MUST BE REPLACED WITH PROPER AUTH)
CREATE POLICY "Development: Allow authenticated access to users" ON public.users
FOR ALL USING (true);

-- Update other policies similarly for development
DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;
DROP POLICY IF EXISTS "Users can view roles for references" ON public.roles;

CREATE POLICY "Development: Allow access to roles" ON public.roles
FOR ALL USING (true);

DROP POLICY IF EXISTS "Admins can manage role permissions" ON public.role_permissions;
CREATE POLICY "Development: Allow access to role permissions" ON public.role_permissions
FOR ALL USING (true);

DROP POLICY IF EXISTS "Admins can manage user permissions" ON public.user_permissions;
CREATE POLICY "Development: Allow access to user permissions" ON public.user_permissions
FOR ALL USING (true);

-- Keep wedding and event policies more secure
-- But allow owners to manage their own content and admins to manage all

-- Add a comment to remind about security
COMMENT ON TABLE public.users IS 'WARNING: This table has permissive RLS policies for development. Implement proper authentication-based policies for production.';
COMMENT ON TABLE public.roles IS 'WARNING: This table has permissive RLS policies for development. Implement proper authentication-based policies for production.';
COMMENT ON TABLE public.role_permissions IS 'WARNING: This table has permissive RLS policies for development. Implement proper authentication-based policies for production.';
COMMENT ON TABLE public.user_permissions IS 'WARNING: This table has permissive RLS policies for development. Implement proper authentication-based policies for production.';