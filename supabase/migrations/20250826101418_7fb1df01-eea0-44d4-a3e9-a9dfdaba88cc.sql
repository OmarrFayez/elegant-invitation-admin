-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to run the auto-insert function every 5 days
-- This will run at midnight every 5 days starting from today
SELECT cron.schedule(
  'auto-insert-test-every-5-days',
  '0 0 */5 * *', -- At midnight every 5 days
  $$
  SELECT
    net.http_post(
        url:='https://rooaohciqkauwzmftwjp.supabase.co/functions/v1/auto-insert-test',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvb2FvaGNpcWthdXd6bWZ0d2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzEwNDYsImV4cCI6MjA2NzkwNzA0Nn0.4PT13Zxfq20erLpT0jazCDKFtS4iMCedfQvILHOCNZI"}'::jsonb,
        body:='{"timestamp": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);