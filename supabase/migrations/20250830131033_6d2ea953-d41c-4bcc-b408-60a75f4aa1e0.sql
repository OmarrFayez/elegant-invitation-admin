-- Add omt and bank columns to weddings table
ALTER TABLE public.weddings 
ADD COLUMN omt TEXT,
ADD COLUMN bank TEXT;