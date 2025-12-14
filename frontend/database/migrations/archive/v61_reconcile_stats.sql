-- v61: RECONCILE STATS (Fix "Graph too low" issue)
-- This script backfills missing graph data by attributing "Legacy Views" 
-- to the day the post was created.

-- Function to calculate and fix discrepancies
DO $$
DECLARE
    r RECORD;
    daily_sum BIGINT;
    diff BIGINT;
    post_date DATE;
BEGIN
    FOR r IN SELECT id, views, created_at FROM public.posts LOOP
        -- 1. Calculate how many views are already in the graph
        SELECT COALESCE(SUM(views), 0) INTO daily_sum 
        FROM public.daily_post_stats 
        WHERE post_id = r.id;

        -- 2. Calculate missing views (Total - Graph)
        diff := r.views - daily_sum;

        -- 3. If there are missing views, add them to the Creation Date
        IF diff > 0 THEN
            -- Use Today if created_at is null, otherwise use creation date
            post_date := COALESCE(DATE(r.created_at), CURRENT_DATE);
            
            -- Insert or Update the record for that day
            -- We assume the schema allows upserts or we handle conflict
            INSERT INTO public.daily_post_stats (post_id, date, views, shares)
            VALUES (r.id, post_date, diff, 0)
            ON CONFLICT (post_id, date) 
            DO UPDATE SET views = daily_post_stats.views + EXCLUDED.views;
            
            RAISE NOTICE 'Fixed Post %: Added % views to %', r.id, diff, post_date;
        END IF;
    END LOOP;
END $$;
