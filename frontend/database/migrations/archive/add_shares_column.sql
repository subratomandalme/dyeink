-- Add shares column to posts table if it doesn't exist
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS shares BIGINT DEFAULT 0;

-- Simple RPC to increment shares safely
create or replace function public.increment_shares(post_id bigint)
returns void as $$
begin
  update public.posts
  set shares = coalesce(shares, 0) + 1
  where id = increment_shares.post_id;
end;
$$ language plpgsql security definer;
