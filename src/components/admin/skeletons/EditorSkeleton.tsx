import Skeleton from '../../common/ui/Skeleton'

export default function EditorSkeleton() {
    return (
        <div className="animate-fade-in" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>

            <nav style={{
                borderBottom: '1px solid var(--border-color)',
                padding: '0.75rem 1.5rem',
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                height: '65px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Skeleton style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Skeleton style={{ width: '24px', height: '24px' }} />
                    <Skeleton style={{ width: '24px', height: '24px' }} />
                    <Skeleton style={{ width: '24px', height: '24px' }} />
                    <Skeleton style={{ width: '24px', height: '24px' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Skeleton style={{ width: '100px', height: '40px', borderRadius: '50px' }} />
                </div>
            </nav>


            <div style={{ maxWidth: '720px', width: '100%', margin: '0 auto', padding: '5rem 1.5rem 3rem 1.5rem' }}>
                <Skeleton style={{ height: '60px', width: '70%', marginBottom: '2rem' }} />
                <Skeleton style={{ height: '20px', width: '100%', marginBottom: '1rem' }} />
                <Skeleton style={{ height: '20px', width: '90%', marginBottom: '1rem' }} />
                <Skeleton style={{ height: '20px', width: '95%', marginBottom: '1rem' }} />
                <Skeleton style={{ height: '20px', width: '80%', marginBottom: '1rem' }} />
                <Skeleton style={{ height: '20px', width: '85%', marginBottom: '1rem' }} />
            </div>
        </div>
    )
}
