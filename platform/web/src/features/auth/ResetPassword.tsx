import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Lock, CheckCircle2 } from 'lucide-react'
import WaveLoader from '../../components/common/feedback/WaveLoader'
export default function ResetPassword() {
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()
    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'PASSWORD_RECOVERY') {
            }
        })
    }, [])
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        if (password.length < 8) {
            setError('Password must be at least 8 characters.')
            setLoading(false)
            return
        }
        if (!/[A-Z]/.test(password)) {
            setError('Password must contain at least one uppercase letter.')
            setLoading(false)
            return
        }
        if (!/[a-z]/.test(password)) {
            setError('Password must contain at least one lowercase letter.')
            setLoading(false)
            return
        }
        if (!/[0-9]/.test(password)) {
            setError('Password must contain at least one number.')
            setLoading(false)
            return
        }
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })
            if (error) throw error
            setSuccess(true)
            setTimeout(() => {
                navigate('/admin')
            }, 3000)
        } catch (err: any) {
            console.error('Update password error:', err)
            setError('Failed to update password. Please try again.')
        } finally {
            setLoading(false)
        }
    }
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)'
        }}>

            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                background: 'radial-gradient(circle at 50% 50%, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
                opacity: 0.5
            }} />
            <div style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '400px',
                padding: '2.5rem',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-elevated)',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
            }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        margin: 0,
                        letterSpacing: '-0.02em',
                        background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Reset Password
                    </h1>
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>
                        Enter your new password below.
                    </p>
                </div>
                {success ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '2rem 0',
                        animation: 'fadeIn 0.5s ease-out'
                    }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'rgba(34, 197, 94, 0.1)',
                            color: '#22c55e',
                            marginBottom: '1rem'
                        }}>
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Password Updated!</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Redirecting you to dashboard...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {error && (
                            <div style={{
                                padding: '0.75rem',
                                borderRadius: '8px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                color: '#ef4444',
                                fontSize: '0.9rem'
                            }}>
                                {error}
                            </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label htmlFor="password" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                New Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }} />
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 2.75rem',
                                        fontSize: '1rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                width: '100%',
                                padding: '0.85rem',
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: 'var(--bg-primary)',
                                background: 'var(--text-primary)',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                transition: 'all 0.2s',
                                marginTop: '0.5rem'
                            }}
                        >
                            {loading ? <WaveLoader size={24} /> : 'Update Password'}
                        </button>
                    </form>
                )}
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}

