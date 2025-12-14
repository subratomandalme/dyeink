-- Debug: Check if counters are being recorded
-- 1. Check Totals in Posts table
SELECT id, title, views, shares FROM public.posts ORDER BY views DESC LIMIT 5;

-- 2. Check Daily Stats Table (Graph Source)
-- If this fails, table doesn't exist -> Run fix_stats_fully.sql
SELECT * FROM public.daily_post_stats ORDER BY date DESC LIMIT 5;

-- 3. Check Subscribers Count
SELECT count(*) as total_subscribers FROM public.subscribers;

-- 4. Check Settings (Debug RLS)
SELECT user_id, subdomain, domain_status FROM public.site_settings LIMIT 5;
