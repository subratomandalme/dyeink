import React from 'react'

interface CircularLoaderProps {
    size?: number
    className?: string
    style?: React.CSSProperties
}

export default function CircularLoader({ size = 20, className = '', style = {} }: CircularLoaderProps) {
    return (
        <div
            className={className}
            style={{
                width: size,
                height: size,
                border: '2px solid rgba(128, 128, 128, 0.1)',
                borderTopColor: 'currentColor',
                borderRadius: '50%',
                animation: 'circular-spin 0.6s linear infinite',
                display: 'inline-block',
                ...style
            }}
        >
            <style>{`
                @keyframes circular-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
