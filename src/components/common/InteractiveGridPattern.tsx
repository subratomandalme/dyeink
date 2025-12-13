"use client";
import React, { useState } from "react";

interface InteractiveGridPatternProps extends React.SVGProps<SVGSVGElement> {
    width?: number;
    height?: number;
    squares?: [number, number]; // [horizontal, vertical]
}

export function InteractiveGridPattern({
    width = 40,
    height = 40,
    squares = [24, 24],
    style,
    ...props
}: InteractiveGridPatternProps) {
    const [horizontal, vertical] = squares;
    const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);

    return (
        <svg
            width={width * horizontal}
            height={height * vertical}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: '1px solid rgba(156, 163, 175, 0.3)', // border-gray-400/30
                ...style
            }}
            {...props}
        >
            {Array.from({ length: horizontal * vertical }).map((_, index) => {
                const x = (index % horizontal) * width;
                const y = Math.floor(index / horizontal) * height;
                const isHovered = hoveredSquare === index;

                return (
                    <rect
                        key={index}
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        style={{
                            stroke: 'rgba(156, 163, 175, 0.3)', // stroke-gray-400/30
                            fill: isHovered ? 'rgba(209, 213, 219, 0.3)' : 'transparent', // fill-gray-300/30
                            transition: 'all ease-in-out',
                            transitionDuration: isHovered ? '100ms' : '1000ms',
                            cursor: 'crosshair'
                        }}
                        onMouseEnter={() => setHoveredSquare(index)}
                        onMouseLeave={() => setHoveredSquare(null)}
                    />
                );
            })}
        </svg>
    );
}
