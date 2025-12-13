import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Initialize Supabase Client
// We use SERVICE_ROLE_KEY if available for backend ops to bypass RLS if needed,
// but for this specific "public insert" logic, the anon key is also fine given the policy.
// However, standard serverless pattern often uses Admin/Service Role for robust backend logic.
// We'll trust the env vars are set.
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS - Allow public access
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
        const { postId } = req.body

        if (!postId) {
            return res.status(400).json({ error: 'Missing postId' })
        }

        // 1. Generate Viewer Hash
        // x-forwarded-for is populated by Vercel/Cloudflare
        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown'
        const ua = req.headers['user-agent'] || 'unknown'

        // Create a deterministic hash for this user + post combination (logic in prompt was user scale, this is fine)
        // The prompt says "viewer_hash = hashed IP + User-Agent".
        // This identifies a unique "device" visiting the site.
        const viewerHash = crypto
            .createHash('sha256')
            .update(`${ip}-${ua}`)
            .digest('hex')

        // 2. Insert into Supabase
        const { error } = await supabase
            .from('blog_views')
            .insert({
                post_id: postId,
                viewer_hash: viewerHash
            })

        // 3. Handle Result
        if (error) {
            // Postgres Unique Violation Code: 23505
            if (error.code === '23505') {
                // Already viewed - success but no-op
                return res.status(200).json({ success: true, message: 'Already viewed' })
            }
            console.error('Supabase error:', error)
            return res.status(500).json({ error: error.message })
        }

        return res.status(200).json({ success: true, message: 'View recorded' })

    } catch (err: any) {
        console.error('Server error:', err)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
