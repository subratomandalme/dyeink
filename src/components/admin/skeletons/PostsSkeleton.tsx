import Skeleton from '../../common/ui/Skeleton'

export default function PostsSkeleton() {
    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Skeleton style={{ height: '40px', width: '150px' }} />
                <Skeleton style={{ height: '40px', width: '100px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(200px, 1fr) 100px 80px',
                        gap: '1rem',
                        padding: '1.5rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        alignItems: 'center'
                    }}>
                        <div>
                            <Skeleton style={{ height: '20px', width: '70%', marginBottom: '0.5rem' }} />
                            <Skeleton style={{ height: '14px', width: '40%' }} />
                        </div>
                        <Skeleton style={{ height: '20px', width: '80px' }} />
                        <Skeleton style={{ height: '32px', width: '32px', borderRadius: '50%' }} />
                    </div>
                ))}
            </div>
        </div>
    )
}
