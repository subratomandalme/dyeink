-- Add newsletter_email column to site_settings
-- Run this in Supabase SQL Editor

ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS newsletter_email TEXT;

-- Verify it works
SELECT * FROM public.site_settings LIMIT 1;
