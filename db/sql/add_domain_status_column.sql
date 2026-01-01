ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS domain_status TEXT;
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'site_settings' 
AND column_name = 'domain_status';
