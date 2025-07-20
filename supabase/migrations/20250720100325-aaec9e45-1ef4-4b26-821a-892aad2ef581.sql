-- Create events table for general event invitations
CREATE TABLE public.events (
  id SERIAL PRIMARY KEY,
  event_name VARCHAR NOT NULL,
  event_date DATE,
  phone_number VARCHAR,
  email VARCHAR,
  description1 TEXT,
  description2 TEXT,
  max_attendance INTEGER,
  wish_account TEXT,
  location_text TEXT,
  location_url TEXT,
  background_image VARCHAR,
  background_music VARCHAR,
  background_color VARCHAR DEFAULT '#f3f4f6',
  slug VARCHAR,
  user_id INTEGER,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (similar to weddings table)
CREATE POLICY "Allow public access to events" 
ON public.events 
FOR ALL 
USING (true)
WITH CHECK (true);