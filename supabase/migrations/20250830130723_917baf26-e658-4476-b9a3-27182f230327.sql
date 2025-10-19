-- Add church_time and church_location columns to weddings table
ALTER TABLE public.weddings 
ADD COLUMN church_time TIME,
ADD COLUMN church_location TEXT;