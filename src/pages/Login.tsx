import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import LightRays from '../components/common/LightRays'
import NeumorphismButton from '../components/common/NeumorphismButton'
import GlareHover from '../components/common/GlareHover'
import { Mail, Lock, CheckCircle2, Github } from 'lucide-react'
import WaveLoader from '../components/common/WaveLoader'
import { useToast } from '../components/common/Toast'

import { supabase } from '../lib/supabase'

export default function Login() {
    const navigate = useNavigate()
    const { addToast } = useToast()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    // Forgot Password Modal State
    const [showForgotModal, setShowForgotModal] = useState(false)
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotLoading, setForgotLoading] = useState(false)
    const [forgotSuccess, setForgotSuccess] = useState(false)

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

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            if (data.user) {
                navigate('/admin')
            }
        } catch (error: any) {
            console.error('Login failed:', error)
            addToast({
                type: 'error',
                message: error.message || 'Invalid email or password'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPassword = async (e: FormEvent) => {
        e.preventDefault()
        setForgotLoading(true)
        try {
            // "Login by that OTP" - Magic Link Flow
            const { error } = await supabase.auth.signInWithOtp({
                email: forgotEmail,
                options: {
                    emailRedirectTo: `${window.location.origin}/admin/settings?tab=Security`,
                    shouldCreateUser: false // Ensure we don't sign up new users
                }
            })

            if (error) throw error
            setForgotSuccess(true)
        } catch (error: any) {
            console.error('Forgot password error:', error)
            addToast({
                type: 'error',
                message: error.message || 'Failed to send login link'
            })
        } finally {
            setForgotLoading(false)
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
                borderRadius="16px"
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
                        <img src="/Di.png" alt="Logo" className="logo-adaptive" style={{ height: '60px', width: 'auto' }} />
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
                            padding: '0.875rem',
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


                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label className="form-label">Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ paddingLeft: '2.75rem', width: '100%', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingLeft: '2.75rem', width: '100%', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                                placeholder="••••••••"
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.25rem' }}>
                            <button
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                Forgot password?
                            </button>
                        </div>
                    </div>

                    <NeumorphismButton
                        text={loading ? 'Signing in...' : 'Sign In'}
                        type="submit"
                        style={{ width: '100%', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}
                        icon={loading ? <WaveLoader size={24} /> : null}
                    />
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Create one</Link>
                </p>
            </GlareHover>


            {/* Forgot Password Modal */}
            {showForgotModal && (
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
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Reset Password</h2>
                            <button
                                onClick={() => {
                                    setShowForgotModal(false)
                                    setForgotSuccess(false)
                                    setForgotEmail('')
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.25rem' }}
                            >
                                ✕
                            </button>
                        </div>

                        {forgotSuccess ? (
                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                <div style={{ color: '#22c55e', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                                    <CheckCircle2 size={48} />
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Check your email</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                                    We've sent a login link to <strong>{forgotEmail}</strong>.<br />
                                    Click it to login and update your password.
                                </p>
                                <button
                                    onClick={() => {
                                        setShowForgotModal(false)
                                        setForgotSuccess(false)
                                        setForgotEmail('')
                                    }}
                                    className="btn btn-secondary"
                                    style={{ marginTop: '1.5rem', width: '100%' }}
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                                    Enter your email address to receive a login link. You can change your password in settings after logging in.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        autoFocus
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={forgotLoading}
                                    className="btn btn-primary"
                                    style={{ width: '100%' }}
                                >
                                    {forgotLoading ? <WaveLoader size={24} /> : 'Send Login Link'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
