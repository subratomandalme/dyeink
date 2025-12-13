import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { postId } = req.body

        if (!postId) {
            return res.status(400).json({ error: 'Missing postId' })
        }

        // 1. Identify User (Auth Token)
        let userId = null
        const authHeader = req.headers.authorization
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            const { data: { user }, error } = await supabase.auth.getUser(token)
            if (user && !error) userId = user.id
        }

        // 2. Generate Hash (Guest Logic)
        let viewerHash = null
        if (!userId) {
            const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown'
            const ua = req.headers['user-agent'] || 'unknown'
            viewerHash = crypto
                .createHash('sha256')
                .update(`${ip}-${ua}`)
                .digest('hex')
        }

        // 3. Insert into post_views
        const { error } = await supabase
            .from('post_views')
            .insert({
                post_id: postId,
                user_id: userId,
                viewer_hash: viewerHash
            })

        // 4. Handle Result
        if (error) {
            if (error.code === '23505') {
                // Already viewed
                return res.status(200).json({ viewed: false })
            }
            console.error('Supabase error:', error)
            return res.status(500).json({ error: error.message })
        }

        // 5. Increment Counter (RPC)
        await supabase.rpc('increment_views', { pid: postId })

        return res.status(200).json({ viewed: true })

    } catch (err: any) {
        console.error('Server error:', err)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
