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
        // ... (keep existing implementation)
        const isDark = theme === 'dark'
        // ...
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

        // ... (keep active check and handleSignOut)

        // ... (inside return)

        < Link
    to = { subdomain? `/${subdomain}` : "/blog"
}
target = "_blank"
style = {{
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
                        </Link >
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
                    </div >

    {/* Section: AUDIENCE (Replaced Subscribers with Stats as per user implication, or kept generic) */ }
    < div style = {{ marginBottom: '2rem' }}>
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
                    </div >

    {/* Section: CREATOR TOOLS */ }
    < div >
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
                    </div >
                </nav >

    {/* User / Sign Out */ }
    < div style = {{ padding: '1.25rem' }}>
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
                </div >
            </aside >

    {/* Main Content Area */ }
    < main style = {{
    flex: 1,
        marginLeft: '260px',
            backgroundColor: 'var(--bg-primary)',
                minHeight: '100vh',
                    position: 'relative'
}}>
    {/* Fixed Theme Toggle */ }
    < div style = {{
    position: 'absolute',
        top: '2rem',
            right: '2rem',
                zIndex: 50
}}>
    <ThemeToggle />
                </div >
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem 2rem 2rem' }}>
        <Outlet />
    </div>
            </main >
        </div >
    )
}
