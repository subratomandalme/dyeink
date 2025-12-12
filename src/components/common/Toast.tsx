import { create } from 'zustand'
import { X, Check, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
    id: string
    type: ToastType
    message: string
    duration?: number
    action?: {
        label: string
        onClick: () => void
    }
}

interface ToastStore {
    toasts: Toast[]
    addToast: (toast: Omit<Toast, 'id'>) => void
    removeToast: (id: string) => void
}

export const useToast = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = Math.random().toString(36).substring(7)
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    },
    removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
    })),
}))

export const ToastContainer = () => {
    const { toasts, removeToast } = useToast()

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            pointerEvents: 'none' // Click through container
        }}>
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
            ))}
        </div>
    )
}

const ToastItem = ({ toast, onDismiss }: { toast: Toast, onDismiss: () => void }) => {
    useEffect(() => {
        if (toast.duration !== Infinity) {
            const timer = setTimeout(onDismiss, toast.duration || 4000)
            return () => clearTimeout(timer)
        }
    }, [toast, onDismiss])

    const getIcon = () => {
        switch (toast.type) {
            case 'success': return <Check size={18} color="var(--text-primary)" />
            case 'error': return <AlertCircle size={18} color="#ef4444" />
            case 'warning': return <AlertTriangle size={18} color="#f59e0b" />
            default: return <Info size={18} color="#3b82f6" />
        }
    }



    return (
        <div style={{
            pointerEvents: 'auto',
            minWidth: '300px',
            maxWidth: '400px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <style>{`
@keyframes slideIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
}
`}</style>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getIcon()}</div>

            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.4, fontWeight: 500 }}>
                    {toast.message}
                </p>
                {toast.action && (
                    <button
                        onClick={toast.action.onClick}
                        style={{
                            marginTop: '0.5rem',
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.8rem',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>

            <button
                onClick={onDismiss}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    padding: 0,
                    marginLeft: '0.5rem'
                }}
            >
                <X size={16} />
            </button>

            {/* Progress bar line optionally here */}
        </div>
    )
}
