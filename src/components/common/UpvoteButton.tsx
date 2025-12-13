import { useState, useEffect } from 'react'
import { ThumbsUp } from 'lucide-react'

interface UpvoteButtonProps {
    postId: number
    initialCount?: number // Pass from parent
}

export default function UpvoteButton({ postId, initialCount = 0 }: UpvoteButtonProps) {
    const [count, setCount] = useState(initialCount)
    const [upvoted, setUpvoted] = useState(false)
    const [animating, setAnimating] = useState(false)

    // Decrypting Effect State
    const [displayCount, setDisplayCount] = useState<string>(initialCount.toString())

    useEffect(() => {
        // Check local state for anonymous like
        const voted = localStorage.getItem(`upvoted_${postId}`)
        if (voted === 'true') setUpvoted(true)
        setCount(initialCount) // Sync with prop if it updates
    }, [postId, initialCount])

    // Effect to run decryption animation when count changes
    useEffect(() => {
        let iteration = 0
        const finalValue = count.toString()
        const possibleChars = '0123456789$$##@@!!&&**'

        const interval = setInterval(() => {
            setDisplayCount(() => finalValue.split('').map((_, index) => {
                if (index < iteration) return finalValue[index]
                return possibleChars[Math.floor(Math.random() * possibleChars.length)]
            }).join(''))

            if (iteration >= finalValue.length) {
                clearInterval(interval)
            }

            // Speed of reveal
            iteration += 1 / 3
        }, 30)

        return () => clearInterval(interval)
    }, [count])

    const handleUpvote = async () => {
        const newUpvoted = !upvoted
        const newCount = count + (newUpvoted ? 1 : -1)

        // Optimistic UI Update
        setUpvoted(newUpvoted)
        setCount(newCount)
        localStorage.setItem(`upvoted_${postId}`, newUpvoted.toString())

        setAnimating(true)
        setTimeout(() => setAnimating(false), 500)

        try {
            // Call Scalable API
            await fetch('/api/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId,
                    action: newUpvoted ? 'like' : 'unlike'
                })
            })
        } catch (error) {
            console.error('Like failed:', error)
            // Revert on error
            setUpvoted(upvoted)
            setCount(count)
            localStorage.setItem(`upvoted_${postId}`, upvoted.toString())
        }
    }

    // Dynamic Glitch Styles
    const glitchKeyframes = `
        @keyframes glitch-skew {
            0% { transform: skew(0deg); }
            20% { transform: skew(-20deg); }
            40% { transform: skew(10deg); }
            60% { transform: skew(-5deg); }
            80% { transform: skew(5deg); }
            100% { transform: skew(0deg); }
        }
    `

    return (
        <button
            onClick={handleUpvote}
            disabled={false} // Always allow toggle (optimistic)
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.5rem 0', // Reduced horizontal padding as it's just text/icon now
                background: 'transparent', // No background
                border: 'none', // No border requested
                color: upvoted ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'color 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
                if (!upvoted) {
                    e.currentTarget.style.color = 'var(--text-primary)'
                }
            }}
            onMouseLeave={(e) => {
                if (!upvoted) {
                    e.currentTarget.style.color = 'var(--text-secondary)'
                }
            }}
        >
            <style>{glitchKeyframes}</style>

            <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                animation: animating ? 'glitch-skew 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite' : 'none'
            }}>
                <ThumbsUp
                    size={20}
                    fill={upvoted ? "currentColor" : "none"}
                    strokeWidth={upvoted ? 0 : 2}
                    style={{
                        filter: upvoted && animating ? 'drop-shadow(2px 2px 0px #ff00ff) drop-shadow(-2px -2px 0px #00ffff)' : 'none',
                        transition: 'filter 0.1s'
                    }}
                />
            </div>

            <span style={{
                fontSize: '1rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                minWidth: '2ch', // Prevent jumping
                letterSpacing: '-0.05em'
            }}>
                {displayCount}
            </span>
        </button>
    )
}
