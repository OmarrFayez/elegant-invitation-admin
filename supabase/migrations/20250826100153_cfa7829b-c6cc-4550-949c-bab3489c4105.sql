-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to run the auto-insert function every 5 days
-- This will run at midnight every 5 days starting from today
SELECT cron.schedule(
  'auto-insert-test-every-5-days',
  '0 0 */5 * *', -- At 00:00 (midnight) every 5 days
  $$
  SELECT
  net.http_post(
    url:='https://rooaohciqkauwzmftwjp.supabase.co/functions/v1/auto-insert-test',
    headers:='{"Content-Type": "application/json"}'::jsonb,
    body:=concat('{"time": "', now(), '"}')::jsonb
  ) as request_id;
  $$
);