-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Posts Policies
DROP POLICY IF EXISTS "allow update" ON posts;
CREATE POLICY "allow update"
ON posts
FOR UPDATE
USING (true)
WITH CHECK (true); -- Added WITH CHECK to ensure the update is allowed

DROP POLICY IF EXISTS "allow select" ON posts;
CREATE POLICY "allow select"
ON posts
FOR SELECT
USING (true);

-- Subscribers Policies
DROP POLICY IF EXISTS "allow insert" ON subscribers;
CREATE POLICY "allow insert"
ON subscribers
FOR INSERT
WITH CHECK (true);

-- Ensure columns exist (Idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'views') THEN
        ALTER TABLE posts ADD COLUMN views INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'likes') THEN
        ALTER TABLE posts ADD COLUMN likes INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create subscribers table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);
