-- Allow public (anon/authenticated) to insert into post_views
-- This is required because the Vercel API function is using the Anon Key locally
-- and there was no policy permitting INSERT.

create policy "Allow public insert to post_views"
on public.post_views
for insert
to public
with check (true);

-- Also ensure we can read it (for duplication check within API if we were doing reading, but we rely on error)
-- Actually, duplicate check logic relies on constraint, so we just need INSERT permission.
