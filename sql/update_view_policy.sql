create policy "Allow public insert to post_views"
on public.post_views
for insert
to public
with check (true);
