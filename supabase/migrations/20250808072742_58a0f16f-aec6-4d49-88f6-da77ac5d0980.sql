-- Seed module for Events Invitation permissions if it doesn't exist
INSERT INTO public.modules (module_name)
SELECT 'Events Invitation'
WHERE NOT EXISTS (
  SELECT 1 FROM public.modules WHERE module_name = 'Events Invitation'
);

-- Adjust foreign key on events.user_id to allow deleting users without cascading event deletions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_name = 'events_user_id_fkey'
      AND tc.table_name = 'events'
      AND tc.table_schema = 'public'
      AND tc.constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE public.events DROP CONSTRAINT events_user_id_fkey;
  END IF;
END $$;

ALTER TABLE public.events
ADD CONSTRAINT events_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(user_id)
ON DELETE SET NULL;