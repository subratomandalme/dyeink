CREATE OR REPLACE FUNCTION increment_post_stats(post_id_input UUID, views_increment INT, likes_increment INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.posts
  SET 
    views = COALESCE(views, 0) + views_increment,
    likes = COALESCE(likes, 0) + likes_increment
  WHERE id = post_id_input;
  IF views_increment > 0 THEN
    INSERT INTO public.telemetry_daily (post_id, event, count, day)
    VALUES (post_id_input, 'view', views_increment, CURRENT_DATE)
    ON CONFLICT (post_id, event, day)
    DO UPDATE SET count = telemetry_daily.count + EXCLUDED.count;
  END IF;
  IF likes_increment > 0 THEN
    INSERT INTO public.telemetry_daily (post_id, event, count, day)
    VALUES (post_id_input, 'like', likes_increment, CURRENT_DATE)
    ON CONFLICT (post_id, event, day)
    DO UPDATE SET count = telemetry_daily.count + EXCLUDED.count;
  END IF;
END;
$$;
