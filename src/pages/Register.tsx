import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import LightRays from '../components/common/LightRays'
import NeumorphismButton from '../components/common/NeumorphismButton'
import GlareHover from '../components/common/GlareHover'
import { CheckCircle2, Github } from 'lucide-react'
import WaveLoader from '../components/common/WaveLoader'
import { useToast } from '../components/common/Toast'

import { supabase } from '../lib/supabase'

export default function Register() {
    // const navigate = useNavigate() // Not used with success modal approach immediately
    const { addToast } = useToast()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    const handleGithubLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: `${window.location.origin}/admin`
                }
            })
            if (error) throw error
        } catch (error: any) {
            console.error('GitHub login error:', error)
            addToast({
                type: 'error',
                message: error.message || 'Failed to login with GitHub'
            })
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            addToast({ type: 'error', message: 'Passwords do not match' })
            return
        }

        setLoading(true)

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            })

            if (error) throw error

            // Show success modal instead of immediate redirect
            setShowSuccessModal(true)


        } catch (error) {
            console.error('Registration failed:', error)
            addToast({
                type: 'error',
                message: (error as Error).message || 'Registration failed'
            })
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
                    raysColor="#ff00ff" // Changed raysColor
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
                    maxWidth: '360px', // Changed maxWidth
                    zIndex: 10,
                    display: 'block',
                    padding: '2.5rem' // Changed padding
                }}
                className="animate-fade-in"
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', marginTop: '1.5rem' }}>
                        <img src="/Di.png" alt="Logo" className="logo-adaptive" style={{ height: '60px', width: 'auto' }} />
                    </div>
                </div>

                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button
                        onClick={handleGithubLogin}
                        type="button"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Github size={20} />
                        Continue with GitHub
                    </button>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <div style={{ height: '1px', flex: 1, background: 'var(--border-color)' }}></div>
                        OR
                        <div style={{ height: '1px', flex: 1, background: 'var(--border-color)' }}></div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>

                    {/* Removed Name field */}

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
                            placeholder="••••••••" // Changed placeholder
                            required
                            minLength={6} // Changed minLength
                        />
                    </div>

                    {/* Added Confirm Password field */}
                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                        <NeumorphismButton
                            text={loading ? 'Creating Account...' : 'Sign Up'} // Changed button text
                            type="submit"
                            style={{ width: '100%', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}
                            icon={loading ? <WaveLoader size={24} /> : null}
                        />
                    </div>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </GlareHover >

        {/* Success Modal */ }
    {
        showSuccessModal && (
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1rem'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '400px',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    animation: 'fadeIn 0.2s ease-out',
                    textAlign: 'center'
                }}>
                    <div style={{ color: '#22c55e', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Account created!</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                        Please check your email for verification instructions (if enabled) or log in to continue.
                    </p>
                    <Link
                        to="/login"
                        className="btn btn-primary"
                        style={{ display: 'flex', justifyContent: 'center', width: '100%', textDecoration: 'none' }}
                    >
                        Sign In Now
                    </Link>
                </div>
            </div>
        )
    }
        </div >
    )
}
