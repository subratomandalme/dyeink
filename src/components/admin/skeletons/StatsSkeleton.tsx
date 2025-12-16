import Skeleton from '../../common/ui/Skeleton'

export default function StatsSkeleton() {
    return (
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Skeleton style={{ height: '40px', width: '150px' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <Skeleton style={{ height: '16px', width: '80px', marginBottom: '0.75rem' }} />
                        <Skeleton style={{ height: '28px', width: '120px' }} />
                    </div>
                ))}
            </div>

            <div style={{ height: '450px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
                <Skeleton style={{ height: '30px', width: '200px', marginBottom: '2rem' }} />
                <Skeleton style={{ height: '350px', width: '100%' }} />
            </div>
        </div>
    )
}
