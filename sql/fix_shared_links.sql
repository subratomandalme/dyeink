ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public settings view" ON public.site_settings;
CREATE POLICY "Public settings view" 
ON public.site_settings FOR SELECT 
USING (true);
DROP POLICY IF EXISTS "Public published posts view" ON public.posts;
CREATE POLICY "Public published posts view" 
ON public.posts FOR SELECT 
USING (published = true);
DROP POLICY IF EXISTS "Users manage own posts" ON public.posts;
CREATE POLICY "Users manage own posts" 
ON public.posts FOR ALL 
USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own settings" ON public.site_settings;
CREATE POLICY "Users manage own settings" 
ON public.site_settings FOR ALL 
USING (auth.uid() = user_id);
GRANT SELECT ON TABLE public.site_settings TO anon;
GRANT SELECT ON TABLE public.posts TO anon;
