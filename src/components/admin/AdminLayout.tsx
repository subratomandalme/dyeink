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
import { useAuthStore } from '../../store'
import { useThemeStore } from '../../store/themeStore' // Added import
import { settingsService } from '../../services/settingsService'
import ThemeToggle from '../common/ThemeToggle'
import LetterGlitch from '../common/LetterGlitch'

export default function AdminLayout() {
    const { logout, user } = useAuthStore()
    const navigate = useNavigate()
    const location = useLocation()
    const [isLoggingOut, setIsLoggingOut] = useState(false) // New state for logout animation
    const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || 'User')
    const [subdomain, setSubdomain] = useState<string | null>(null)
    const [isCreateHovered, setIsCreateHovered] = useState(false)
    const { theme } = useThemeStore()

    const getNeumorphicShadows = () => {
        const isDark = theme === 'dark'
        if (isCreateHovered) {
            if (isDark) {
                return '-1px -1px 5px rgba(255,255,255,0.15), 1px 1px 5px rgba(255,255,255,0.05), inset -2px -2px 5px rgba(255,255,255,0.1), inset 2px 2px 4px rgba(0,0,0,0.5)'
            }
            return '-1px -1px 5px rgba(255,255,255,0.6), 1px 1px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(255,255,255,1), inset 2px 2px 4px rgba(0,0,0,0.3)'
        } else {
            if (isDark) {
                return '-5px -5px 10px rgba(255,255,255,0.1), 5px 5px 10px rgba(255,255,255,0.03)'
            }
            return '-5px -5px 10px rgba(255,255,255,0.8), 5px 5px 10px rgba(0,0,0,0.25)'
        }
    }

    useEffect(() => {
        const loadSettings = async () => {
            if (!user) return

            let settings = await settingsService.getSettings()

            // If no settings exist (first time user), create defaults
            if (!settings) {
                const defaultSubdomain = `blog-${user.id.slice(0, 8)}`
                const defaultName = user.user_metadata?.full_name || 'My DyeInk Blog'

                try {
                    settings = await settingsService.saveSettings({
                        siteName: defaultName,
                        siteDescription: 'Welcome to my new blog',
                        customDomain: null,
                        subdomain: defaultSubdomain
                    })
                } catch (err) {
                    console.error('Failed to create default settings:', err)
                }
            }

            if (settings) {
                if (settings.siteName) setDisplayName(settings.siteName)
                if (settings.subdomain) setSubdomain(settings.subdomain)
            } else if (user?.user_metadata?.full_name) {
                setDisplayName(user.user_metadata.full_name)
            }
        }
        loadSettings()
    }, [user])

    const isActive = (path: string) => location.pathname === path

    const handleSignOut = async () => {
        setIsLoggingOut(true)
        await logout()
        navigate('/login')
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                backgroundColor: 'var(--bg-elevated)',
                borderRight: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 40,
                transition: 'transform 0.3s ease-in-out',
                // transform: 'translateX(0)' // For now, static
            }}>
                {/* Greeting Area (Replacement for Logo) */}
                <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-secondary)',
                        fontWeight: 400,
                        fontFamily: '"Mochiy Pop One", sans-serif'
                    }}>Hi,</span>
                    <span style={{
                        fontSize: '1.75rem',
                        fontWeight: 400,
                        letterSpacing: '0.02em',
                        color: 'var(--text-primary)',
                        lineHeight: 1.2,
                        wordBreak: 'break-word',
                        fontFamily: '"Mochiy Pop One", sans-serif'
                    }}>
                        {displayName.length > 20 ? `${displayName.slice(0, 20)}...` : displayName}
                    </span>
                </div>

                {/* Create New Post Button */}
                <div style={{ padding: '0 1.25rem 2rem 1.25rem' }}>
                    <Link
                        to="/admin/posts/new"
                        onMouseEnter={() => setIsCreateHovered(true)}
                        onMouseLeave={() => setIsCreateHovered(false)}
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.85rem',
                            borderRadius: '50px',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--accent-primary)',
                            fontWeight: 700,
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            boxShadow: getNeumorphicShadows()
                        }}
                    >
                        New Post
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav style={{ flex: 1, padding: '0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        marginBottom: '0.5rem',
                        paddingLeft: '0.75rem',
                        letterSpacing: '0.05em'
                    }}>
                        MENU
                    </div>

                    <Link
                        to="/admin"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            color: isActive('/admin') ? 'var(--text-primary)' : 'var(--text-secondary)',
                            backgroundColor: isActive('/admin') ? 'var(--bg-tertiary)' : 'transparent',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            fontWeight: isActive('/admin') ? 500 : 400
                        }}
                    >
                        <Home size={20} /> Home
                    </Link>

                    <Link
                        to={subdomain ? `/${subdomain}` : "/blog"}
                        target="_blank"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                        }}
                    >
                        <Globe size={20} /> View
                    </Link>

                    <Link
                        to="/admin/posts"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            color: isActive('/admin/posts') ? 'var(--text-primary)' : 'var(--text-secondary)',
                            backgroundColor: isActive('/admin/posts') ? 'var(--bg-tertiary)' : 'transparent',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            fontWeight: isActive('/admin/posts') ? 500 : 400
                        }}
                    >
                        <FileText size={20} /> Posts
                    </Link>

                    {/* Section: AUDIENCE */}
                    <div style={{ marginTop: '2rem' }}>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            marginBottom: '0.5rem',
                            paddingLeft: '0.75rem',
                            letterSpacing: '0.05em'
                        }}>
                            AUDIENCE
                        </div>
                        <Link
                            to="/admin/stats"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '6px',
                                color: isActive('/admin/stats') ? 'var(--text-primary)' : 'var(--text-secondary)',
                                backgroundColor: isActive('/admin/stats') ? 'var(--bg-tertiary)' : 'transparent',
                                textDecoration: 'none',
                                fontSize: '0.95rem',
                                fontWeight: isActive('/admin/stats') ? 500 : 400
                            }}
                        >
                            <BarChart2 size={20} /> Stats
                        </Link>
                    </div>

                    {/* Section: CREATOR TOOLS */}
                    <div style={{ marginTop: '2rem' }}>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            marginBottom: '0.5rem',
                            paddingLeft: '0.75rem',
                            letterSpacing: '0.05em'
                        }}>
                            CREATOR TOOLS
                        </div>
                        <Link
                            to="/admin/settings"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '6px',
                                color: isActive('/admin/settings') ? 'var(--text-primary)' : 'var(--text-secondary)',
                                backgroundColor: isActive('/admin/settings') ? 'var(--bg-tertiary)' : 'transparent',
                                textDecoration: 'none',
                                fontSize: '0.95rem',
                                fontWeight: isActive('/admin/settings') ? 500 : 400
                            }}
                        >
                            <Settings size={20} /> Settings
                        </Link>
                    </div>
                </nav>

                {/* User / Sign Out */}
                <div style={{ padding: '1.25rem' }}>
                    <button
                        onClick={handleSignOut}
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
                            fontSize: '0.9rem'
                        }}
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{
                flex: 1,
                marginLeft: '260px',
                backgroundColor: 'var(--bg-primary)',
                minHeight: '100vh',
                position: 'relative'
            }}>
                {/* Fixed Theme Toggle */}
                <div style={{
                    position: 'absolute',
                    top: '2rem',
                    right: '2rem',
                    zIndex: 50
                }}>
                    <ThemeToggle />
                </div>
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem 2rem 2rem' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
