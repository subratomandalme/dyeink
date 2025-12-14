-- Comprehensive Fix for Public Access (Anon Role)
-- Run this in Supabase SQL Editor

-- 1. POSTS: Allow public read access (Published only)
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;
CREATE POLICY "Public posts are viewable by everyone" 
ON public.posts FOR SELECT 
USING (published = true);

-- Alert Supabase to allow Anon select on posts
GRANT SELECT ON TABLE public.posts TO anon;


-- 2. SETTINGS: Allow public read access (Site Title, Social Links)
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON public.site_settings;
CREATE POLICY "Settings are viewable by everyone" 
ON public.site_settings FOR SELECT 
USING (true);

-- Alert Supabase to allow Anon select on site_settings
GRANT SELECT ON TABLE public.site_settings TO anon;


-- 3. UPVOTES: Allow public interactions (as defined previously)
-- Re-grant just in case
GRANT ALL ON TABLE public.post_upvotes TO anon;
GRANT EXECUTE ON FUNCTION toggle_vote TO anon;

-- 4. SUBSCRIBERS: Allow public subscription
DROP POLICY IF EXISTS "Public can describe" ON public.subscribers;
CREATE POLICY "Public can subscribe"
ON public.subscribers FOR INSERT
WITH CHECK (true);

GRANT INSERT ON TABLE public.subscribers TO anon;
