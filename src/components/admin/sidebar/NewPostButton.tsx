import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useThemeStore } from '../../../stores/themeStore'

export default function NewPostButton() {
    const [isCreateHovered, setIsCreateHovered] = useState(false)
    const { theme } = useThemeStore()

    const getNeumorphicShadows = () => {
        const isDark = theme === 'dark'
        if (isCreateHovered) {
            if (isDark) {
                return 'inset -2px -2px 5px rgba(255,255,255,0.08), inset 2px 2px 4px rgba(0,0,0,0.5), -1px -1px 5px rgba(255,255,255,0.15), 1px 1px 5px rgba(0,0,0,0.5)'
            }

            return '-1px -1px 5px rgba(255, 255, 255, 0.6), 1px 1px 5px rgba(0, 0, 0, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 1), inset 2px 2px 4px rgba(0, 0, 0, 0.3)'
        } else {
            if (isDark) {
                return '-5px -5px 10px rgba(255,255,255,0.12), 5px 5px 10px rgba(0,0,0,0.5)'
            }

            return '-5px -5px 10px rgba(255, 255, 255, 0.8), 5px 5px 10px rgba(0, 0, 0, 0.25)'
        }
    }

    return (
        <div className="new-post-btn" style={{ padding: '0 1.25rem 1.5rem 1.25rem' }}>
            <Link
                to="/admin/posts/new"
                onMouseEnter={() => setIsCreateHovered(true)}
                onMouseLeave={() => setIsCreateHovered(false)}
                onTouchStart={() => setIsCreateHovered(true)}
                onTouchEnd={() => setIsCreateHovered(false)}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.85rem',
                    borderRadius: '50px',
                    backgroundColor: 'var(--bg-primary)',
                    color: isCreateHovered
                        ? (theme === 'dark' ? '#ffffff' : 'var(--accent-primary)')
                        : 'var(--text-secondary)',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: getNeumorphicShadows()
                }}
            >
                New Post
            </Link>
        </div>
    )
}
