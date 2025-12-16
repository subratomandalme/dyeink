import Skeleton from '../../common/ui/Skeleton'

export default function AdminShellSkeleton() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>

            <div style={{
                width: '280px',
                borderRight: '1px solid var(--border-color)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                '@media (max-width: 1024px)': {
                    display: 'none'
                }
            } as React.CSSProperties}>
                <Skeleton style={{ height: '40px', width: '140px', marginBottom: '2rem' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} style={{ height: '48px', width: '100%', borderRadius: '12px' }} />
                    ))}
                </div>
            </div>


            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                <div style={{
                    height: '80px',
                    borderBottom: '1px solid var(--border-color)',
                    padding: '0 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '1rem'
                }}>
                    <Skeleton style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                </div>


                <div style={{ padding: '3rem' }}>
                    <Skeleton style={{ height: '60px', width: '200px', marginBottom: '2rem' }} />
                    <Skeleton style={{ height: '200px', width: '100%', borderRadius: '12px' }} />
                </div>
            </div>
        </div>
    )
}
