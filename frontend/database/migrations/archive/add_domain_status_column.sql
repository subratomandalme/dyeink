-- Add domain_status column if it doesn't exist
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS domain_status TEXT;

-- Verify it exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'site_settings' 
AND column_name = 'domain_status';
