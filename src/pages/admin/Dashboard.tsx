import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import {
    ArrowRight
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { settingsService } from '../../services/settingsService'

// ... existing imports

export default function Dashboard() {
    const [subdomain, setSubdomain] = useState<string | null>(null)
    const [stats, setStats] = useState({
        totalPosts: 0,
        publishedPosts: 0,
        latestPost: null as Post | null
    })
    // ...

    useEffect(() => {
        const loadRequests = async () => {
            // Load Settings for Subdomain
            const settings = await settingsService.getSettings()
            if (settings?.subdomain) setSubdomain(settings.subdomain)

            // Load Posts
            const posts = await postService.getPosts()
            // ... (keep existing stats calculation)
            setStats({
                totalPosts: posts.length,
                publishedPosts: posts.filter(p => p.published).length,
                latestPost: posts[0] || null
            })
            // ... (keep existing graph data logic)
            // Calculate Graph Data (Posts per Day for last 7 days)
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date()
                d.setDate(d.getDate() - (6 - i))
                return d.toISOString().split('T')[0] // YYYY-MM-DD
            })

            const counts = posts.reduce((acc, post) => {
                const date = new Date(post.createdAt).toISOString().split('T')[0]
                acc[date] = (acc[date] || 0) + 1
                return acc
            }, {} as Record<string, number>)

            const chartData = last7Days.map(date => ({
                name: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                posts: counts[date] || 0
            }))

            setGraphData(chartData)

        }
        loadRequests()
    }, [])

    // ...

    {/* Bottom Section: Latest Post */ }
    <div style={{ marginBottom: '2rem' }}>
        {stats.latestPost ? (
            <Link
                to={subdomain ? `/${subdomain}` : "/blog"}
                style={{
                    display: 'block',
                    borderRadius: '16px', // Premium rounded
                    padding: '1.5rem', // Compact
                    background: 'transparent',
                    boxShadow: 'none',
                    border: 'none',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = theme === 'dark'
                        ? '0 0 20px rgba(255, 255, 255, 0.15)'
                        : '0 0 20px rgba(0, 0, 0, 0.2)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                }}
            >
                {/* Corner Dots */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--text-primary)', opacity: 0.8 }} />
                <div style={{ position: 'absolute', top: '12px', right: '12px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--text-primary)', opacity: 0.8 }} />
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--text-primary)', opacity: 0.8 }} />
                <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--text-primary)', opacity: 0.8 }} />

                <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    marginBottom: '1rem'
                }}>
                    Latest Post
                </div>

                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    margin: '0 0 0.5rem 0',
                    fontFamily: 'var(--font-display)', // Use display font for impact
                    color: 'var(--text-primary)',
                    lineHeight: 1.2,
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {stats.latestPost.title}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                    <span style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)' // Tech/Data feel for date
                    }}>
                        {new Date(stats.latestPost.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </span>

                    <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        color: 'var(--text-primary)'
                    }}>
                        View Post <ArrowRight size={18} />
                    </span>
                </div>
            </Link>
        ) : (
            <div style={{
                borderRadius: '16px',
                padding: '1.5rem',
                background: 'transparent',
                border: 'none',
                textAlign: 'center',
                color: 'var(--text-muted)'
            }}>
                No posts yet. <Link to="/admin/posts/new" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>Create one?</Link>
            </div>
        )}
    </div>
        </div >
    )
}
