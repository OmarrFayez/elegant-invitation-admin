-- Add background_color column to weddings table
ALTER TABLE public.weddings 
ADD COLUMN background_color VARCHAR(7) DEFAULT '#f3f4f6';