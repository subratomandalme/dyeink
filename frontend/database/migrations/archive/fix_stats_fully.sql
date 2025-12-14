-- 1. Create table for Daily Stats (Required for Graph)
CREATE TABLE IF NOT EXISTS public.daily_post_stats (
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    post_id BIGINT REFERENCES public.posts(id) ON DELETE CASCADE,
    views BIGINT DEFAULT 0,
    shares BIGINT DEFAULT 0,
    PRIMARY KEY (date, post_id)
);

-- 2. Open permissions for the stats table (Reading)
ALTER TABLE public.daily_post_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read stats" ON public.daily_post_stats;
CREATE POLICY "Public read stats" ON public.daily_post_stats FOR SELECT USING (true);
GRANT ALL ON public.daily_post_stats TO postgres, service_role;
GRANT SELECT ON public.daily_post_stats TO anon, authenticated;

-- 3. Ensure Posts columns exist
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS shares BIGINT DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS views BIGINT DEFAULT 0;

-- 4. Rewrite Increment Views RPC (Security Definer = Bypasses Permissions)
-- Updates BOTH total counts and daily graph data
create or replace function public.increment_post_view(post_id bigint)
returns void as $$
begin
  -- Total
  update public.posts
  set views = coalesce(views, 0) + 1
  where id = increment_post_view.post_id;

  -- Daily Graph
  insert into public.daily_post_stats (date, post_id, views)
  values (CURRENT_DATE, increment_post_view.post_id, 1)
  on conflict (date, post_id)
  do update set views = daily_post_stats.views + 1;
end;
$$ language plpgsql security definer;

-- 5. Rewrite Increment Shares RPC
create or replace function public.increment_shares(post_id bigint)
returns void as $$
begin
  -- Total
  update public.posts
  set shares = coalesce(shares, 0) + 1
  where id = increment_shares.post_id;

  -- Daily Graph
  insert into public.daily_post_stats (date, post_id, shares)
  values (CURRENT_DATE, increment_shares.post_id, 1)
  on conflict (date, post_id)
  do update set shares = daily_post_stats.shares + 1;
end;
$$ language plpgsql security definer;

-- 6. Rewrite Dashboard Fetch Function to use new Daily Table for Graph
create or replace function public.get_dashboard_stats(user_id uuid)
returns json as $$
declare
  total_views bigint;
  total_shares bigint;
  total_subscribers bigint;
  graph_data json;
begin
  -- Totals from Posts Table (Fastest)
  select coalesce(sum(views), 0) into total_views from public.posts where user_id = get_dashboard_stats.user_id;
  select coalesce(sum(shares), 0) into total_shares from public.posts where user_id = get_dashboard_stats.user_id;

  -- Total Subscribers
  select count(*) into total_subscribers
  from public.subscribers s
  join public.site_settings ss on s.blog_id = ss.id
  where ss.user_id = get_dashboard_stats.user_id;

  -- Graph Data from Daily Stats Table
  with recursive dates as (
      select (now() at time zone 'utc')::date - 6 as day
      union all
      select day + 1 from dates where day < (now() at time zone 'utc')::date
  ),
  daily_agg as (
      select 
        d.date as day,
        sum(d.views) as views_count,
        sum(d.shares) as shares_count
      from public.daily_post_stats d
      join public.posts p on d.post_id = p.id
      where p.user_id = get_dashboard_stats.user_id
        and d.date >= (CURRENT_DATE - 6)
      group by 1
  )
  select json_agg(
    json_build_object(
      'date', to_char(dt.day, 'YYYY-MM-DD'),
      'name', to_char(dt.day, 'Mon DD'),
      'views', coalesce(da.views_count, 0),
      'shares', coalesce(da.shares_count, 0)
    ) order by dt.day
  ) into graph_data
  from dates dt
  left join daily_agg da on dt.day = da.day;

  return json_build_object(
    'totalViews', total_views,
    'totalShares', total_shares,
    'totalSubscribers', total_subscribers,
    'graphData', coalesce(graph_data, '[]'::json)
  );
end;
$$ language plpgsql security definer;

-- 7. Grant Permissions to allow Anon users to call increment functions
grant execute on function public.increment_shares(bigint) to anon, authenticated, service_role;
grant execute on function public.increment_post_view(bigint) to anon, authenticated, service_role;
grant execute on function public.get_dashboard_stats(uuid) to anon, authenticated, service_role;
