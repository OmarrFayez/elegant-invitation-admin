-- Update existing plain text passwords to hashed passwords
-- This migration will hash all existing passwords using bcrypt

-- First, let's create a function to hash passwords using pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a temporary function to hash existing passwords
CREATE OR REPLACE FUNCTION hash_existing_passwords()
RETURNS void AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Loop through all users with passwords that look like plain text (not starting with $2)
    FOR user_record IN 
        SELECT user_id, password 
        FROM users 
        WHERE password IS NOT NULL 
        AND password != '' 
        AND NOT password LIKE '$2%'
    LOOP
        -- Hash the password using crypt with bcrypt
        UPDATE users 
        SET password = crypt(user_record.password, gen_salt('bf', 10))
        WHERE user_id = user_record.user_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to hash existing passwords
SELECT hash_existing_passwords();

-- Drop the temporary function
DROP FUNCTION hash_existing_passwords();