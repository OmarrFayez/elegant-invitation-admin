-- Create Roles table
CREATE TABLE public.roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Modules table
CREATE TABLE public.modules (
  module_id SERIAL PRIMARY KEY,
  module_name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RolePermissions table
CREATE TABLE public.role_permissions (
  role_id INTEGER REFERENCES public.roles(role_id) ON DELETE CASCADE,
  module_id INTEGER REFERENCES public.modules(module_id) ON DELETE CASCADE,
  can_view BOOLEAN DEFAULT FALSE,
  can_add BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (role_id, module_id)
);

-- Create Users table
CREATE TABLE public.users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(50),
  role_id INTEGER REFERENCES public.roles(role_id),
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create UserPermissions table
CREATE TABLE public.user_permissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL REFERENCES public.modules(module_id) ON DELETE CASCADE,
  can_view BOOLEAN DEFAULT FALSE,
  can_add BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  UNIQUE (user_id, module_id)
);

-- Create Weddings table
CREATE TABLE public.weddings (
  id SERIAL PRIMARY KEY,
  wedding_name VARCHAR(255) NOT NULL,
  groom_name VARCHAR(100),
  bride_name VARCHAR(100),
  description1 TEXT,
  description2 TEXT,
  phone_number VARCHAR(20),
  email VARCHAR(100),
  wedding_date DATE,
  max_attendance INTEGER,
  whish_account TEXT,
  location_text TEXT,
  location_url TEXT,
  background_image VARCHAR(255),
  background_music VARCHAR(255),
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Attendances table
CREATE TABLE public.attendances (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  guest_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'Attending' CHECK (status IN ('Attending', 'Not Attending')),
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert predefined modules
INSERT INTO public.modules (module_name) VALUES 
('Dashboard'),
('Invitation Cards'),
('Users'),
('Roles');

-- Insert initial Admin role
INSERT INTO public.roles (role_name) VALUES ('Admin');

-- Grant full permissions to Admin role for all modules
INSERT INTO public.role_permissions (role_id, module_id, can_view, can_add, can_edit, can_delete)
SELECT 1, module_id, true, true, true, true
FROM public.modules;

-- Create storage bucket for wedding files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('wedding-files', 'wedding-files', true);

-- Enable RLS on all tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (will implement proper permission-based policies later)
CREATE POLICY "Enable read access for authenticated users" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.roles FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.modules FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users" ON public.role_permissions FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users" ON public.users FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users" ON public.user_permissions FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users" ON public.weddings FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users" ON public.attendances FOR ALL TO authenticated USING (true);

-- Create storage policies for wedding files
CREATE POLICY "Allow authenticated users to upload wedding files" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'wedding-files');

CREATE POLICY "Allow authenticated users to view wedding files" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'wedding-files');

CREATE POLICY "Allow authenticated users to update wedding files" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'wedding-files');

CREATE POLICY "Allow authenticated users to delete wedding files" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'wedding-files');