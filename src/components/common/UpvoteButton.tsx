import { useState, useEffect } from 'react'
import { ThumbsUp } from 'lucide-react'
import { analyticsService } from '../../services/api'

interface UpvoteButtonProps {
    postId: number
    initialCount?: number // Pass from parent
}

export default function UpvoteButton({ postId, initialCount = 0 }: UpvoteButtonProps) {
    const [count, setCount] = useState(initialCount)
    const [hasVoted, setHasVoted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [animating, setAnimating] = useState(false)

    // Decrypting Effect State
    const [displayCount, setDisplayCount] = useState<string>(initialCount.toString())

    useEffect(() => {
        // Check local state for anonymous like
        const voted = localStorage.getItem(`liked_${postId}`)
        if (voted) setHasVoted(true)
        setCount(initialCount) // Sync with prop if it updates
    }, [postId, initialCount])

    // Effect to run decryption animation when count changes
    useEffect(() => {
        if (loading) return

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
    }, [count, loading])

    const handleVote = async () => {
        if (hasVoted || loading) return

        setLoading(true)

        // Optimistic UI
        setHasVoted(true)
        setCount(prev => prev + 1)
        localStorage.setItem(`liked_${postId}`, 'true')

        setAnimating(true)
        setTimeout(() => setAnimating(false), 500)

        const { ok, error } = await analyticsService.likePost(postId.toString())

        if (!ok) {
            console.error('Like failed:', error)
            // If strictly ensuring server truth, revert here. 
            // But "Already liked" is fine, we just keep it liked.
            if (error !== 'Already liked') {
                setHasVoted(false)
                setCount(prev => prev - 1)
                localStorage.removeItem(`liked_${postId}`)
            }
        }
        setLoading(false)
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
            onClick={handleVote}
            disabled={hasVoted || loading}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.5rem 0', // Reduced horizontal padding as it's just text/icon now
                background: 'transparent', // No background
                border: 'none', // No border requested
                color: hasVoted ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: hasVoted ? 'default' : 'pointer',
                transition: 'color 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
                if (!hasVoted) {
                    e.currentTarget.style.color = 'var(--text-primary)'
                }
            }}
            onMouseLeave={(e) => {
                if (!hasVoted) {
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
                    fill={hasVoted ? "currentColor" : "none"}
                    strokeWidth={hasVoted ? 0 : 2}
                    style={{
                        filter: hasVoted && animating ? 'drop-shadow(2px 2px 0px #ff00ff) drop-shadow(-2px -2px 0px #00ffff)' : 'none',
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
                {loading && !hasVoted ? '-' : displayCount}
            </span>
        </button>
    )
}
