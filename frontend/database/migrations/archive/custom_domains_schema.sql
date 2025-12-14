-- Add Custom Domain fields to site_settings table

-- 1. Create ENUM for domain status if it doesn't exist
DO $$ BEGIN
    CREATE TYPE domain_status_type AS ENUM ('pending', 'verified', 'active', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add columns to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS domain_status domain_status_type DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verify_token TEXT;

-- 3. Add Unique Constraint to custom_domain
ALTER TABLE public.site_settings 
DROP CONSTRAINT IF EXISTS site_settings_custom_domain_key;

ALTER TABLE public.site_settings 
ADD CONSTRAINT site_settings_custom_domain_key UNIQUE (custom_domain);

-- 4. Create Index for fast lookup by domain
CREATE INDEX IF NOT EXISTS idx_site_settings_custom_domain ON public.site_settings(custom_domain);

-- 5. RLS Policies (Ensure Public Read Access for Domain Lookup)
-- Allow anyone to read settings by custom_domain (needed for the blog loader)
CREATE POLICY "Public can view settings by custom domain" 
ON public.site_settings FOR SELECT 
USING (custom_domain IS NOT NULL);
