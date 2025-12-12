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
    const [isCreateHovered, setIsCreateHovered] = useState(false)
    const { theme } = useThemeStore()

    const getNeumorphicShadows = () => {
        const isDark = theme === 'dark'

        if (isCreateHovered) {
            if (isDark) {
                // Dark Mode Hover: Orange Bottom Glow
                return '0 0 20px rgba(255, 94, 0, 0.4), 0 5px 10px rgba(255, 94, 0, 0.2), -1px -1px 5px rgba(255,255,255,0.1)'
            }
            return '-1px -1px 5px rgba(255,255,255,0.6), 1px 1px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(255,255,255,1), inset 2px 2px 4px rgba(0,0,0,0.3)'
        } else {
            if (isDark) {
                // Dark Mode Idle: Top-Left=White(10%), Bottom-Right=FaintWhite(3%)
                return '-5px -5px 10px rgba(255,255,255,0.1), 5px 5px 10px rgba(255,255,255,0.03)'
            }
            return '-5px -5px 10px rgba(255,255,255,0.8), 5px 5px 10px rgba(0,0,0,0.25)'
        }
    }

    useEffect(() => {
        const loadSettings = async () => {
            const settings = await settingsService.getSettings()
            if (settings?.siteName) {
                setDisplayName(settings.siteName)
            } else if (user?.user_metadata?.full_name) {
                setDisplayName(user.user_metadata.full_name)
            }
        }
        loadSettings()
    }, [user])

    // Helper to check active state
    const isActive = (path: string) => location.pathname === path

    const handleSignOut = async () => {
        setIsLoggingOut(true)
        // Cinematic delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        await logout()
        navigate('/') // Go to landing page as requested
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', transition: 'background-color 0.3s ease' }}>
            {/* Full Screen Glitch Overlay for Logout */}
            {isLoggingOut && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000' }}>
                    <LetterGlitch
                        glitchSpeed={50}
                        centerVignette={true}
                        outerVignette={false}
                        smooth={true}
                    />
                </div>
            )}

            {/* Sidebar */}
            <aside style={{
                width: '260px',
                backgroundColor: 'var(--bg-primary)', // Cleaner, same as main
                borderRight: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                overflowY: 'auto',
                paddingTop: '4rem' // Added spacing
            }}>


                {/* Main Navigation */}
                <nav style={{ padding: '0 1.25rem', flex: 1 }}>
                    <div style={{
                        marginBottom: '1.5rem',
                        fontSize: '1.8rem', // Reduced by ~1/4
                        fontFamily: "var(--font-display)", // Match 'Purify your digital thoughts' (Syne)
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.02em',
                        paddingLeft: '0.75rem',
                        lineHeight: 1.1,
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        maxWidth: '100%'
                    }}>
                        Hi, {displayName}
                    </div>


                    <Link
                        to="/admin/posts/new"
                        onMouseEnter={() => setIsCreateHovered(true)}
                        onMouseLeave={() => setIsCreateHovered(false)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            width: '100%',
                            padding: '0.8rem',
                            backgroundColor: 'var(--bg-primary)',
                            color: isCreateHovered ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            borderRadius: '50px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            marginBottom: '2rem',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s ease',
                            boxShadow: getNeumorphicShadows()
                        }}
                    >
                        Create new
                    </Link>

                    {/* Section: CONTENT */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            marginBottom: '0.5rem',
                            paddingLeft: '0.75rem',
                            letterSpacing: '0.05em'
                        }}>
                            CONTENT
                        </div>
                        <Link
                            to="/admin"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '6px',
                                color: isActive('/admin') && location.pathname === '/admin' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                backgroundColor: isActive('/admin') && location.pathname === '/admin' ? 'var(--bg-tertiary)' : 'transparent',
                                textDecoration: 'none',
                                fontSize: '0.95rem',
                                fontWeight: isActive('/admin') && location.pathname === '/admin' ? 500 : 400
                            }}
                        >
                            <Home size={20} /> Home
                        </Link>
                        <Link
                            to="/blog"
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
                    </div>

                    {/* Section: AUDIENCE (Replaced Subscribers with Stats as per user implication, or kept generic) */}
                    <div style={{ marginBottom: '2rem' }}>
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
                    <div>
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
