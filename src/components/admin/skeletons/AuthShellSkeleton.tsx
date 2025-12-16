import Skeleton from '../../common/ui/Skeleton'

export default function AuthShellSkeleton() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            padding: '1rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                padding: '2rem',
                background: 'var(--bg-secondary)',
                borderRadius: '24px',
                border: '1px solid var(--border-color)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <Skeleton style={{ width: '60px', height: '60px', borderRadius: '16px' }} />
                </div>

                <Skeleton style={{ height: '32px', width: '60%', margin: '0 auto 2rem auto' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Skeleton style={{ height: '56px', width: '100%', borderRadius: '12px' }} />
                    <Skeleton style={{ height: '56px', width: '100%', borderRadius: '12px' }} />
                    <Skeleton style={{ height: '56px', width: '100%', borderRadius: '12px' }} />
                </div>
            </div>
        </div>
    )
}
