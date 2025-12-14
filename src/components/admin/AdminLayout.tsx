import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { useThemeStore } from '../../store/themeStore'
import { useAdminStore } from '../../store/adminStore'
import { settingsService } from '../../services/settingsService' // Keeping for default creation logic if needed, or moving logic to store
import ThemeToggle from '../common/ThemeToggle'
import DecryptedText from '../common/DecryptedText'
import { BackgroundBeams } from '../common/BackgroundBeams'

export default function AdminLayout() {
    const { logout, user } = useAuthStore()
    const navigate = useNavigate()
    const location = useLocation()

    // Store integration
    const { settings, fetchSettings, updateSettingsInCache } = useAdminStore()

    // Derived state
    const greetingName = settings?.siteName || user?.name || 'User'

    const subdomain = settings?.subdomain || null

    // UI Logic
    const [isCreateHovered, setIsCreateHovered] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const { theme } = useThemeStore()

    const getNeumorphicShadows = () => {
        const isDark = theme === 'dark'
        if (isCreateHovered) {
            if (isDark) {
                return '-1px -1px 5px rgba(255,255,255,0.15), 1px 1px 5px rgba(255,255,255,0.05), inset -2px -2px 5px rgba(255,255,255,0.1), inset 2px 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(255, 255, 255, 0.2)'
            }
            return '-1px -1px 5px rgba(255,255,255,0.6), 1px 1px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(255,255,255,1), inset 2px 2px 4px rgba(0,0,0,0.3)'
        } else {
            if (isDark) {
                return '-5px -5px 10px rgba(255,255,255,0.1), 5px 5px 10px rgba(255,255,255,0.03), 0 0 25px rgba(255, 255, 255, 0.3)'
            }
            return '-5px -5px 10px rgba(255,255,255,0.8), 5px 5px 10px rgba(0,0,0,0.25)'
        }
    }

    useEffect(() => {
        const loadSettings = async () => {
            if (!user) return

            await fetchSettings()

            // Check directly from store state to see if we need defaults
            const currentSettings = useAdminStore.getState().settings

            // If no settings exist (first time user), create defaults
            if (!currentSettings) {
                const defaultSubdomain = `blog-${user.id.slice(0, 8)}`
                const defaultName = user.user_metadata?.full_name || 'User'

                try {
                    const newSettings = await settingsService.saveSettings({
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
        // Wait for animation
        setTimeout(async () => {
            await logout()
            navigate('/')
        }, 3000)
    }

    if (isLoggingOut) {
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

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                backgroundColor: 'var(--bg-primary)',
                borderRight: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.15)',
                boxShadow: theme === 'dark' ? '1px 0 30px rgba(255, 255, 255, 0.15)' : '1px 0 25px rgba(0, 0, 0, 0.1)', // Sidebar Divider Glow
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 40,
                transition: 'transform 0.3s ease-in-out',
                // transform: 'translateX(0)' // For now, static
            }}>
                {/* Greeting Area (Replacement for Logo) */}
                <div style={{ padding: '2rem 1.25rem 1rem 1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{
                            fontSize: '1.5rem',
                            color: 'var(--text-secondary)',
                            opacity: 0.8,
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 500,
                            textShadow: '0 0 25px rgba(255, 255, 255, 0.8)'
                        }}>Hi,</span>
                        <span style={{
                            fontSize: '1.8rem',
                            color: 'var(--text-primary)',
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 700,
                            display: 'block',
                            minHeight: '2.2rem'
                        }}>
                            <DecryptedText
                                text={greetingName.length > 18 ? `${greetingName.slice(0, 18)}...` : greetingName}
                                speed={60}
                                maxIterations={15}
                                animateOn="view"
                                revealDirection="start"
                            />
                        </span>
                    </div>
                </div>

                {/* Create New Post Button */}
                <div style={{ padding: '0 1.25rem 1.5rem 1.25rem' }}>
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
                        <Home size={20} /> Home
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
                        <Globe size={20} /> View
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
                        <FileText size={20} /> Posts
                    </Link>

                    {/* Section: AUDIENCE */}
                    <div style={{ marginTop: '2rem' }}>
                        <div style={{
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
                            <BarChart2 size={20} /> Stats
                        </Link>
                    </div>

                    {/* Section: CREATOR TOOLS */}
                    <div style={{ marginTop: '2rem' }}>
                        <div style={{
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
                            <Settings size={20} /> Settings
                        </Link>
                    </div>
                </nav>

                {/* User / Sign Out */}
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
                        <LogOut size={18} /> Sign Out
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

            {/* Main Content Area */}
            <main style={{
                flex: 1,
                marginLeft: '260px',
                backgroundColor: 'var(--bg-primary)',
                minHeight: '100vh',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <BackgroundBeams style={{ opacity: 0.5 }} />
                {/* Fixed Theme Toggle */}
                <div style={{
                    position: 'absolute',
                    top: '2rem',
                    right: '2rem',
                    zIndex: 50
                }}>
                    <ThemeToggle />
                </div>
                <div style={{ position: 'relative', zIndex: 10, maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem 2rem 2rem' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    )
}
