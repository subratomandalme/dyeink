import React from 'react'
import { Loader2 } from 'lucide-react'

interface CircularLoaderProps {
    size?: number
    className?: string
    style?: React.CSSProperties
}

export default function CircularLoader({ size = 20, className = '', style = {} }: CircularLoaderProps) {
    return (
        <Loader2
            className={`animate-spin ${className}`}
            size={size}
            style={{ ...style }}
        />
    )
}
