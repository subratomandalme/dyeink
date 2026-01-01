ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS shares BIGINT DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS views BIGINT DEFAULT 0;
create or replace function public.increment_shares(post_id bigint)
returns void as $$
begin
  update public.posts
  set shares = coalesce(shares, 0) + 1
  where id = increment_shares.post_id;
end;
$$ language plpgsql security definer;
create or replace function public.increment_post_view(post_id bigint)
returns void as $$
begin
  update public.posts
  set views = coalesce(views, 0) + 1
  where id = increment_post_view.post_id;
end;
$$ language plpgsql security definer;
grant execute on function public.increment_shares(bigint) to anon, authenticated, service_role;
grant execute on function public.increment_post_view(bigint) to anon, authenticated, service_role;
grant execute on function public.get_dashboard_stats(uuid) to anon, authenticated, service_role;
create or replace function public.get_dashboard_stats(user_id uuid)
returns json as $$
declare
  total_views bigint;
  total_shares bigint;
  total_subscribers bigint;
  graph_data json;
begin
  select coalesce(sum(views), 0) into total_views
  from public.posts
  where user_id = get_dashboard_stats.user_id;
  select coalesce(sum(shares), 0) into total_shares
  from public.posts
  where user_id = get_dashboard_stats.user_id;
  select count(*) into total_subscribers
  from public.subscribers s
  join public.site_settings ss on s.blog_id = ss.id
  where ss.user_id = get_dashboard_stats.user_id;
  with recursive dates as (
      select (now() at time zone 'utc')::date - 6 as day
      union all
      select day + 1 from dates where day < (now() at time zone 'utc')::date
  ),
  daily_data as (
       select 
        (v.created_at at time zone 'utc')::date as day,
        count(*) as count
      from public.post_views v
      join public.posts p on v.post_id = p.id
      where p.user_id = get_dashboard_stats.user_id
        and v.created_at >= (now() - interval '7 days')
      group by 1
  )
  select json_agg(
    json_build_object(
      'date', to_char(d.day, 'YYYY-MM-DD'),
      'name', to_char(d.day, 'Mon DD'),
      'views', coalesce(dd.count, 0)
    ) order by d.day
  ) into graph_data
  from dates d
  left join daily_data dd on d.day = dd.day;
  return json_build_object(
    'totalViews', total_views,
    'totalShares', total_shares,
    'totalSubscribers', total_subscribers,
    'graphData', coalesce(graph_data, '[]'::json)
  );
end;
$$ language plpgsql security definer;
