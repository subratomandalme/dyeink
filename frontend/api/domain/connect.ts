import type { VercelRequest, VercelResponse } from '@vercel/node'
// import { createClient } from '@supabase/supabase-js'

// You might need to install @vercel/node if not present, checking package.json later.
// For now, I'll assume standard Vercel function signature.

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { domain } = req.body

    if (!domain) {
        return res.status(400).json({ error: 'Domain is required' })
    }

    // TODO: Verify user authentication here (parse JWT or Supabase session)
    // For MVP, we assume the client sets the 'pending' status in DB, 
    // and this endpoint is responsible for communicating with Vercel API.

    // In a real secure app, this endpoint should:
    // 1. Verify Auth Header
    // 2. Add domain to Vercel
    // 3. Update DB to 'pending' with verify_token

    // Vercel API
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN
    const PROJECT_ID = process.env.PROJECT_ID
    const TEAM_ID = process.env.TEAM_ID // Optional if using team

    if (!VERCEL_TOKEN) {
        console.error("Missing VERCEL_TOKEN")
        return res.status(500).json({ error: 'Server misconfiguration' })
    }

    try {
        const response = await fetch(`https://api.vercel.com/v10/projects/${PROJECT_ID}/domains${TEAM_ID ? `?teamId=${TEAM_ID}` : ''}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${VERCEL_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: domain }),
        })

        if (!response.ok) {
            const error = await response.json()
            return res.status(response.status).json({ error: error.error?.message || 'Failed to add domain to Vercel' })
        }

        const data = await response.json()
        return res.status(200).json(data)

    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}
