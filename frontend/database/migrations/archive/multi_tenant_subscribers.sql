-- Multi-Tenant Subscription Setup & Migration

-- 1. Create Table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT NOT NULL,
    blog_id BIGINT REFERENCES public.site_settings(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT TRUE,
    verified BOOLEAN DEFAULT FALSE
);

-- 2. Add columns if table existed but was missing them (Idempotent)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subscribers' AND column_name = 'blog_id') THEN
        ALTER TABLE public.subscribers ADD COLUMN blog_id BIGINT REFERENCES public.site_settings(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subscribers' AND column_name = 'verified') THEN
        ALTER TABLE public.subscribers ADD COLUMN verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 3. Backfill existing subscribers (if any orphaned ones exist from before blog_id was required)
-- Link them to the first found blog, or user needs to handle them.
UPDATE public.subscribers
SET blog_id = (SELECT id FROM public.site_settings LIMIT 1)
WHERE blog_id IS NULL;

-- 4. Drop old global unique constraint on email if it exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscribers_email_key') THEN
        ALTER TABLE public.subscribers DROP CONSTRAINT subscribers_email_key;
    END IF;
END $$;

-- 5. Add Composite Unique Constraint (blog_id + email)
-- This allows the same email to subscribe to different blogs
-- Drop it first if it exists to be safe/idempotent
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscribers_blog_email_key') THEN
        ALTER TABLE public.subscribers DROP CONSTRAINT subscribers_blog_email_key;
    END IF;
END $$;

ALTER TABLE public.subscribers
ADD CONSTRAINT subscribers_blog_email_key UNIQUE (blog_id, email);

-- 6. Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- 7. Policies
-- Policy: Public can insert (subscribe) to any blog
DROP POLICY IF EXISTS "Public can insert subscribers" ON public.subscribers;
CREATE POLICY "Public can insert subscribers" ON public.subscribers
FOR INSERT WITH CHECK (true);

-- Policy: Blog Owners can view ONLY their own subscribers
DROP POLICY IF EXISTS "Owners view own subscribers" ON public.subscribers;
CREATE POLICY "Owners view own subscribers" ON public.subscribers
FOR SELECT USING (
    auth.uid() IN (
        SELECT user_id FROM public.site_settings WHERE id = subscribers.blog_id
    )
);

-- Policy: Owners can delete (unsubscribe) users from their blog
DROP POLICY IF EXISTS "Owners delete own subscribers" ON public.subscribers;
CREATE POLICY "Owners delete own subscribers" ON public.subscribers
FOR DELETE USING (
    auth.uid() IN (
        SELECT user_id FROM public.site_settings WHERE id = subscribers.blog_id
    )
);
