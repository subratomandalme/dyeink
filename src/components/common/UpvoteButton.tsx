
import { useState, useEffect } from 'react'
import { ThumbsUp } from 'lucide-react'
import { voteService } from '../../services/voteService'

interface UpvoteButtonProps {
    postId: number
}

export default function UpvoteButton({ postId }: UpvoteButtonProps) {
    const [count, setCount] = useState(0)
    const [hasVoted, setHasVoted] = useState(false)
    const [loading, setLoading] = useState(true)
    const [animating, setAnimating] = useState(false)

    useEffect(() => {
        loadStatus()
    }, [postId])

    const loadStatus = async () => {
        try {
            const status = await voteService.getVoteStatus(postId)
            setCount(status.count)
            setHasVoted(status.hasVoted)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleVote = async () => {
        // Optimistic UI Update
        const previousVoted = hasVoted
        const previousCount = count

        setHasVoted(!previousVoted)
        setCount(previousVoted ? previousCount - 1 : previousCount + 1)
        setAnimating(true)
        setTimeout(() => setAnimating(false), 300)

        // Actual API Call
        try {
            const result = await voteService.toggleVote(postId)
            // Sync with server truth
            setHasVoted(result.has_voted)
            setCount(result.count)
        } catch (e) {
            // Revert on error
            setHasVoted(previousVoted)
            setCount(previousCount)
            console.error('Vote failed')
        }
    }

    return (
        <button
            onClick={handleVote}
            disabled={loading}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '50px',
                border: hasVoted ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                background: hasVoted ? 'rgba(var(--accent-primary-rgb), 0.1)' : 'var(--bg-elevated)', // Fallback if rgb var not set, will adjust
                color: hasVoted ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: hasVoted ? '0 0 15px rgba(255, 94, 0, 0.3)' : 'none', // Orange glow matching accent
                transform: animating ? 'scale(1.1)' : 'scale(1)'
            }}
            onMouseEnter={(e) => {
                if (!hasVoted) {
                    e.currentTarget.style.borderColor = 'var(--text-primary)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                }
            }}
            onMouseLeave={(e) => {
                if (!hasVoted) {
                    e.currentTarget.style.borderColor = 'var(--border-color)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                }
            }}
        >
            <ThumbsUp
                size={18}
                fill={hasVoted ? "currentColor" : "none"}
                strokeWidth={hasVoted ? 0 : 2}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {loading ? '-' : count}
            </span>
        </button>
    )
}
