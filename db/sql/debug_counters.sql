SELECT id, title, views, shares FROM public.posts ORDER BY views DESC LIMIT 5;
SELECT * FROM public.daily_post_stats ORDER BY date DESC LIMIT 5;
SELECT count(*) as total_subscribers FROM public.subscribers;
SELECT user_id, subdomain, domain_status FROM public.site_settings LIMIT 5;
