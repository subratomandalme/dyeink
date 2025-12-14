export const config = {
    runtime: 'edge',
}


const SECRET = process.env.SUBSCRIBE_SECRET || 'default-secret-change-me'

async function generateToken(email: string) {
    const encoder = new TextEncoder()
    const data = encoder.encode(email + Date.now())
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', key, data)
    return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 })
    }

    try {
        const { email } = await req.json()

        if (!email || !email.includes('@')) {
            return new Response('Invalid email', { status: 400 })
        }

        
        
        

        
        const token = await generateToken(email)

        
        
        console.log(`[Mock Email] Sending verification to ${email} with token ${token}`)

        
        
        

        return new Response(JSON.stringify({ ok: true, message: 'Verification email sent' }), {
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('Subscribe Error:', error)
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
    }
}
 
