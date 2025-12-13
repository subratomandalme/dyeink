import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LightRays from '../components/common/LightRays'
import NeumorphismButton from '../components/common/NeumorphismButton'
import GlareHover from '../components/common/GlareHover'
import { Mail, Lock, Loader2, CheckCircle2 } from 'lucide-react' // Added CheckCircle2 here

import { supabase } from '../lib/supabase'

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
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
                    <div style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        position: 'relative' // For modal positioning context if needed, though fixed is better
                    }}>
                    {/* Background removed, handled globally or by layout */}

                    <div style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '2.5rem',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-elevated)',
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Welcome back</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Sign in to continue to your dashboard</p>
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
                                        style={{ paddingLeft: '2.75rem' }}
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
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
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{ paddingLeft: '2.75rem' }}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '0.875rem' }}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                            </button>
                        </form>

                        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Don't have an account? <Link to="/register" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Create one</Link>
                        </div>
                    </div>

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
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
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
                                            Enter your email address to receive a magic login link. You can change your password in settings after logging in.
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
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={forgotLoading}
                                            className="btn btn-primary"
                                            style={{ width: '100%' }}
                                        >
                                            {forgotLoading ? <Loader2 className="animate-spin" /> : 'Send Login Link'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
            </div>
            )
}
