import Skeleton from '../../common/ui/Skeleton'

export default function SettingsSkeleton() {
    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Skeleton style={{ height: '40px', width: '180px', marginBottom: '2rem' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <Skeleton style={{ height: '24px', width: '120px', marginBottom: '1.5rem' }} />
                    <Skeleton style={{ height: '40px', width: '100%', marginBottom: '1rem' }} />
                    <Skeleton style={{ height: '40px', width: '100%', marginBottom: '1rem' }} />
                    <Skeleton style={{ height: '100px', width: '100%' }} />
                </div>

                <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <Skeleton style={{ height: '24px', width: '150px', marginBottom: '1.5rem' }} />
                    <Skeleton style={{ height: '40px', width: '100%', marginBottom: '1rem' }} />
                    <Skeleton style={{ height: '40px', width: '60%' }} />
                </div>
            </div>
        </div>
    )
}
