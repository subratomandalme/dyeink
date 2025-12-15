import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import LightRays from '../../components/common/animations/LightRays'
import NeumorphismButton from '../../components/common/ui/NeumorphismButton'
import GlareHover from '../../components/common/ui/GlareHover'
import { CheckCircle2, Github, Mail, Lock } from 'lucide-react'
import WaveLoader from '../../components/common/feedback/WaveLoader'
import { useToast } from '../../components/common/feedback/Toast'
import { supabase } from '../../lib/supabase'
export default function Register() {
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
        if (password.length < 8) {
            addToast({ type: 'error', message: 'Password must be at least 8 characters' })
            return
        }
        if (!/[A-Z]/.test(password)) {
            addToast({ type: 'error', message: 'Password must contain at least one uppercase letter' })
            return
        }
        if (!/[a-z]/.test(password)) {
            addToast({ type: 'error', message: 'Password must contain at least one lowercase letter' })
            return
        }
        if (!/[0-9]/.test(password)) {
            addToast({ type: 'error', message: 'Password must contain at least one number' })
            return
        }
        setLoading(true)
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            })
            if (error) throw error
            setShowSuccessModal(true)
        } catch (error) {
            console.error('Registration failed:', error)
            addToast({
                type: 'error',
                message: 'Registration failed. Please try again.'
            })
        } finally {
            setLoading(false)
        }
    }
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>

            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
                <LightRays
                    raysOrigin="top-center"
                    raysColor="#ff00ff"
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
                    maxWidth: '360px',
                    zIndex: 10,
                    display: 'block',
                    padding: '2.5rem'
                }}
                className="animate-fade-in"
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', marginTop: '1.5rem' }}>
                        <Link to="/" className="logo-link">
                            <img src="/Di.png" alt="Logo" className="logo-adaptive" width="60" height="60" style={{ height: '60px', width: 'auto' }} />
                        </Link>
                    </div>
                </div>
                <form onSubmit={handleSubmit}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label className="form-label">Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    required
                                    style={{ height: '48px', boxSizing: 'border-box', paddingLeft: '2.75rem', width: '100%', paddingRight: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                    style={{ height: '48px', boxSizing: 'border-box', paddingLeft: '2.75rem', width: '100%', paddingRight: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}

                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label className="form-label">Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                    style={{ height: '48px', boxSizing: 'border-box', paddingLeft: '2.75rem', width: '100%', paddingRight: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                                />
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                        <NeumorphismButton
                            text={loading ? 'Signing Up...' : 'Sign Up'}
                            type="submit"
                            style={{ width: '100%', height: '48px', justifyContent: 'center', fontSize: '1rem', fontWeight: 600 }}
                            icon={loading ? <WaveLoader size={24} /> : null}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                        <button
                            onClick={handleGithubLogin}
                            type="button"
                            className="github-btn"
                        >
                            <Github size={20} />
                            Continue with GitHub
                        </button>
                    </div>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </GlareHover >

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

