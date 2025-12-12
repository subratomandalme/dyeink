
import { useState } from 'react'
import { X, Mail, Loader2, CheckCircle } from 'lucide-react'
import { subscribeService } from '../../services/subscribeService'
import { useToast } from './Toast'

interface SubscribeModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function SubscribeModal({ isOpen, onClose }: SubscribeModalProps) {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const { addToast } = useToast()

    if (!isOpen) return null

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await subscribeService.subscribe(email)
            setSuccess(true)
            addToast({ type: 'success', message: 'Successfully subscribed!', duration: 3000 })
            setTimeout(() => {
                onClose()
                setSuccess(false)
                setEmail('')
            }, 2000)
        } catch (error) {
            addToast({ type: 'error', message: (error as Error).message, duration: 3000 })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '2rem',
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: '24px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative',
                margin: '1rem'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)'
                    }}
                >
                    <X size={20} />
                </button>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div style={{
                            display: 'inline-flex',
                            padding: '1rem',
                            borderRadius: '50%',
                            background: 'rgba(34, 197, 94, 0.1)',
                            color: '#22c55e',
                            marginBottom: '1rem'
                        }}>
                            <CheckCircle size={48} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-display)' }}>Subscribed!</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>You'll receive updates on new posts.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            <div style={{
                                display: 'inline-flex',
                                padding: '0.75rem',
                                borderRadius: '50%',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                marginBottom: '1rem'
                            }}>
                                <Mail size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                                Stay in the loop
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                                Receive clarity and silence directly to your inbox. No spam, ever.
                            </p>
                        </div>

                        <form onSubmit={handleSubscribe}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-primary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '50px',
                                    background: 'var(--text-primary)',
                                    color: 'var(--bg-primary)',
                                    border: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'scale(1.02)')}
                                onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Subscribe'}
                            </button>
                        </form>
                    </>
                )}
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    )
}
