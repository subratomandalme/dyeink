import { Link } from 'react-router-dom'
import { useThemeStore } from '../../../stores/themeStore'

export default function NewPostButton() {
    const { theme } = useThemeStore()

    return (
        <div className="new-post-btn" style={{ padding: '0 1.25rem 1.5rem 1.25rem', display: 'flex', justifyContent: 'center' }}>
            <Link to="/admin/posts/new" className="magic-button">
                <span className="magic-text">New Post</span>
            </Link>

            <style>{`
                .magic-button {
                    position: relative;
                    display: inline-flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    padding: 0.85rem 1.5rem;
                    border-radius: 9999px;
                    text-decoration: none;
                    font-weight: 600;
                    color: white;
                    overflow: hidden;
                    background: transparent;
                    isolation: isolate;
                    transform: translateZ(0); /* Fix for Safari clipping */
                    transition: transform 0.2s ease;
                    box-shadow: 0 0 10px rgba(168, 85, 247, 0.2); /* Subtle glow */
                }

                .magic-button:hover {
                    transform: scale(1.02);
                    box-shadow: 0 0 20px rgba(168, 85, 247, 0.5); /* Stronger glow on hover */
                }
                
                .magic-button:active {
                    transform: scale(0.98);
                }

                /* The rotating gradient border */
                .magic-button::before {
                    content: "";
                    position: absolute;
                    top: -150%;
                    left: -150%;
                    width: 400%;
                    height: 400%;
                    background: conic-gradient(
                        from 0deg,
                        transparent 0deg,
                        #a855f7 40deg,
                        #ec4899 100deg,
                        transparent 160deg,
                        transparent 360deg
                    );
                    animation: rotate 4s linear infinite;
                    z-index: -2;
                    filter: blur(20px); /* Smooth out the gradient */
                }

                /* The inner background to cover the center */
                .magic-button::after {
                    content: "";
                    position: absolute;
                    inset: 3px; /* Slightly thicker border visual */
                    background: ${theme === 'dark' ? '#0f0f0f' : '#ffffff'};
                    border-radius: 9999px;
                    z-index: -1;
                    transition: opacity 0.4s ease; /* Smoother fade */
                }

                /* Light mode specific override for text if needed */
                ${theme !== 'dark' ? `
                    .magic-text {
                        background: none;
                        color: #0f172a;
                    }
                    .magic-button::after {
                        background: #f8fafc;
                    }
                ` : ''}

                /* Reveal full gradient on hover */
                .magic-button:hover::after {
                    opacity: 0;
                }
                
                /* Ensure text is white and clean on full gradient */
                .magic-button:hover .magic-text {
                    color: #ffffff;
                    background: none;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                }

                /* Text color adjustments */
                .magic-text {
                    background: linear-gradient(to right, #fff, #e2e8f0);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: ${theme === 'dark' ? 'transparent' : '#1e293b'};
                    z-index: 10;
                    position: relative;
                    font-size: 1rem;
                    letter-spacing: 0.02em;
                    transition: color 0.3s ease;
                }

                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
