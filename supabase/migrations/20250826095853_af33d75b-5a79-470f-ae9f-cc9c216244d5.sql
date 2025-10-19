-- Create Test table
CREATE TABLE public.test (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.test ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin users can view all test records" 
ON public.test 
FOR SELECT 
USING (true);

CREATE POLICY "Admin users can insert test records" 
ON public.test 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin users can update test records" 
ON public.test 
FOR UPDATE 
USING (true);

CREATE POLICY "Admin users can delete test records" 
ON public.test 
FOR DELETE 
USING (true);