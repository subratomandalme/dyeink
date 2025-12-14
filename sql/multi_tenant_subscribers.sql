CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT NOT NULL,
    blog_id BIGINT REFERENCES public.site_settings(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT TRUE,
    verified BOOLEAN DEFAULT FALSE
);
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subscribers' AND column_name = 'blog_id') THEN
        ALTER TABLE public.subscribers ADD COLUMN blog_id BIGINT REFERENCES public.site_settings(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subscribers' AND column_name = 'verified') THEN
        ALTER TABLE public.subscribers ADD COLUMN verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
UPDATE public.subscribers
SET blog_id = (SELECT id FROM public.site_settings LIMIT 1)
WHERE blog_id IS NULL;
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscribers_email_key') THEN
        ALTER TABLE public.subscribers DROP CONSTRAINT subscribers_email_key;
    END IF;
END $$;
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscribers_blog_email_key') THEN
        ALTER TABLE public.subscribers DROP CONSTRAINT subscribers_blog_email_key;
    END IF;
END $$;
ALTER TABLE public.subscribers
ADD CONSTRAINT subscribers_blog_email_key UNIQUE (blog_id, email);
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can insert subscribers" ON public.subscribers;
CREATE POLICY "Public can insert subscribers" ON public.subscribers
FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Owners view own subscribers" ON public.subscribers;
CREATE POLICY "Owners view own subscribers" ON public.subscribers
FOR SELECT USING (
    auth.uid() IN (
        SELECT user_id FROM public.site_settings WHERE id = subscribers.blog_id
    )
);
DROP POLICY IF EXISTS "Owners delete own subscribers" ON public.subscribers;
CREATE POLICY "Owners delete own subscribers" ON public.subscribers
FOR DELETE USING (
    auth.uid() IN (
        SELECT user_id FROM public.site_settings WHERE id = subscribers.blog_id
    )
);
