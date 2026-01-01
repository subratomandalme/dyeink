CREATE OR REPLACE FUNCTION increment_daily_views(p_post_id BIGINT, p_date DATE)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.daily_post_stats (post_id, date, views, shares)
  VALUES (p_post_id, p_date, 1, 0)
  ON CONFLICT (post_id, date)
  DO UPDATE SET views = public.daily_post_stats.views + 1;
END;
$$ LANGUAGE plpgsql;
GRANT EXECUTE ON FUNCTION increment_daily_views TO anon, authenticated, service_role;
