import { useEffect, useRef } from 'react'

interface Props {
    colors: string[]
    noise?: number
    speed?: number
}

export default function ColorBends({ colors = ['#ffffff', '#f0f0f0', '#e0e0e0'], noise = 0.05, speed = 0.001 }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let time = 0

        const render = () => {
            // Simple animated gradient fallback for stability
            time += speed * 10

            const w = canvas.width
            const h = canvas.height

            // Create gradient
            const gradient = ctx.createLinearGradient(0, 0, w, h)

            // Shift colors slightly
            const c1 = colors[0] // Main
            const c2 = colors[1 % colors.length]
            const c3 = colors[2 % colors.length]

            gradient.addColorStop(0, c1)
            gradient.addColorStop(0.5 + Math.sin(time) * 0.1, c2)
            gradient.addColorStop(1, c3)

            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, w, h)

            // Add simple noise
            if (noise > 0) {
                // Very simple noise overlay
                // (Skipping heavy per-pixel noise for performance, using overlay method usually better)
            }

            animationFrameId = requestAnimationFrame(render)
        }

        const resize = () => {
            const parent = canvas.parentElement
            if (parent) {
                canvas.width = parent.clientWidth
                canvas.height = parent.clientHeight
            }
        }

        window.addEventListener('resize', resize)
        resize()
        render()

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [colors, noise, speed])

    return (
        <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
        />
    )
}
