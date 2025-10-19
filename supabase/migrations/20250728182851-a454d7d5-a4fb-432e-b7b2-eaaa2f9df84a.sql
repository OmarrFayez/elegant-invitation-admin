-- Add mobile background image column to weddings table
ALTER TABLE public.weddings 
ADD COLUMN mobile_background_image character varying;

-- Add mobile background image column to events table  
ALTER TABLE public.events 
ADD COLUMN mobile_background_image character varying;