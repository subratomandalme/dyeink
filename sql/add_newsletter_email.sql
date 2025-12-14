ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS newsletter_email TEXT;
SELECT * FROM public.site_settings LIMIT 1;
