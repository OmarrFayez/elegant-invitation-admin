-- Update the get_current_user_id function to return 1 for development
-- This allows the admin to create/update events since user_id = 1 exists
CREATE OR REPLACE FUNCTION public.get_current_user_id()
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  -- For development, return user_id 1 so operations work
  -- This will be updated when proper Supabase auth is implemented
  SELECT 1;
$function$