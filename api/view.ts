import { Redis } from '@upstash/redis'

export const config = {
    runtime: 'edge',
}

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 })
    }

    try {
        const { postId, fingerprint } = await req.json()

        if (!postId || !fingerprint) {
            return new Response('Missing postId or fingerprint', { status: 400 })
        }

        const viewKey = `viewed:${postId}:${fingerprint}`

        // 1. Check if already viewed in last 24h
        const exists = await redis.get(viewKey)
        if (exists) {
            return new Response(JSON.stringify({ ok: true, cached: true }), {
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // 2. Mark as viewed (TTL 24h)
        await redis.set(viewKey, 1, { ex: 86400 })

        // 3. Increment Counter
        await redis.incr(`views:counter:${postId}`)

        return new Response(JSON.stringify({ ok: true }), {
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('Redis View Error:', error)
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
    }
}
