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
import { format } from 'date-fns'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAdminStore } from '../../stores/adminStore'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import WaveLoader from '../../components/common/feedback/WaveLoader'
export default function Dashboard() {
    const { posts, settings, fetchPosts, fetchSettings, postsLoading } = useAdminStore()
    const { user } = useAuthStore()
    const [realStats, setRealStats] = useState<{
        totalViews: number;
        totalShares: number;
        graphData: any[];
    } | null>(null)
    useEffect(() => {
        fetchPosts()
        fetchSettings()
    }, [])
    const loadStats = useCallback(async () => {
        if (!user?.id) return
        try {
            const { data: userPosts, error: postsErr } = await supabase
                .from('posts')
                .select('id, views, shares, created_at')
                .eq('user_id', user.id)
            if (postsErr) throw postsErr
            const totalViews = userPosts?.reduce((acc, p) => acc + (p.views || 0), 0) || 0
            const totalShares = userPosts?.reduce((acc, p) => acc + (p.shares || 0), 0) || 0
            const postIds = userPosts?.map(p => p.id) || []

            const last7Days: any[] = []
            for (let i = 6; i >= 0; i--) {
                const d = new Date()
                d.setDate(d.getDate() - i)
                const dateKey = format(d, 'yyyy-MM-dd')
                last7Days.push({
                    date: dateKey,
                    name: format(d, 'MMM d'),
                    views: 0,
                    shares: 0,
                    published: 0
                })
            }
            const queryDate = last7Days[0].date
            const mergedGraphData = [...last7Days]
            if (userPosts) {
                userPosts.forEach(p => {
                    if (p.created_at) {
                        const dateKey = format(new Date(p.created_at), 'yyyy-MM-dd')
                        const entry = mergedGraphData.find(d => d.date === dateKey)
                        if (entry) {
                            entry.published += 1
                        }
                    }
                })
            }
            if (postIds.length > 0) {
                const { data: daily, error: dailyErr } = await supabase
                    .from('daily_post_stats')
                    .select('date, views, shares')
                    .in('post_id', postIds)
                    .gte('date', queryDate)
                if (dailyErr) console.error('Daily Stats Fetch Error:', dailyErr)
                if (daily) {
                    daily.forEach(record => {
                        const dayEntry = mergedGraphData.find(d => d.date === record.date)
                        if (dayEntry) {
                            dayEntry.views += (record.views || 0)
                            dayEntry.shares += (record.shares || 0)
                        }
                    })
                }
            }
            setRealStats({
                totalViews,
                totalShares,
                graphData: mergedGraphData
            })
        } catch (err) {
            console.error('STATS FETCH ERROR:', err)
        }
    }, [user?.id])
    useEffect(() => {
        loadStats()
        const channel = supabase
            .channel('dashboard-stats-v62')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'posts' },
                () => {
                    loadStats()
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'daily_post_stats' },
                () => {
                    loadStats()
                }
            )
            .subscribe()
        return () => {
            supabase.removeChannel(channel)
        }
    }, [loadStats])
    const subdomain = settings?.subdomain || null
    const stats = useMemo(() => {
        const safePosts = posts || []
        return {
            totalPosts: safePosts.length,
            publishedPosts: safePosts.filter(p => p.published).length,
            latestPost: safePosts[0] || null
        }
    }, [posts])
    const graphData = useMemo(() => {
        let rawData: any[] = []
        if (realStats?.graphData && realStats.graphData.length > 0) {
            rawData = [...realStats.graphData]
        } else {
            rawData = Array.from({ length: 7 }, (_, i) => {
                const d = new Date()
                d.setDate(d.getDate() - (6 - i))
                return {
                    name: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    date: format(d, 'yyyy-MM-dd'),
                    views: 0,
                    shares: 0,
                    published: 0
                }
            })
        }
        return rawData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }, [realStats])
    return (
        <div style={{ paddingBottom: '4rem' }}>
            { }
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Dashboard</h1>
            </div>
            { }
            <section style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Analytics</h2>
                </div>
                { }
                <div style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: 'transparent'
                }}>
                    { }
                    <div className="dashboard-stats-row" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                        { }
                        <div style={{ flex: 1, padding: '1.5rem 0' }}>
                            <div className="stat-label" style={{ marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Total Views
                            </div>
                            <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {(realStats?.totalViews || 0).toLocaleString()}
                            </div>
                        </div>
                        { }
                        <div style={{ flex: 1, padding: '1.5rem 0' }}>
                            <div className="stat-label" style={{ marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Total Shares
                            </div>
                            <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {(realStats?.totalShares || 0).toLocaleString()}
                            </div>
                        </div>
                        { }

                        <div style={{ flex: 1, padding: '1.5rem 0' }}>
                            <div className="stat-label" style={{ marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Published Posts
                            </div>
                            <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.publishedPosts}</div>
                        </div>
                    </div>
                    { }
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
                            <ResponsiveContainer width="100%" height="100%" debounce={200}>
                                <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -45, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="dash_grad_views_v58" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00cbff" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#00cbff" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="dash_grad_pub_v58" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
                                        domain={[0, 'auto']}
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
                                        dataKey="published"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#dash_grad_pub_v58)"
                                        style={{ stroke: '#8b5cf6' }}
                                        isAnimationActive={false}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="views"
                                        stroke="var(--accent-secondary)"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#dash_grad_views_v58)"
                                        style={{ stroke: '#00cbff' }}
                                        isAnimationActive={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </section>
            { }
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
            { }
            <style>{`
                @media (max-width: 499px) {
                    .dashboard-stats-row {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        gap: 1rem !important;
                    }
                    .dashboard-stats-row > div {
                        padding: 0.5rem 0 !important;
                    }
                    .dashboard-stats-row .stat-label {
                        font-size: 0.8rem !important;
                        white-space: nowrap !important;
                    }
                    .dashboard-stats-row .stat-value {
                        font-size: 1.75rem !important;
                    }
                }
            `}</style>
        </div>
    )
}

