DO $$
DECLARE
    r RECORD;
    daily_sum BIGINT;
    diff BIGINT;
    post_date DATE;
BEGIN
    FOR r IN SELECT id, views, created_at FROM public.posts LOOP
        SELECT COALESCE(SUM(views), 0) INTO daily_sum 
        FROM public.daily_post_stats 
        WHERE post_id = r.id;
        diff := r.views - daily_sum;
        IF diff > 0 THEN
            post_date := COALESCE(DATE(r.created_at), CURRENT_DATE);
            INSERT INTO public.daily_post_stats (post_id, date, views, shares)
            VALUES (r.id, post_date, diff, 0)
            ON CONFLICT (post_id, date) 
            DO UPDATE SET views = daily_post_stats.views + EXCLUDED.views;
            RAISE NOTICE 'Fixed Post %: Added % views to %', r.id, diff, post_date;
        END IF;
    END LOOP;
END $$;
