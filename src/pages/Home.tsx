import { Link } from 'react-router-dom'
import { useAuthStore } from '../store'
import ScrollReveal from '../components/common/ScrollReveal'

export default function Home() {
    const { isAuthenticated } = useAuthStore()

    return (
        <div style={{ minHeight: '100vh', position: 'relative' }}>
            {/* Navigation */}
            <nav style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                padding: '1.5rem 3rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 100,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)'
            }}>
                <Link to="/" className="logo-link">
                    <img src="/Di.png" alt="Dyeink" className="logo-adaptive" style={{ height: '40px', width: 'auto' }} />
                </Link>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    {isAuthenticated ? (
                        <Link to="/admin" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost">Sign In</Link>
                            <Link to="/register" className="btn btn-primary">Get Early Access</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '8rem 2rem 4rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <h1 style={{
                    fontSize: 'clamp(3rem, 10vw, 7rem)',
                    fontWeight: 800,
                    color: '#ffffff',
                    marginBottom: '0.5rem',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    textShadow: '0 0 80px rgba(255,255,255,0.3)'
                }}>
                    Dyeink
                </h1>
                <p style={{
                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                    fontWeight: 300,
                    color: 'rgba(255,255,255,0.9)',
                    marginBottom: '2rem',
                    fontStyle: 'italic',
                    letterSpacing: '0.02em'
                }}>
                    Where Ideas Stain
                </p>
                <p style={{
                    fontSize: '1.25rem',
                    color: 'rgba(255,255,255,0.7)',
                    maxWidth: '700px',
                    lineHeight: 1.8,
                    marginBottom: '3rem'
                }}>
                    Most writing fades. Dyeink is for thoughts that soak in—words that don't just sit on the page, but become part of the fabric of what we know.
                </p>
                {!isAuthenticated && (
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Link to="/register" className="btn btn-primary" style={{
                            padding: '1rem 2.5rem',
                            fontSize: '1.1rem'
                        }}>
                            Get Early Access
                        </Link>
                        <Link to="/login" className="btn btn-ghost" style={{
                            padding: '1rem 2.5rem',
                            fontSize: '1.1rem',
                            border: '1px solid rgba(255,255,255,0.3)'
                        }}>
                            See How It Works
                        </Link>
                    </div>
                )}

                {/* Scroll indicator */}
                <div style={{
                    position: 'absolute',
                    bottom: '3rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: 0.5
                }}>
                    <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff' }}>Scroll</span>
                    <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, #fff, transparent)' }} />
                </div>
            </section>

            {/* Why Dyeink Section */}
            <section style={{
                padding: '8rem 2rem',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <h2 style={{
                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '4rem',
                    textAlign: 'center',
                    letterSpacing: '-0.02em'
                }}>
                    Why Dyeink?
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {/* Feature 1 */}
                    <div style={{
                        padding: '2.5rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✦</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#ffffff', marginBottom: '1rem' }}>
                            Write with permanence
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                            Publish with the weight of ink that bonds, not pencil that erases.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div style={{
                        padding: '2.5rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>◇</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#ffffff', marginBottom: '1rem' }}>
                            Craft your space
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                            Clean, distraction-free editor that disappears when you need it to.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div style={{
                        padding: '2.5rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>○</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#ffffff', marginBottom: '1rem' }}>
                            Find your readers
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                            Built-in discovery for voices worth hearing.
                        </p>
                    </div>
                </div>
            </section>

            {/* For Thinkers Section */}
            <section style={{
                padding: '8rem 2rem',
                textAlign: 'center',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                        fontWeight: 600,
                        color: '#ffffff',
                        marginBottom: '1.5rem',
                        letterSpacing: '-0.01em'
                    }}>
                        For Thinkers Who Leave Marks
                    </h2>
                    <ScrollReveal
                        baseOpacity={0}
                        enableBlur={true}
                        baseRotation={3}
                        blurStrength={8}
                    >
                        Join writers who aren't just filling space—they're changing minds. From sharp commentary to quiet revelations, this is where your ideas find their staying power.
                    </ScrollReveal>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                        <p style={{ fontSize: '1.5rem', fontWeight: 500, color: '#ffffff' }}>
                            Start writing that matters.
                        </p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>
                            Start writing that lasts.
                        </p>
                    </div>
                </div>
            </section>

            {/* The Dyeink Difference */}
            <section style={{
                padding: '8rem 2rem',
                maxWidth: '900px',
                margin: '0 auto',
                textAlign: 'center'
            }}>
                <h2 style={{
                    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                    fontWeight: 600,
                    color: '#ffffff',
                    marginBottom: '1.5rem'
                }}>
                    The Dyeink Difference
                </h2>
                <ScrollReveal
                    baseOpacity={0}
                    enableBlur={true}
                    baseRotation={5}
                    blurStrength={10}
                >
                    Traditional blogging platforms treat words as decoration. We treat them as dye—meant to penetrate, to alter, to remain.
                </ScrollReveal>
            </section>

            {/* Testimonials */}
            <section style={{
                padding: '6rem 2rem',
                borderTop: '1px solid rgba(255,255,255,0.06)'
            }}>
                <h3 style={{
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.4)',
                    marginBottom: '3rem'
                }}>
                    What Writers Are Saying
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem',
                    maxWidth: '900px',
                    margin: '0 auto'
                }}>
                    <blockquote style={{
                        padding: '2rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        margin: 0
                    }}>
                        <p style={{
                            fontSize: '1.1rem',
                            color: 'rgba(255,255,255,0.8)',
                            lineHeight: 1.7,
                            fontStyle: 'italic'
                        }}>
                            "Finally, a platform that understands some thoughts aren't disposable"
                        </p>
                    </blockquote>
                    <blockquote style={{
                        padding: '2rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        margin: 0
                    }}>
                        <p style={{
                            fontSize: '1.1rem',
                            color: 'rgba(255,255,255,0.8)',
                            lineHeight: 1.7,
                            fontStyle: 'italic'
                        }}>
                            "My words found their home here"
                        </p>
                    </blockquote>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                padding: '8rem 2rem',
                textAlign: 'center',
                background: 'linear-gradient(to top, rgba(255,255,255,0.02) 0%, transparent 100%)'
            }}>
                <h2 style={{
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '1rem'
                }}>
                    Ready to make your mark?
                </h2>
                <p style={{
                    fontSize: '1.2rem',
                    color: 'rgba(255,255,255,0.6)',
                    marginBottom: '2.5rem'
                }}>
                    Early access begins soon. Reserve your username now.
                </p>
                {!isAuthenticated && (
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register" className="btn btn-primary" style={{
                            padding: '1.25rem 3rem',
                            fontSize: '1.1rem'
                        }}>
                            Get Early Access
                        </Link>
                        <Link to="/login" className="btn btn-ghost" style={{
                            padding: '1.25rem 3rem',
                            fontSize: '1.1rem',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            See How It Works
                        </Link>
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                borderTop: '1px solid rgba(255,255,255,0.06)'
            }}>
                <p style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '0.5rem'
                }}>
                    Dyeink
                </p>
                <p style={{
                    fontSize: '1rem',
                    color: 'rgba(255,255,255,0.4)',
                    fontStyle: 'italic'
                }}>
                    For ideas that leave a stain on the world.
                </p>
                <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(255,255,255,0.3)',
                    marginTop: '3rem'
                }}>
                    © 2025 Dyeink. All rights reserved.
                </p>
            </footer>
        </div>
    )
}
