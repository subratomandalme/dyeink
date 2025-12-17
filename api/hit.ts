import { createClient } from '@supabase/supabase-js'

export const config = {
    runtime: 'edge',
}

export default async function handler(request: Request) {
    try {
        const url = new URL(request.url)
        const id = url.searchParams.get('id')
        const type = url.searchParams.get('type') || 'view'

        if (!id) return new Response('Missing ID', { status: 400 })

        const supabaseUrl = process.env.VITE_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
            return new Response('Server Config Error', { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)
        const postId = parseInt(id)


        let rpcName = type === 'share' ? 'count_post_action' : 'count_post_visit'
        const { error: rpcError } = await supabase.rpc(rpcName, { p_post_id: postId })

        if (rpcError) {
            console.log('RPC Failed, falling back to manual update:', rpcError)

            const { data: post } = await supabase
                .from('posts')
                .select(type === 'share' ? 'shares' : 'views')
                .eq('id', postId)
                .single()

            if (post) {
                const current = (type === 'share' ? (post as any).shares : (post as any).views) || 0
                const update = type === 'share' ? { shares: current + 1 } : { views: current + 1 }

                await supabase.from('posts').update(update).eq('id', postId)

                const date = new Date().toISOString().split('T')[0]
                const field = type === 'share' ? 'shares' : 'views'

                const { data: daily } = await supabase
                    .from('daily_post_stats')
                    .select('id, ' + field)
                    .eq('post_id', postId)
                    .eq('date', date)
                    .single()

                if (daily) {
                    await supabase
                        .from('daily_post_stats')
                        .update({ [field]: ((daily as any)[field] || 0) + 1 })
                        .eq('id', (daily as any).id)
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

