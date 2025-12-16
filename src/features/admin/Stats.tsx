import React, { useState } from 'react'
import { BarChart2, Share2 } from 'lucide-react'
import StatsSkeleton from '../../components/admin/skeletons/StatsSkeleton'
import { useAdminStore } from '../../stores/adminStore'
const Stats: React.FC = () => {
    const { posts, postsLoading, stats, statsLoading } = useAdminStore()
    const [activeTab, setActiveTab] = useState('Traffic')
    const tabs = ['Traffic', 'Sharing']

    const safePosts = posts || []
    const showLoader = (postsLoading && !posts) || (statsLoading && !stats)
    const publishedPosts = safePosts.filter(p => p.published).length

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Traffic':
                return (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <StatCard label="Total Views" value={(stats?.totalViews || 0).toLocaleString()} icon={<BarChart2 size={20} />} />
                            <StatCard label="Published" value={publishedPosts.toString()} />
                        </div>
                    </div>
                )

            case 'Sharing':
                return (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <StatCard label="Total Shares" value={(stats?.totalShares || 0).toLocaleString()} icon={<Share2 size={20} />} />
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

            {
                showLoader ? (
                    <StatsSkeleton />
                ) : (
                    <div className="animate-fade-in">
                        {renderTabContent()}
                    </div>
                )
            }

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

