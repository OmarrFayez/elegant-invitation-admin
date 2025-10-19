-- Seed module for Roles & Permissions if not exists
INSERT INTO public.modules (module_name)
SELECT 'Roles & Permissions'
WHERE NOT EXISTS (
  SELECT 1 FROM public.modules WHERE module_name = 'Roles & Permissions'
);