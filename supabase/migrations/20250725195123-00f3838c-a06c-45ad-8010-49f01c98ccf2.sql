-- CRITICAL SECURITY FIXES - Phase 1: Database Security

-- First, fix database functions to have proper search_path
CREATE OR REPLACE FUNCTION public.generate_event_slug(event_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
  WHILE EXISTS (SELECT 1 FROM public.events WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_wedding_slug(groom_name text, bride_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
  WHILE EXISTS (SELECT 1 FROM public.weddings WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_customized_invitation_slug(design_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
  WHILE EXISTS (SELECT 1 FROM public.customized_invitations WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$function$;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.role_id
    WHERE u.user_id = current_setting('app.current_user_id', true)::int
    AND LOWER(r.role_name) = 'admin'
  );
$$;

-- Create function to get current user id from custom auth
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(current_setting('app.current_user_id', true)::int, 0);
$$;

-- Drop all existing overly permissive policies
DROP POLICY IF EXISTS "Allow public access to users" ON public.users;
DROP POLICY IF EXISTS "Allow public access to roles" ON public.roles;
DROP POLICY IF EXISTS "Allow public access to role_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Allow public access to user_permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Allow public access to weddings" ON public.weddings;
DROP POLICY IF EXISTS "Allow public access to events" ON public.events;
DROP POLICY IF EXISTS "Allow public access to attendances" ON public.attendances;
DROP POLICY IF EXISTS "Allow public access to event_attendances" ON public.event_attendances;
DROP POLICY IF EXISTS "Allow public access to customized_invitations" ON public.customized_invitations;
DROP POLICY IF EXISTS "Allow admin full access to customized invitations" ON public.customized_invitations;
DROP POLICY IF EXISTS "Allow public view of published customized invitations" ON public.customized_invitations;
DROP POLICY IF EXISTS "Allow public access to modules" ON public.modules;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.roles;

-- Create secure RLS policies for users table
CREATE POLICY "Users can view own profile" ON public.users
FOR SELECT USING (user_id = public.get_current_user_id());

CREATE POLICY "Admins can view all users" ON public.users
FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert users" ON public.users
FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update users" ON public.users
FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete users" ON public.users
FOR DELETE USING (public.is_admin());

-- Create secure RLS policies for roles table
CREATE POLICY "Admins can manage roles" ON public.roles
FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view roles for references" ON public.roles
FOR SELECT USING (true);

-- Create secure RLS policies for role_permissions table
CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
FOR ALL USING (public.is_admin());

-- Create secure RLS policies for user_permissions table
CREATE POLICY "Admins can manage user permissions" ON public.user_permissions
FOR ALL USING (public.is_admin());

-- Create secure RLS policies for weddings table
CREATE POLICY "Users can view own weddings" ON public.weddings
FOR SELECT USING (user_id = public.get_current_user_id());

CREATE POLICY "Users can create own weddings" ON public.weddings
FOR INSERT WITH CHECK (user_id = public.get_current_user_id());

CREATE POLICY "Users can update own weddings" ON public.weddings
FOR UPDATE USING (user_id = public.get_current_user_id());

CREATE POLICY "Users can delete own weddings" ON public.weddings
FOR DELETE USING (user_id = public.get_current_user_id());

CREATE POLICY "Admins can manage all weddings" ON public.weddings
FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view published weddings by slug" ON public.weddings
FOR SELECT USING (slug IS NOT NULL);

-- Create secure RLS policies for events table
CREATE POLICY "Users can view own events" ON public.events
FOR SELECT USING (user_id = public.get_current_user_id());

CREATE POLICY "Users can create own events" ON public.events
FOR INSERT WITH CHECK (user_id = public.get_current_user_id());

CREATE POLICY "Users can update own events" ON public.events
FOR UPDATE USING (user_id = public.get_current_user_id());

CREATE POLICY "Users can delete own events" ON public.events
FOR DELETE USING (user_id = public.get_current_user_id());

CREATE POLICY "Admins can manage all events" ON public.events
FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view published events by slug" ON public.events
FOR SELECT USING (slug IS NOT NULL);

-- Create secure RLS policies for attendances table
CREATE POLICY "Anyone can submit attendance" ON public.attendances
FOR INSERT WITH CHECK (true);

CREATE POLICY "Event owners can view attendances" ON public.attendances
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.weddings w 
    WHERE w.id = wedding_id 
    AND w.user_id = public.get_current_user_id()
  )
);

CREATE POLICY "Admins can manage all attendances" ON public.attendances
FOR ALL USING (public.is_admin());

-- Create secure RLS policies for event_attendances table
CREATE POLICY "Anyone can submit event attendance" ON public.event_attendances
FOR INSERT WITH CHECK (true);

CREATE POLICY "Event owners can view event attendances" ON public.event_attendances
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_id 
    AND e.user_id = public.get_current_user_id()
  )
);

CREATE POLICY "Admins can manage all event attendances" ON public.event_attendances
FOR ALL USING (public.is_admin());

-- Create secure RLS policies for customized_invitations table
CREATE POLICY "Users can view own invitations" ON public.customized_invitations
FOR SELECT USING (user_id = public.get_current_user_id());

CREATE POLICY "Users can create own invitations" ON public.customized_invitations
FOR INSERT WITH CHECK (user_id = public.get_current_user_id());

CREATE POLICY "Users can update own invitations" ON public.customized_invitations
FOR UPDATE USING (user_id = public.get_current_user_id());

CREATE POLICY "Users can delete own invitations" ON public.customized_invitations
FOR DELETE USING (user_id = public.get_current_user_id());

CREATE POLICY "Admins can manage all invitations" ON public.customized_invitations
FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view published invitations" ON public.customized_invitations
FOR SELECT USING (is_published = true);

-- Create secure RLS policies for modules table (read-only reference data)
CREATE POLICY "Anyone can view modules" ON public.modules
FOR SELECT USING (true);