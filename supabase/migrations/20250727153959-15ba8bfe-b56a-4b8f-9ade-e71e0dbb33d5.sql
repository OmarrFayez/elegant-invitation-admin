-- Add attendance deadline columns to weddings and events tables
ALTER TABLE public.weddings 
ADD COLUMN attendance_deadline date;

ALTER TABLE public.events 
ADD COLUMN attendance_deadline date;