import { createClient } from '@supabase/supabase-js'

export const config = {
    runtime: 'edge',
}

export default async function handler(request: Request) {
    try {
        const url = new URL(request.url)
        const id = url.searchParams.get('id')
        const type = url.searchParams.get('type') || 'view' // 'view' or 'share'

        if (!id) return new Response('Missing ID', { status: 400 })

        // 1. Init Supabase with SERVICE ROLE KEY (Bypasses RLS triggers)
        const supabaseUrl = process.env.VITE_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
            return new Response('Server Config Error', { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)
        const postId = parseInt(id)

        // 2. The "Simple" Update (Read -> Write)
        // We try RPC first (Atomic), if fails, we do Manual (Racey but working)

        let rpcName = type === 'share' ? 'count_post_action' : 'count_post_visit'
        const { error: rpcError } = await supabase.rpc(rpcName, { p_post_id: postId })

        if (rpcError) {
            console.log('RPC Failed, falling back to manual update:', rpcError)

            // MANUAL FALLBACK (The "Make it work" code)
            // 1. Get current
            const { data: post } = await supabase
                .from('posts')
                .select(type === 'share' ? 'shares' : 'views')
                .eq('id', postId)
                .single()

            if (post) {
                const current = (type === 'share' ? post.shares : post.views) || 0
                const update = type === 'share' ? { shares: current + 1 } : { views: current + 1 }

                // 2. Set new
                await supabase.from('posts').update(update).eq('id', postId)

                // 3. Try to insert stats entry (Best Effort)
                // We duplicate this logic here using raw insert if RPC failed
                const date = new Date().toISOString().split('T')[0]
                const field = type === 'share' ? 'shares' : 'views'

                // Check daily exists
                const { data: daily } = await supabase
                    .from('daily_post_stats')
                    .select('id, ' + field)
                    .eq('post_id', postId)
                    .eq('date', date)
                    .single()

                if (daily) {
                    await supabase
                        .from('daily_post_stats')
                        .update({ [field]: (daily[field] || 0) + 1 })
                        .eq('id', daily.id)
                } else {
                    await supabase
                        .from('daily_post_stats')
                        .insert({
                            date,
                            post_id: postId,
                            [field]: 1
                        })
                }
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        })
    } catch (e: any) {
        return new Response(e.message, { status: 500 })
    }
}
