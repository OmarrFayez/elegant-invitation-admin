-- Add church_name column to weddings table
ALTER TABLE public.weddings 
ADD COLUMN church_name character varying;