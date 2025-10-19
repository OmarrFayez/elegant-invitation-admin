-- Add foreign key constraint with CASCADE DELETE to attendances table
-- First, let's check if the foreign key already exists and drop it if it does
ALTER TABLE attendances DROP CONSTRAINT IF EXISTS attendances_wedding_id_fkey;

-- Add the foreign key constraint with CASCADE DELETE
ALTER TABLE attendances 
ADD CONSTRAINT attendances_wedding_id_fkey 
FOREIGN KEY (wedding_id) 
REFERENCES weddings(id) 
ON DELETE CASCADE;

-- Do the same for event_attendances if needed
ALTER TABLE event_attendances DROP CONSTRAINT IF EXISTS event_attendances_event_id_fkey;

ALTER TABLE event_attendances 
ADD CONSTRAINT event_attendances_event_id_fkey 
FOREIGN KEY (event_id) 
REFERENCES events(id) 
ON DELETE CASCADE;