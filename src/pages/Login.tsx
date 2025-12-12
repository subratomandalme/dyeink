import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import LightRays from '../components/common/LightRays'
import NeumorphismButton from '../components/common/NeumorphismButton'
import GlareHover from '../components/common/GlareHover'

export default function Login() {
    const navigate = useNavigate()
    const { setUser } = useAuthStore()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data, error } = await import('../lib/supabase').then(m =>
                m.supabase.auth.signInWithPassword({
                    email,
                    password,
                })
            )

            if (error) throw error

            if (data.user) {
                navigate('/admin')
            }
        } catch (error) {
            console.error('Login failed:', error)
            alert(`Login failed: ${(error as Error).message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
            {/* Background Animation */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
                <LightRays
                    raysOrigin="top-center"
                    raysColor="#00ffff"
                    raysSpeed={6.0}
                    lightSpread={5.0}
                    rayLength={10.0}
                    followMouse={true}
                    mouseInfluence={0.2}
                    noiseAmount={0.1}
                    distortion={0.1}
                />
            </div>

            <GlareHover
                width="100%"
                height="auto"
                background="var(--bg-secondary)"
                borderColor="var(--border-color)"
                borderRadius="12px" /* Reverting to default card radius */
                glareColor="#ffffff"
                glareOpacity={0.15}
                style={{
                    maxWidth: '320px', /* Reduced width to half as requested */
                    zIndex: 10,
                    display: 'block',
                    padding: '1.5rem'
                }}
                className="animate-fade-in"
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', marginTop: '1.5rem' }}>
                        <img src="/Di.png" alt="Logo" className="logo-adaptive" style={{ height: '60px', width: 'auto' }} />
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                        <NeumorphismButton
                            text={loading ? 'Signing in...' : 'Sign In'}
                            type="submit"
                            style={{ width: '100%', justifyContent: 'center' }}
                            icon={null}
                        />
                    </div>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Don't have an account? <Link to="/register">Create one</Link>
                </p>
            </GlareHover>
        </div>
    )
}
