export const config = {
    runtime: 'edge',
}

export default async function handler(req: Request) {
    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Only POST allowed" }), { status: 405 })
    }

    try {
        const { domain } = await req.json()

        if (!domain) {
            return new Response(JSON.stringify({ error: "Domain required" }), { status: 400 })
        }

        // Vercel API: Add Domain to Project
        const response = await fetch(
            `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: domain })
            }
        )

        const data = await response.json()

        if (!response.ok) {
            // Special handling for "Already in use" error
            // If the user manually added the domain or it's on the project but API returns conflict,
            // we treat it as success to allow the UI to proceed to "Verified" state.
            if (response.status === 409 || data.error?.code === 'domain_already_in_use' || data.error?.message?.includes('already in use')) {
                return new Response(JSON.stringify({ success: true, verified: true }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                })
            }

            return new Response(JSON.stringify({
                error: data.error?.message || "Failed to add domain to Vercel"
            }), { status: 400 })
        }

        return new Response(JSON.stringify({ success: true, verified: data.verified }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error("API Error:", error)
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 })
    }
}
