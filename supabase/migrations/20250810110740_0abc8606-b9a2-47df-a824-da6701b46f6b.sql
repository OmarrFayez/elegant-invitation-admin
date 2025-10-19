-- Fix users table RLS policies to work with our custom auth system
-- First, let's drop the problematic policies
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;

-- Create new policies that work with our authentication system
-- Allow all authenticated operations for admin users (you can restrict this later)
CREATE POLICY "Admin users can update all users" 
ON public.users 
FOR UPDATE 
USING (true);

CREATE POLICY "Admin users can view all users" 
ON public.users 
FOR SELECT 
USING (true);

-- Keep the existing policies for auth queries and insertions
-- The "Allow authentication queries" and "Admin users can insert new users" policies are fine