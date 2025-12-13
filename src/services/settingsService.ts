import { supabase } from '../lib/supabase'

export interface SiteSettings {
    id?: number
    siteName: string
    siteDescription: string
    customDomain: string | null
    subdomain: string | null
    twitterLink?: string | null
    linkedinLink?: string | null
    githubLink?: string | null
    websiteLink?: string | null
    newsletterEmail?: string | null
}

export const settingsService = {
    async getSettings(): Promise<SiteSettings | null> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            console.error('Error fetching settings:', error)
            throw error
        }

        return {
            id: data.id,
            siteName: data.site_name,
            siteDescription: data.site_description,
            customDomain: data.custom_domain,
            subdomain: data.subdomain,
            twitterLink: data.twitter_link,
            linkedinLink: data.linkedin_link,
            githubLink: data.github_link,
            websiteLink: data.website_link,
            newsletterEmail: data.newsletter_email
        }
    },

    async getPublicSettings(): Promise<SiteSettings | null> {
        // Fetch the main blog settings (assuming single user/owner for this MVP)
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .limit(1)
            .single()

        if (error) {
            console.error('Error fetching public settings:', error)
            return null
        }

        return {
            id: data.id,
            siteName: data.site_name,
            siteDescription: data.site_description,
            customDomain: data.custom_domain,
            subdomain: data.subdomain,
            twitterLink: data.twitter_link,
            linkedinLink: data.linkedin_link,
            githubLink: data.github_link,
            websiteLink: data.website_link,
            newsletterEmail: data.newsletter_email
        }
    },

    async getSettingsBySubdomain(subdomain: string): Promise<{ settings: SiteSettings; userId: string } | null> {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*, user_id') // We need user_id to fetch their posts
            .eq('subdomain', subdomain)
            .single()

        if (error) {
            console.error('Error fetching settings by subdomain:', error)
            return null
        }

        return {
            settings: {
                id: data.id,
                siteName: data.site_name,
                siteDescription: data.site_description,
                customDomain: data.custom_domain,
                subdomain: data.subdomain,
                twitterLink: data.twitter_link,
                linkedinLink: data.linkedin_link,
                githubLink: data.github_link,
                websiteLink: data.website_link,
                newsletterEmail: data.newsletter_email
            },
            userId: data.user_id
        }
    },

    async saveSettings(settings: SiteSettings): Promise<SiteSettings | null> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const updates = {
            user_id: user.id,
            site_name: settings.siteName,
            site_description: settings.siteDescription,
            custom_domain: settings.customDomain,
            subdomain: settings.subdomain || `blog-${user.id.slice(0, 8)}`, // Generate default subdomain if missing
            twitter_link: settings.twitterLink,
            linkedin_link: settings.linkedinLink,
            github_link: settings.githubLink,
            website_link: settings.websiteLink,
            newsletter_email: settings.newsletterEmail
        }

        // Check if exists first to decide insert vs update (or use upsert)
        const { data, error } = await supabase
            .from('site_settings')
            .upsert(updates, { onConflict: 'user_id' })
            .select()
            .single()

        if (error) {
            console.error('Error saving settings:', error)
            throw error
        }

        return {
            id: data.id,
            siteName: data.site_name,
            siteDescription: data.site_description,
            customDomain: data.custom_domain,
            subdomain: data.subdomain,
            twitterLink: data.twitter_link,
            linkedinLink: data.linkedin_link,
            githubLink: data.github_link,
            websiteLink: data.website_link,
            newsletterEmail: data.newsletter_email // Fixed logic here
        }
    }
}
