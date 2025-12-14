-- CRITICAL FIX FOR PUBLIC BLOG ACCESS
-- Access this in your Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run

-- 1. Enable RLS on core tables (Security Best Practice)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 2. SITE SETTINGS: Allow ANYONE (including public/anon) to view site settings
-- This fixes "User Not Found" when visiting /{subdomain}
DROP POLICY IF EXISTS "Public settings view" ON public.site_settings;
CREATE POLICY "Public settings view" 
ON public.site_settings FOR SELECT 
USING (true);

-- 3. POSTS: Allow ANYONE to view PUBLISHED posts
-- This fixes "No posts published yet" for visitors
DROP POLICY IF EXISTS "Public published posts view" ON public.posts;
CREATE POLICY "Public published posts view" 
ON public.posts FOR SELECT 
USING (published = true);

-- 4. POSTS: Users can manage their OWN posts
DROP POLICY IF EXISTS "Users manage own posts" ON public.posts;
CREATE POLICY "Users manage own posts" 
ON public.posts FOR ALL 
USING (auth.uid() = user_id);

-- 5. SETTINGS: Users can manage their OWN settings
DROP POLICY IF EXISTS "Users manage own settings" ON public.site_settings;
CREATE POLICY "Users manage own settings" 
ON public.site_settings FOR ALL 
USING (auth.uid() = user_id);

-- 6. Grant Permissions to Anonymous Users (Public Visitors)
GRANT SELECT ON TABLE public.site_settings TO anon;
GRANT SELECT ON TABLE public.posts TO anon;

-- Verification:
-- After running this, visiting /{subdomain} should successfully load the user's name and posts.
