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
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { postId, action, userId } = req.body // userId is optional (trusted client? No, verify auth)
        // Actually, checking auth header is safer than trusting body userId.

        if (!postId || !action) {
            return res.status(400).json({ error: 'Missing postId or action' })
        }

        // 1. Identify User
        let finalUserId = null
        let finalViewerHash = null

        // Check for Auth Header
        const authHeader = req.headers.authorization
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            const { data: { user }, error } = await supabase.auth.getUser(token)
            if (user && !error) {
                finalUserId = user.id
            }
        }

        // Fallback to Hash if not logged in
        if (!finalUserId) {
            const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown'
            const ua = req.headers['user-agent'] || 'unknown'
            finalViewerHash = crypto
                .createHash('sha256')
                .update(`${ip}-${ua}`)
                .digest('hex')
        }

        // 2. Perform Action
        if (action === 'like') {
            const { error } = await supabase
                .from('post_likes')
                .insert({
                    post_id: postId,
                    user_id: finalUserId,
                    viewer_hash: finalViewerHash
                })

            // If success (not duplicate), increment
            if (!error) {
                await supabase.rpc('increment_likes', { pid: postId })
                return res.status(200).json({ success: true, state: 'liked' })
            } else if (error.code === '23505') {
                // Already liked
                return res.status(200).json({ success: true, state: 'liked', message: 'Already liked' })
            } else {
                throw error
            }
        }

        if (action === 'unlike') {
            // Construct match query
            const matchQuery: any = { post_id: postId }
            if (finalUserId) matchQuery.user_id = finalUserId
            else matchQuery.viewer_hash = finalViewerHash

            const { data, error } = await supabase
                .from('post_likes')
                .delete()
                .match(matchQuery)
                .select()

            if (error) throw error

            // If a row was deleted, decrement
            if (data && data.length > 0) {
                await supabase.rpc('decrement_likes', { pid: postId })
                return res.status(200).json({ success: true, state: 'unliked' })
            } else {
                return res.status(200).json({ success: true, state: 'unliked', message: 'Nothing to unlike' })
            }
        }

        return res.status(400).json({ error: 'Invalid action' })

    } catch (err: any) {
        console.error('Server error:', err)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
