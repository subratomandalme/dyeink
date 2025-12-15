import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { domain } = req.query

    if (!domain || typeof domain !== 'string') {
        return res.status(400).json({ error: 'Domain is required' })
    }

    const VERCEL_TOKEN = process.env.VERCEL_TOKEN
    const PROJECT_ID = process.env.PROJECT_ID
    const TEAM_ID = process.env.TEAM_ID

    if (!VERCEL_TOKEN) {
        return res.status(500).json({ error: 'Server misconfiguration' })
    }

    try {
        const response = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_ID}/domains/${domain}?teamId=${TEAM_ID}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${VERCEL_TOKEN}`,
            },
        })

        if (!response.ok) {
            const error = await response.json()
            return res.status(response.status).json({ error: error.error?.message || 'Failed to check domain status' })
        }

        const data = await response.json()

        if (data.verified) {
            return res.status(200).json({ verified: true, status: 'active' })
        } else {
            return res.status(200).json({ verified: false, verification: data.verification })
        }

    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}

