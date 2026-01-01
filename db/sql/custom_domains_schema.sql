DO $$ BEGIN
    CREATE TYPE domain_status_type AS ENUM ('pending', 'verified', 'active', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS domain_status domain_status_type DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verify_token TEXT;
ALTER TABLE public.site_settings 
DROP CONSTRAINT IF EXISTS site_settings_custom_domain_key;
ALTER TABLE public.site_settings 
ADD CONSTRAINT site_settings_custom_domain_key UNIQUE (custom_domain);
CREATE INDEX IF NOT EXISTS idx_site_settings_custom_domain ON public.site_settings(custom_domain);
CREATE POLICY "Public can view settings by custom domain" 
ON public.site_settings FOR SELECT 
USING (custom_domain IS NOT NULL);
