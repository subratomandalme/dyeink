import React, { useState, useEffect } from 'react'
import { BarChart2, Users, Share2 } from 'lucide-react'
import WaveLoader from '../../components/common/feedback/WaveLoader'
import { useAdminStore } from '../../stores/adminStore'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
const Stats: React.FC = () => {
    const { posts, fetchPosts, postsLoading } = useAdminStore()
    const { user } = useAuthStore()
    const [activeTab, setActiveTab] = useState('Traffic')
    const [realStats, setRealStats] = useState<any>(null)
    const tabs = ['Traffic', 'Audience', 'Sharing']
    useEffect(() => {
        fetchPosts()
    }, [])
    useEffect(() => {
        const loadStats = async () => {
            if (!user?.id) return
            try {
                const { data: userPosts, error: postsErr } = await supabase
                    .from('posts')
                    .select('id, views, shares')
                    .eq('user_id', user.id)
                if (postsErr) throw postsErr
                const totalViews = userPosts?.reduce((acc, p) => acc + (p.views || 0), 0) || 0
                const totalShares = userPosts?.reduce((acc, p) => acc + (p.shares || 0), 0) || 0
                const { count: subCount } = await supabase
                    .from('subscribers')
                    .select('*', { count: 'exact', head: true })
                setRealStats({
                    totalViews,
                    totalShares,
                    totalSubscribers: subCount || 0
                })
            } catch (err) {
                console.error('Stats Page Error:', err)
            }
        }
        loadStats()
    }, [user?.id])
    const safePosts = posts || []
    const showLoader = postsLoading && !posts
    const publishedPosts = safePosts.filter(p => p.published).length
    const renderTabContent = () => {
        switch (activeTab) {
            case 'Traffic':
                return (
                    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <StatCard label="Total Views" value={(realStats?.totalViews || 0).toLocaleString()} icon={<BarChart2 size={20} />} />
                            <StatCard label="Posts Published" value={publishedPosts.toString()} />
                            {}
                        </div>
                    </div>
                )
            case 'Audience':
                return (
                    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <StatCard label="Total Subscribers" value={(realStats?.totalSubscribers || 0).toLocaleString()} icon={<Users size={20} />} />
                        </div>
                    </div>
                )
            case 'Sharing':
                return (
                    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <StatCard label="Total Shares" value={(realStats?.totalShares || 0).toLocaleString()} icon={<Share2 size={20} />} />
                        </div>
                    </div>
                )
            default:
                return null
        }
    }
    return (
        <div className="stats-page" style={{ padding: '0', color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Stats</h1>
            </div>
            {}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', paddingBottom: '0' }}>
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '0.75rem 1rem',
                            color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: activeTab === tab ? 600 : 400,
                            cursor: 'pointer',
                            borderBottom: activeTab === tab ? '2px solid var(--text-primary)' : '2px solid transparent',
                            marginBottom: '-1px', 
                            transition: 'all 0.2s',
                            fontSize: '0.95rem'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            {}
            {
                showLoader ? (
                    <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <WaveLoader />
                    </div>
                ) : (
                    renderTabContent()
                )
            }
            <style>{`
@keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
}
@media (max-width: 499px) {
    .stats-page > div:first-child {
        margin-bottom: 0.5rem !important;
    }
    .stats-page h1 {
        font-size: 1.75rem !important;
    }
    .stats-page > div:nth-child(2) {
        margin-bottom: 0.75rem !important;
    }
    .stats-page .stat-card {
        padding: 0.5rem 0 !important;
    }
    .stats-page .stat-card .label {
        font-size: 0.8rem !important;
    }
    .stats-page .stat-card .value {
        font-size: 1.75rem !important;
    }
}
`}</style>
        </div >
    )
}
function StatCard({ label, value, subValue, icon }: { label: string, value: string, subValue?: string, icon?: React.ReactNode }) {
    return (
        <div style={{
            padding: '1.5rem 0', 
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {icon && <span style={{ opacity: 0.7 }}>{icon}</span>}
                {label}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {value}
            </div>
            {subValue && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {subValue}
                </div>
            )}
        </div>
    )
}
export default Stats
 
