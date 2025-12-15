import { useState, useEffect } from 'react'

import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import {
    Home,
    Globe,
    FileText,
    Settings,
    LogOut,
    BarChart2
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { useAdminStore } from '../../stores/adminStore'
import { settingsService } from '../../services/settingsService'
import ThemeToggle from '../common/ui/ThemeToggle'
import DecryptedText from '../common/animations/DecryptedText'
import { BackgroundBeams } from '../common/animations/BackgroundBeams'
import AdminGreeting from './AdminGreeting'
import NewPostButton from './sidebar/NewPostButton'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
export default function AdminLayout() {
    const { logout, user } = useAuthStore()
    const navigate = useNavigate()
    const location = useLocation()
    const { settings, fetchSettings, updateSettingsInCache } = useAdminStore()
    const greetingName = settings?.siteName || user?.name || 'User'
    const subdomain = settings?.subdomain || null
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const { theme } = useThemeStore()

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        const loadSettings = async () => {
            if (!user) return
            await fetchSettings()
            const currentSettings = useAdminStore.getState().settings
            if (!currentSettings) {
                const defaultSubdomain = `blog-${user.id.slice(0, 8)}`
                const defaultName = user.user_metadata?.full_name || 'User'
                try {
                    const newSettings = await settingsService.initializeSettings({
                        siteName: defaultName,
                        siteDescription: 'Welcome to my new blog',
                        customDomain: null,
                        subdomain: defaultSubdomain
                    })
                    if (newSettings) updateSettingsInCache(newSettings)
                } catch (err) {
                    console.error('Failed to create default settings:', err)
                }
            }
        }
        loadSettings()
    }, [user])
    const isActive = (path: string) => location.pathname === path
    const handleSignOut = async () => {
        setIsLoggingOut(true)
        setTimeout(async () => {
            await logout()
            navigate('/')
        }, 3000)
    }

    function SignOutScreen({ greetingName }: { greetingName: string }) {
        useLockBodyScroll()
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: '#000000',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
            }}>
                <div style={{ fontSize: '2rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    <DecryptedText
                        text={`Goodbye, ${greetingName}.`}
                        speed={80}
                        maxIterations={30}
                        animateOn="view"
                        revealDirection="center"
                    />
                </div>
                <div style={{ marginTop: '1rem', opacity: 0.5, fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>
                    <DecryptedText
                        text="TERMINATING SESSION..."
                        speed={50}
                        maxIterations={15}
                        animateOn="view"
                        revealDirection="end"
                    />
                </div>
            </div>
        )
    }

    if (isLoggingOut) {
        return <SignOutScreen greetingName={greetingName} />
    }
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>

            <aside className="admin-sidebar" style={{
                width: '260px',
                backgroundColor: 'var(--bg-primary)',
                borderRight: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.15)',
                boxShadow: theme === 'dark' ? '1px 0 30px rgba(255, 255, 255, 0.15)' : '1px 0 25px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100dvh',
                zIndex: 40,
                transition: 'transform 0.3s ease-in-out',
            }}>

                <div className="greeting-area" style={{ padding: '2rem 1.25rem 1rem 1.25rem' }}>
                    <AdminGreeting name={greetingName} />
                </div>

                <NewPostButton />

                <nav style={{ flex: 1, padding: '0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div className="section-label" style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem',
                        paddingLeft: '0.75rem',
                        letterSpacing: '0.05em',
                        textShadow: theme === 'dark' ? '0 0 15px rgba(255, 255, 255, 0.6)' : '0 0 10px rgba(0, 0, 0, 0.1)'
                    }}>
                        MENU
                    </div>
                    <Link
                        to="/admin"
                        className="sidebar-item"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '6px',
                            color: isActive('/admin') ? 'var(--text-primary)' : 'var(--text-secondary)',
                            backgroundColor: isActive('/admin') ? 'var(--bg-tertiary)' : 'transparent',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            fontWeight: isActive('/admin') ? 500 : 400
                        }}
                    >
                        <Home size={20} /><span className="sidebar-item-text"> Home</span>
                    </Link>
                    <Link
                        to={subdomain ? `/${subdomain}` : "/blog"}
                        target="_blank"
                        className="sidebar-item"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '6px',
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                        }}
                    >
                        <Globe size={20} /><span className="sidebar-item-text"> View</span>
                    </Link>
                    <Link
                        to="/admin/posts"
                        className="sidebar-item"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '6px',
                            color: isActive('/admin/posts') ? 'var(--text-primary)' : 'var(--text-secondary)',
                            backgroundColor: isActive('/admin/posts') ? 'var(--bg-tertiary)' : 'transparent',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            fontWeight: isActive('/admin/posts') ? 500 : 400
                        }}
                    >
                        <FileText size={20} /><span className="sidebar-item-text"> Posts</span>
                    </Link>

                    <div style={{ marginTop: '2rem' }}>
                        <div className="section-label" style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '0.5rem',
                            paddingLeft: '0.75rem',
                            letterSpacing: '0.05em',
                            textShadow: theme === 'dark' ? '0 0 15px rgba(255, 255, 255, 0.6)' : '0 0 10px rgba(0, 0, 0, 0.1)'
                        }}>
                            AUDIENCE
                        </div>
                        <Link
                            to="/admin/stats"
                            className="sidebar-item"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.6rem 0.75rem',
                                borderRadius: '6px',
                                color: isActive('/admin/stats') ? 'var(--text-primary)' : 'var(--text-secondary)',
                                backgroundColor: isActive('/admin/stats') ? 'var(--bg-tertiary)' : 'transparent',
                                textDecoration: 'none',
                                fontSize: '0.95rem',
                                fontWeight: isActive('/admin/stats') ? 500 : 400
                            }}
                        >
                            <BarChart2 size={20} /><span className="sidebar-item-text"> Stats</span>
                        </Link>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <div className="section-label" style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '0.5rem',
                            paddingLeft: '0.75rem',
                            letterSpacing: '0.05em',
                            textShadow: theme === 'dark' ? '0 0 15px rgba(255, 255, 255, 0.6)' : '0 0 10px rgba(0, 0, 0, 0.1)'
                        }}>
                            TOOLS
                        </div>
                        <Link
                            to="/admin/settings"
                            className="sidebar-item"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.6rem 0.75rem',
                                borderRadius: '6px',
                                color: isActive('/admin/settings') ? 'var(--text-primary)' : 'var(--text-secondary)',
                                backgroundColor: isActive('/admin/settings') ? 'var(--bg-tertiary)' : 'transparent',
                                textDecoration: 'none',
                                fontSize: '0.95rem',
                                fontWeight: isActive('/admin/settings') ? 500 : 400
                            }}
                        >
                            <Settings size={20} /><span className="sidebar-item-text"> Settings</span>
                        </Link>
                    </div>
                </nav>

                <div style={{ padding: '1.25rem' }}>
                    <button
                        onClick={handleSignOut}
                        className="btn-signout"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.5rem 0.75rem',
                            width: '100%',
                            border: 'none',
                            background: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <LogOut size={18} /><span className="signout-text"> Sign Out</span>
                    </button>
                    <style>{`
                        .btn-signout:hover {
                            color: #ef4444 !important;
                            text-shadow: 0 0 10px rgba(239, 68, 68, 0.6), 0 0 20px rgba(239, 68, 68, 0.4);
                            background: transparent !important;
                            box-shadow: none !important;
                        }
                    `}</style>
                </div>
            </aside>

            <main className="admin-main" style={{
                flex: 1,
                marginLeft: '260px',
                backgroundColor: 'var(--bg-primary)',
                height: '100vh',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {!isMobile && <BackgroundBeams style={{ opacity: 0.5 }} />}
                <div className="theme-toggle-wrapper" style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    zIndex: 50
                }}>
                    <ThemeToggle />
                </div>

                <div className="scroll-container" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    zIndex: 10
                }}>
                    <div className="content-wrapper" style={{ position: 'relative', maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem 2rem 2rem' }}>
                        <Outlet />
                    </div>
                </div>
            </main>

            <style>{`
                @media (max-width: 499px) {
                    .admin-sidebar {
                        width: 70px !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                    }
                    .admin-sidebar .greeting-area {
                        padding: 2rem 0 1rem 0 !important;
                        display: flex !important;
                        justify-content: center !important;
                    }
                    .admin-sidebar .greeting-area > div {
                        display: none !important;
                    }
                    .admin-sidebar .greeting-area::before {
                        content: '' !important;
                        display: block !important;
                        width: 36px !important;
                        height: 36px !important;
                        background-image: url('/Di.png') !important;
                        background-size: contain !important;
                        background-repeat: no-repeat !important;
                        background-position: center !important;
                    }
                    html[data-theme="dark"] .admin-sidebar .greeting-area::before {
                        filter: brightness(0) invert(1) !important;
                    }
                    html[data-theme="light"] .admin-sidebar .greeting-area::before {
                        filter: brightness(0) !important;
                    }
                    .admin-sidebar .new-post-btn {
                        padding: 0.75rem 0 1rem 0 !important;
                        display: flex !important;
                        justify-content: center !important;
                    }
                    .admin-sidebar .new-post-btn a {
                        width: 44px !important;
                        height: 44px !important;
                        padding: 0 !important;
                        font-size: 0 !important;
                        display: block !important;
                        border-radius: 50% !important;
                        position: relative !important;
                    }
                    .admin-sidebar .new-post-btn a::before {
                        content: '+' !important;
                        position: absolute !important;
                        top: 47% !important;
                        left: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        font-size: 32px !important;
                        font-weight: 200 !important;
                        line-height: 1 !important;
                    }
                    .admin-sidebar .section-label {
                        display: none !important;
                    }
                    .admin-sidebar nav {
                        padding: 1rem 0.5rem 0.5rem 0.5rem !important;
                        gap: 0.5rem !important;
                    }
                    .admin-sidebar nav > div {
                        margin-top: 0 !important;
                        gap: 0.5rem !important;
                    }
                    .admin-sidebar .sidebar-item {
                        justify-content: center !important;
                        padding: 0.75rem !important;
                        gap: 0 !important;
                    }
                    .admin-sidebar .sidebar-item svg {
                        width: 24px !important;
                        height: 24px !important;
                    }
                    .admin-sidebar .sidebar-item-text {
                        display: none !important;
                    }
                    .admin-sidebar .btn-signout {
                        justify-content: center !important;
                        padding: 0.75rem !important;
                        gap: 0 !important;
                    }
                    .admin-sidebar .btn-signout svg {
                        width: 24px !important;
                        height: 24px !important;
                        min-width: 24px !important;
                        min-height: 24px !important;
                    }
                    .admin-sidebar .signout-text {
                        display: none !important;
                    }
                    .admin-main {
                        margin-left: 70px !important;
                    }
                    .admin-main .content-wrapper {
                        padding: 2rem 0.75rem 1.25rem 1rem !important;
                        max-width: 100% !important;
                        overflow-x: hidden !important;
                    }
                    .admin-main .theme-toggle-wrapper {
                        top: 0.5rem !important;
                        right: 0.5rem !important;
                    }
                    .admin-main h1 {
                        font-size: 1.75rem !important;
                        margin-bottom: 1rem !important;
                    }
                    .admin-main .stats-grid {
                        gap: 0.75rem !important;
                    }
                    .admin-main table {
                        display: block !important;
                        overflow-x: auto !important;
                        font-size: 0.85rem !important;
                    }
                }
            `}</style>
        </div>
    )
}

