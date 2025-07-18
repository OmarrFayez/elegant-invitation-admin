-- Add user_id column to weddings table to link invitations to users
ALTER TABLE public.weddings 
ADD COLUMN user_id INTEGER REFERENCES public.users(user_id);

-- Add index for better performance
CREATE INDEX idx_weddings_user_id ON public.weddings(user_id);

-- Insert some modules if they don't exist for role permissions
INSERT INTO public.modules (module_name) VALUES 
('Dashboard'),
('Invitations'),
('Users'),
('Roles'),
('Attendances')
ON CONFLICT (module_name) DO NOTHING;