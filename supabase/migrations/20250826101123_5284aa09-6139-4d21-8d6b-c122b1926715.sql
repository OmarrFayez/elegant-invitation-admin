-- Create test table with ID (auto increment) and Name (text)
CREATE TABLE public.test (
  id SERIAL PRIMARY KEY,
  name TEXT
);

-- Enable Row Level Security
ALTER TABLE public.test ENABLE ROW LEVEL SECURITY;

-- Allow public access for development
CREATE POLICY "Allow public access to test table" 
ON public.test 
FOR ALL 
USING (true) 
WITH CHECK (true);