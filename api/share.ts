import { createClient } from '@supabase/supabase-js'

export const config = {
    runtime: 'edge',
}

export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 })
    }

    try {
        const { postId } = await request.json()

        if (!postId) {
            return new Response(JSON.stringify({ error: 'Post ID is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        const supabase = createClient(
            process.env.VITE_SUPABASE_URL!,
            process.env.VITE_SUPABASE_ANON_KEY!
        )

        // Increment shares using RPC
        const { error } = await supabase.rpc('increment_shares', { post_id: postId })

        if (error) throw error

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error: any) {
        console.error('Share Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
