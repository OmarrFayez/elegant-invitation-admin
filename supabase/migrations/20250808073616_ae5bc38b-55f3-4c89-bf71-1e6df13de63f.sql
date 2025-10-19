-- Ensure roles sequence exists and is attached correctly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'S' AND c.relname = 'roles_role_id_seq' AND n.nspname = 'public'
  ) THEN
    CREATE SEQUENCE public.roles_role_id_seq;
    ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;
    ALTER TABLE public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq');
  END IF;
END $$;

-- Realign the sequence with current max(role_id)
SELECT setval('public.roles_role_id_seq', COALESCE((SELECT MAX(role_id) FROM public.roles), 0), true);
