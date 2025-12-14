import { create } from 'zustand'
import { persist } from 'zustand/middleware'
type Theme = 'light' | 'dark'
interface ThemeState {
    theme: Theme
    toggleTheme: () => void
    setTheme: (theme: Theme) => void
}
export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'dark', 
            toggleTheme: () => set((state) => {
                const newTheme = state.theme === 'light' ? 'dark' : 'light'
                updateDomTheme(newTheme)
                return { theme: newTheme }
            }),
            setTheme: (theme) => {
                updateDomTheme(theme)
                set({ theme })
            }
        }),
        {
            name: 'theme-storage',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    updateDomTheme(state.theme)
                }
            }
        }
    )
)
const updateDomTheme = (theme: Theme) => {
    document.documentElement.setAttribute('data-theme', theme)
}
 
