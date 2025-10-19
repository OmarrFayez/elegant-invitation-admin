-- Create event attendances table
CREATE TABLE public.event_attendances (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  guest_name VARCHAR,
  phone_number VARCHAR,
  status VARCHAR DEFAULT 'Attending',
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for event attendances
ALTER TABLE public.event_attendances ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to event attendances
CREATE POLICY "Allow public access to event attendances" 
ON public.event_attendances 
FOR ALL 
USING (true)
WITH CHECK (true);