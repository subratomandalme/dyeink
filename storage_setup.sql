insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'post-images' );

drop policy if exists "Authenticated Users Upload" on storage.objects;
create policy "Authenticated Users Upload"
  on storage.objects for insert
  with check ( bucket_id = 'post-images' and auth.role() = 'authenticated' );

drop policy if exists "Authenticated Users Update" on storage.objects;
create policy "Authenticated Users Update"
  on storage.objects for update
  using ( bucket_id = 'post-images' and auth.role() = 'authenticated' );

drop policy if exists "Authenticated Users Delete" on storage.objects;
create policy "Authenticated Users Delete"
  on storage.objects for delete
  using ( bucket_id = 'post-images' and auth.role() = 'authenticated' );

ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS newsletter_email TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS dribbble_link TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS huggingface_link TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS behance_link TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS leetcode_link TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS hackerrank_link TEXT;
