import { Redis } from '@upstash/redis'
import { createClient } from '@supabase/supabase-js'

// Vercel Cron protection
export const config = {
    runtime: 'edge',
}

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY! // Or Service Role Key for writing
)

export default async function handler(req: Request) {
    // Basic Auth Check for CRON (or check Vercel Signature)
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // return new Response('Unauthorized', { status: 401 })
        // Commented out for dev testing via browser/curl easily
    }

    try {
        // --- 1. Flush Views ---
        const viewKeys = await redis.keys('views:counter:*')
        let viewUpdates = 0

        for (const key of viewKeys) {
            const count = await redis.get(key)
            if (count) {
                const postId = key.split(':')[2]

                // Atomic Increment in Postgres (using rpc is better, or raw query)
                // For simplicity/mvp: Get current, add, update. 
                // BETTER: creating an RPC function `increment_views(post_id, amount)`
                // But let's try standard update if possible or just log for now.

                const { error } = await supabase.rpc('increment_post_stats', {
                    post_id_input: postId,
                    views_increment: Number(count),
                    likes_increment: 0
                })

                if (!error) {
                    await redis.del(key)
                    viewUpdates++
                } else {
                    console.error('Failed to sync views for', postId, error)
                }
            }
        }

        // --- 2. Flush Likes ---
        const likeKeys = await redis.keys('likes:counter:*')
        let likeUpdates = 0

        for (const key of likeKeys) {
            const count = await redis.get(key)
            if (count) {
                const postId = key.split(':')[2]

                const { error } = await supabase.rpc('increment_post_stats', {
                    post_id_input: postId,
                    views_increment: 0,
                    likes_increment: Number(count)
                })

                if (!error) {
                    await redis.del(key)
                    likeUpdates++
                } else {
                    console.error('Failed to sync likes for', postId, error)
                }
            }
        }

        return new Response(JSON.stringify({
            ok: true,
            synced: { views: viewUpdates, likes: likeUpdates }
        }), {
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('Flush Worker Error:', error)
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
    }
}
