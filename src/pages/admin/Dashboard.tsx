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
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminStore } from '../../store/adminStore'
import { useAuthStore } from '../../store' // Import from index
import { supabase } from '../../lib/supabase'
import WaveLoader from '../../components/common/WaveLoader'


export default function Dashboard() {
    const { posts, settings, fetchPosts, fetchSettings, postsLoading } = useAdminStore()
    const { user } = useAuthStore() // Get user
    const [realStats, setRealStats] = useState<{
        totalViews: number;
        totalShares: number;
        totalSubscribers: number;
        graphData: any[];
    } | null>(null)

    useEffect(() => {
        fetchPosts()
        fetchSettings()
    }, [])

    useEffect(() => {
        const loadStats = async () => {
            if (!user?.id) return
            // Renamed to 'get_author_overview' to avoid ad-blockers blocking 'stats' keyword
            const { data, error } = await supabase.rpc('get_author_overview', { p_user_id: user.id })

            if (error) {
                console.error('CRITICAL STATS ERROR:', error)
                console.error('Did you run the v34_anti_adblock.sql script in Supabase?')
            }

            if (data) {
                setRealStats(data)
            }
        }
        loadStats()
    }, [user?.id])

    const subdomain = settings?.subdomain || null

    const stats = useMemo(() => {
        const safePosts = posts || []
        return {
            totalPosts: safePosts.length,
            publishedPosts: safePosts.filter(p => p.published).length,
            latestPost: safePosts[0] || null
        }
    }, [posts])

    // Use fetched graph data or fallback to 7-day zero data to ensure graph always renders
    const graphData = useMemo(() => {
        if (realStats?.graphData && realStats.graphData.length > 0) {
            return realStats.graphData
        }
        // Fallback: Last 7 days with 0 data
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (6 - i))
            return {
                name: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                views: 0,

            }
        })
    }, [realStats])

    return (
        <div style={{ paddingBottom: '4rem' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Dashboard</h1>
            </div>

            {/* Overview Section */}
            <section style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Analytics</h2>
                </div>

                {/* Stats & Graph Card */}
                <div style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: 'transparent'
                }}>
                    {/* Top Stats Row */}
                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                        {/* Stat 1: Total Views (Real) */}
                        <div style={{ flex: 1, padding: '1.5rem 0' }}>
                            <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                Total Views
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {(realStats?.totalViews || 0).toLocaleString()}
                            </div>
                        </div>
                        {/* Stat 2: Total Likes (Real) */}


                        {/* Stats removed as per request */}

                        {/* Stat 4: Published (Keep functionality) */}
                        <div style={{ flex: 1, padding: '1.5rem 0' }}>
                            <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                Published Posts
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.publishedPosts}</div>
                        </div>
                    </div>

                    {/* Graph Area */}
                    <div style={{ height: '300px', width: '100%', minWidth: '200px', padding: '1rem 0', background: 'transparent', position: 'relative' }}>
                        {!realStats && postsLoading ? (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                                <WaveLoader size={48} />
                            </div>
                        ) : graphData.length === 0 ? (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                No stats recorded yet
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -45, bottom: 0 }}>
                                    <defs>

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
                                        stroke="var(--accent-secondary)" // Cyan
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorViews)"
                                        style={{ stroke: '#00cbff' }}
                                    />

                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </section>

            {/* Bottom Section: Latest Post */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Latest Post</h2>

                {stats.latestPost ? (
                    <Link
                        to={subdomain ? `/${subdomain}` : "/blog"}
                        style={{
                            display: 'block',
                            marginTop: '1rem',
                            textDecoration: 'none',
                            color: 'inherit',
                            padding: '1.5rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            transition: 'all 0.2s',
                            background: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--text-primary)'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)'
                            e.currentTarget.style.transform = 'translateY(0)'
                        }}
                    >
                        <h3 style={{
                            fontSize: '1.4rem',
                            fontWeight: 700,
                            margin: '0 0 1rem 0',
                            fontFamily: 'var(--font-display)',
                            color: 'var(--text-primary)',
                            lineHeight: 1.2,
                            letterSpacing: '-0.02em'
                        }}>
                            {stats.latestPost.title}
                        </h3>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-secondary)',
                                fontFamily: 'var(--font-mono)'
                            }}>
                                {new Date(stats.latestPost.createdAt).toLocaleDateString('en-US')}
                            </span>

                            <span style={{
                                fontSize: '0.85rem',
                                color: 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontWeight: 500
                            }}>
                                View Post <ArrowRight size={16} />
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
