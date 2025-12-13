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
import { postService } from '../../services/postService'
import { Post } from '../../types'


export default function Dashboard() {
    // theme removed
    const [subdomain, setSubdomain] = useState<string | null>(null)
    // siteName removed
    const [stats, setStats] = useState({
        totalPosts: 0,
        publishedPosts: 0,
        latestPost: null as Post | null
    })
    const [graphData, setGraphData] = useState<any[]>([])
    // ...

    useEffect(() => {
        const loadRequests = async () => {
            // Load Settings for Subdomain
            const settings = await settingsService.getSettings()
            if (settings) {
                if (settings.subdomain) setSubdomain(settings.subdomain)
            }

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
                posts: counts[date] || 0,
                views: (counts[date] || 0) * 12 + Math.floor(Math.random() * 10) // Mock views data
            }))

            setGraphData(chartData)

        }
        loadRequests()
    }, [])

    // ...

    return (
        <div style={{ paddingBottom: '4rem' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Overview</h1>
            </div>

            {/* Overview Section */}
            <section style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Overview</h2>
                </div>

                {/* Stats & Graph Card */}
                <div style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: 'transparent'
                }}>
                    {/* Top Stats Row */}
                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                        {/* Stat 1: Total Views (Est) */}
                        <div style={{ flex: 1, padding: '1.5rem 0' }}>
                            <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                Total Views
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{(stats.totalPosts * 12).toLocaleString()}</div>
                        </div>
                        {/* Stat 2: Published */}
                        <div style={{ flex: 1, padding: '1.5rem 0' }}>
                            <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                Published
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.publishedPosts}</div>
                        </div>
                    </div>

                    {/* Graph Area */}
                    <div style={{ height: '300px', padding: '1rem 1rem 0 0', marginLeft: '-2rem', background: 'transparent' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={graphData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ff5e00" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#ff5e00" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00cbff" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#00cbff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-elevated)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)'
                                    }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke="var(--accent-secondary)" // Or hardcoded cyan
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorViews)"
                                    style={{ stroke: '#00cbff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="posts"
                                    stroke="var(--accent-primary)" // Or hardcoded orange
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorPosts)"
                                    style={{ stroke: '#ff5e00' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* Bottom Section: Latest Post */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Latest Post</h2>

                {stats.latestPost ? (
                    <Link
                        to={subdomain ? `/${subdomain}` : "/blog"}
                        className="latest-post-card"
                        style={{
                            display: 'block',
                            borderRadius: '16px', // Premium rounded
                            padding: '1.5rem 0', // No horizontal padding for strict left alignment
                            background: 'transparent',
                            boxShadow: 'none',
                            border: 'none',
                            textDecoration: 'none',
                            color: 'inherit',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <style>{`
                            .latest-post-card:hover .glow-text {
                                text-shadow: 0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.5);
                            }
                            .glow-text {
                                transition: text-shadow 0.3s ease;
                            }
                        `}</style>

                        <h3 className="glow-text" style={{
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
                            <span className="glow-text" style={{
                                fontSize: '0.9rem',
                                color: 'var(--text-secondary)',
                                fontFamily: 'var(--font-mono)' // Tech/Data feel for date
                            }}>
                                {new Date(stats.latestPost.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })}
                            </span>

                            <span className="glow-text" style={{
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
        </div>
    )
}
