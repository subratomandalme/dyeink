import './GradientText.css';

interface GradientTextProps {
    children: React.ReactNode;
    className?: string;
    colors?: string[];
    animationSpeed?: number;
    showBorder?: boolean;
    style?: React.CSSProperties; // Added to support inline styles
}

export default function GradientText({
    children,
    className = '',
    colors = ['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa'],
    animationSpeed = 8,
    showBorder = false,
    style = {}
}: GradientTextProps) {
    const gradientStyle = {
        backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
        animationDuration: `${animationSpeed}s`,
        ...style // Merge passed styles
    };

    return (
        <div className={`animated-gradient-text ${className}`} style={style}> {/* Apply style wrapper */}
            {showBorder && <div className="gradient-overlay" style={gradientStyle}></div>}
            <div className="text-content" style={gradientStyle}>
                {children}
            </div>
        </div>
    );
}
