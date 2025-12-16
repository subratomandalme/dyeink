import { memo, useEffect, useState } from 'react'
import DecryptedText from '../common/animations/DecryptedText'

interface AdminGreetingProps {
    name: string
}

const animatedNames = new Set<string>()

const AdminGreeting = memo(({ name }: AdminGreetingProps) => {
    const displayName = name.split(' ')[0].slice(0, 12)

    const [hasAnimated, setHasAnimated] = useState(() => animatedNames.has(name))

    useEffect(() => {
        if (!hasAnimated) {
            const timer = setTimeout(() => {
                animatedNames.add(name)
                setHasAnimated(true)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [name, hasAnimated])

    useEffect(() => {
        if (!animatedNames.has(name)) {
            setHasAnimated(false)
        }
    }, [name])

    if (hasAnimated) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingLeft: '0.4rem' }}>
                <span style={{
                    fontSize: '1.5rem',
                    color: 'var(--text-secondary)',
                    opacity: 0.8,
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    textShadow: '0 0 25px rgba(255, 255, 255, 0.8)'
                }}>Hi,</span>
                <span style={{
                    fontSize: '1.8rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 700,
                    display: 'block',
                    height: '2.2rem',
                    width: '100%'
                }}>
                    {displayName}
                </span>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingLeft: '0.4rem' }}>
            <span style={{
                fontSize: '1.5rem',
                color: 'var(--text-secondary)',
                opacity: 0.8,
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                textShadow: '0 0 25px rgba(255, 255, 255, 0.8)'
            }}>Hi,</span>
            <span style={{
                fontSize: '1.8rem',
                color: 'var(--text-primary)',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                display: 'block',
                height: '2.2rem',
                width: '100%'
            }}>
                <DecryptedText
                    text={displayName}
                    speed={60}
                    maxIterations={15}
                    animateOn="view"
                    revealDirection="start"
                />
            </span>
        </div>
    )
}, (prevProps, nextProps) => {
    return prevProps.name === nextProps.name
})

export default AdminGreeting
