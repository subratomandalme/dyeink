import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'
import '../common/NeumorphismButton.css'

export default function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore()

    return (
        <button
            onClick={toggleTheme}
            className="neu-btn"
            style={{
                width: '40px',
                height: '40px',
                padding: 0,
                justifyContent: 'center',
                borderRadius: '50%',
            }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <Moon size={20} />
            ) : (
                <Sun size={20} />
            )}
        </button>
    )
}
