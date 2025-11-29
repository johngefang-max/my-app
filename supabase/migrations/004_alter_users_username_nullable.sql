-- Alter users.username to be nullable and non-unique
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;
-- keep existing index for performance (non-unique)
