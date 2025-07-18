-- Add phone number column to attendances table
ALTER TABLE public.attendances 
ADD COLUMN phone_number VARCHAR(11);