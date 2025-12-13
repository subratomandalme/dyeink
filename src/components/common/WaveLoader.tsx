


interface WaveLoaderProps {
    size?: number;
    color?: string; // Prepared for future, though complex to implement with current CSS
}

export default function WaveLoader({ size }: WaveLoaderProps) {
    const baseSize = 220
    const currentSize = size || baseSize
    const scale = currentSize / baseSize

    const renderBars = () => (
        Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="wave-loader-bar"></div>
        ))
    )

    return (
        <div className="wave-loader-wrapper" style={{ width: `${currentSize}px`, height: `${currentSize}px` }}>
            <div className="wave-loader-container" style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: `${baseSize}px`,
                height: `${baseSize}px`
            }}>
                <div className="wave-loader-wave">
                    {renderBars()}
                </div>
                <div data-level="1" className="wave-loader-wave">
                    {renderBars()}
                </div>
                <div data-level="2" className="wave-loader-wave">
                    {renderBars()}
                </div>
                <div data-level="3" className="wave-loader-wave">
                    {renderBars()}
                </div>
            </div>
            <style>{`
                .wave-loader-wrapper {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden; /* Ensure no spillover */
                }

                .wave-loader-container {
                    padding: 0;
                    margin: 0;
                    box-sizing: border-box;
                    position: relative;
                    border-radius: 50%;
                    overflow: hidden;
                }

                .wave-loader-wave {
                    padding: 0;
                    margin: 0 auto;
                    box-sizing: border-box;
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: flex-end;
                }

                .wave-loader-wave:nth-child(1) .wave-loader-bar {
                    padding: 0;
                    margin: 0 auto;
                    box-sizing: border-box;
                    width: 2px;
                    height: 220px;
                    background-color: #ccc;
                }

                .wave-loader-wave:nth-child(n + 2) .wave-loader-bar {
                    padding: 0;
                    margin: 0 auto;
                    box-sizing: border-box;
                    -webkit-animation:
                        barHeight 3.9s infinite ease-in-out alternate,
                        barSkew 3.9s infinite ease-in-out alternate;
                    animation:
                        barHeight 3.9s infinite ease-in-out alternate,
                        barSkew 3.9s infinite ease-in-out alternate;
                }

                /* Animation Delays */
                ${Array.from({ length: 24 }).map((_, i) => `
                    .wave-loader-wave .wave-loader-bar:nth-child(${i + 1}) {
                        -webkit-animation-delay: calc(var(--f) * ${i}), calc(var(--f) * ${i} - 1.95s);
                        animation-delay: calc(var(--f) * ${i}), calc(var(--f) * ${i} - 1.95s);
                    }
                `).join('')}

                .wave-loader-wave[data-level="1"] .wave-loader-bar {
                    width: 11px;
                    background-color: #fff;
                    --f: -0.24375s;
                    --h: 40px;
                }

                .wave-loader-wave[data-level="2"] .wave-loader-bar {
                    width: 8px;
                    background-color: #eee;
                    --f: -0.4875s;
                    --h: 100px;
                }

                .wave-loader-wave[data-level="3"] .wave-loader-bar {
                    width: 5px;
                    background-color: #ddd;
                    --f: -0.325s;
                    --h: 120px;
                }

                @-webkit-keyframes barHeight {
                    from { height: var(--h); }
                    to { height: calc(var(--h) + 50px); }
                }

                @keyframes barHeight {
                    from { height: var(--h); }
                    to { height: calc(var(--h) + 50px); }
                }

                @-webkit-keyframes barSkew {
                    from { transform: skewY(30deg); }
                    to { transform: skewY(-30deg); }
                }

                @keyframes barSkew {
                    from { transform: skewY(30deg); }
                    to { transform: skewY(-30deg); }
                }
            `}</style>
        </div>
    )
}
