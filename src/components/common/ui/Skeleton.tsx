import './Skeleton.css'

type SkeletonProps = {
    className?: string
    style?: React.CSSProperties
}

export default function Skeleton({ className = "", style }: SkeletonProps) {
    return (
        <div
            className={`skeleton ${className}`}
            style={style}
            aria-hidden="true"
        />
    )
}
