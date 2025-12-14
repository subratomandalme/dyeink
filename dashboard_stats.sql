-- Function to get dashboard stats (Total Views, Total Likes, Graph Data)
-- Returns a JSON object with all necessary data to minimize round trips
create or replace function public.get_dashboard_stats(user_id uuid)
returns json as $$
declare
  total_views bigint;
  graph_data json;
begin
  -- 1. Calculate Total Views for this user's posts
  select coalesce(sum(views), 0) into total_views
  from public.posts
  where user_id = get_dashboard_stats.user_id;

  -- 2. Calculate Graph Data (Last 7 Days)
  with recursive dates as (
      select (now() at time zone 'utc')::date - 6 as day
      union all
      select day + 1 from dates where day < (now() at time zone 'utc')::date
  ),
  daily_views as (
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
      'views', coalesce(v.count, 0)
    ) order by d.day
  ) into graph_data
  from dates d
  left join daily_views v on d.day = v.day;

  return json_build_object(
    'totalViews', total_views,
    'graphData', coalesce(graph_data, '[]'::json)
  );
end;
$$ language plpgsql security definer;
