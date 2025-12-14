DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;
CREATE POLICY "Public posts are viewable by everyone" 
ON public.posts FOR SELECT 
USING (published = true);
GRANT SELECT ON TABLE public.posts TO anon;
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON public.site_settings;
CREATE POLICY "Settings are viewable by everyone" 
ON public.site_settings FOR SELECT 
USING (true);
GRANT SELECT ON TABLE public.site_settings TO anon;
GRANT ALL ON TABLE public.post_upvotes TO anon;
GRANT EXECUTE ON FUNCTION toggle_vote TO anon;
DROP POLICY IF EXISTS "Public can describe" ON public.subscribers;
CREATE POLICY "Public can subscribe"
ON public.subscribers FOR INSERT
WITH CHECK (true);
GRANT INSERT ON TABLE public.subscribers TO anon;
