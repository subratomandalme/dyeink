-- Force add UNIQUE constraint to user_id in site_settings
-- This fixes the "duplicate key" error when saving settings via upsert.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'site_settings_user_id_key'
    ) THEN
        ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_user_id_key UNIQUE (user_id);
    END IF;
END $$;
