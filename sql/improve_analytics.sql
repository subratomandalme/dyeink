DROP FUNCTION IF EXISTS public.get_dashboard_stats(uuid);
DROP FUNCTION IF EXISTS public.increment_post_view(bigint);
DROP FUNCTION IF EXISTS public.increment_shares(bigint);
create or replace function public.get_author_overview(p_user_id uuid)
returns json as $$
declare
  total_views bigint; total_shares bigint; total_subscribers bigint; graph_data json;
begin
  select coalesce(sum(views), 0) into total_views from public.posts where user_id = p_user_id;
  select coalesce(sum(shares), 0) into total_shares from public.posts where user_id = p_user_id;
  select count(*) into total_subscribers from public.subscribers s join public.site_settings ss on s.blog_id = ss.id where ss.user_id = p_user_id;
  with recursive dates as (
      select (now() at time zone 'utc')::date - 6 as day
      union all select day + 1 from dates where day < (now() at time zone 'utc')::date
  ),
  daily_agg as (
      select d.date as day, sum(d.views) as views_count, sum(d.shares) as shares_count
      from public.daily_post_stats d join public.posts p on d.post_id = p.id
      where p.user_id = p_user_id and d.date >= (CURRENT_DATE - 6) group by 1
  )
  select json_agg(json_build_object(
      'date', to_char(dt.day, 'YYYY-MM-DD'), 'name', to_char(dt.day, 'Mon DD'),
      'views', coalesce(da.views_count, 0), 'shares', coalesce(da.shares_count, 0)
  ) order by dt.day) into graph_data from dates dt left join daily_agg da on dt.day = da.day;
  return json_build_object('totalViews', total_views, 'totalShares', total_shares, 'totalSubscribers', total_subscribers, 'graphData', coalesce(graph_data, '[]'::json));
end;
$$ language plpgsql security definer;
create or replace function public.count_post_visit(p_post_id bigint)
returns void as $$
begin
  update public.posts set views = coalesce(views, 0) + 1 where id = p_post_id;
  insert into public.daily_post_stats (date, post_id, views) values (CURRENT_DATE, p_post_id, 1)
  on conflict (date, post_id) do update set views = daily_post_stats.views + 1;
end;
$$ language plpgsql security definer;
create or replace function public.count_post_action(p_post_id bigint)
returns void as $$
begin
  update public.posts set shares = coalesce(shares, 0) + 1 where id = p_post_id;
  insert into public.daily_post_stats (date, post_id, shares) values (CURRENT_DATE, p_post_id, 1)
  on conflict (date, post_id) do update set shares = daily_post_stats.shares + 1;
end;
$$ language plpgsql security definer;
grant execute on function public.get_author_overview(uuid) to anon, authenticated, service_role;
grant execute on function public.count_post_action(bigint) to anon, authenticated, service_role;
grant execute on function public.count_post_visit(bigint) to anon, authenticated, service_role;
