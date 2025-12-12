import { supabase } from '../lib/supabase'

export const subscribeService = {
    async subscribe(email: string) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email address')
        }

        // Check if already subscribed
        const { data: existing } = await supabase
            .from('subscribers')
            .select('id')
            .eq('email', email)
            .single()

        if (existing) {
            throw new Error('This email is already subscribed.')
        }

        // Insert new subscriber
        const { error } = await supabase
            .from('subscribers')
            .insert({
                email,
                active: true,
                created_at: new Date().toISOString()
            })

        if (error) {
            console.error('Error subscribing:', error)
            throw new Error('Failed to subscribe. Please try again.')
        }
    },

    async unsubscribe(email: string) {
        const { error } = await supabase
            .from('subscribers')
            .update({ active: false })
            .eq('email', email)

        if (error) throw error
    },

    // This method would realistically be called by a server-side trigger or Cron job
    // simulating the "Send Email" functionality requested.
    async broadcastNewPost(postTitle: string, postLink: string) {
        console.log(`[Email Service] Broadcasting: "${postTitle}" with link ${postLink} to all active subscribers.`)
        // In a real deployment, this would call a Supabase Edge Function:
        // await supabase.functions.invoke('send-email-notification', { body: { title: postTitle, link: postLink } })
    }
}
