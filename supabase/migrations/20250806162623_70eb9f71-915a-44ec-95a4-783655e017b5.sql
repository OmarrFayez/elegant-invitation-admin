-- Add meta title and description fields to weddings table
ALTER TABLE public.weddings 
ADD COLUMN meta_title TEXT,
ADD COLUMN meta_description TEXT;

-- Add meta title and description fields to events table  
ALTER TABLE public.events
ADD COLUMN meta_title TEXT,
ADD COLUMN meta_description TEXT;