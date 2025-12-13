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

        const likeKey = `liked:${postId}:${fingerprint}`

        // 1. Check if already liked (TTL 90 days)
        const exists = await redis.get(likeKey)
        if (exists) {
            return new Response(JSON.stringify({ error: 'Already liked' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // 2. Mark as liked (TTL 90 days)
        await redis.set(likeKey, 1, { ex: 60 * 60 * 24 * 90 })

        // 3. Increment Counter
        await redis.incr(`likes:counter:${postId}`)

        return new Response(JSON.stringify({ ok: true }), {
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('Redis Like Error:', error)
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
    }
}
