import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { settingsService } from '../services/settingsService'
import LightRays from '../components/common/LightRays'
import NeumorphismButton from '../components/common/NeumorphismButton'
import GlareHover from '../components/common/GlareHover'

export default function Register() {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data, error } = await import('../lib/supabase').then(m =>
                m.supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: name
                        }
                    }
                })
            )

            if (error) throw error

            if (data.user) {
                // Attempt to seed settings with the provided name
                if (data.session) {
                    try {
                        await settingsService.saveSettings({
                            siteName: name,
                            siteDescription: `${name}'s Blog`,
                            customDomain: null,
                            subdomain: null
                        })
                    } catch (err) {
                        console.error("Failed to seed initial settings:", err)
                    }
                }

                alert('Account created! Please check your email for verification (if enabled) or log in.')
                navigate('/login')
            }
        } catch (error) {
            console.error('Registration failed:', error)
            alert(`Registration failed: ${(error as Error).message}`)
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
                borderRadius="12px"
                glareColor="#ffffff"
                glareOpacity={0.15}
                style={{
                    maxWidth: '320px',
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
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            required
                            minLength={2}
                        />
                    </div>

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
                            placeholder="At least 8 characters"
                            required
                            minLength={8}
                        />
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                        <NeumorphismButton
                            text={loading ? 'Creating account...' : 'Create Account'}
                            type="submit"
                            style={{ width: '100%', justifyContent: 'center' }}
                            icon={null}
                        />
                    </div>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </GlareHover>
        </div>
    )
}
