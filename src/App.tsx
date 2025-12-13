import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store'
import { useThemeStore } from './store/themeStore'
// import ColorBends from './components/common/ColorBends'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Blog from './pages/Blog'
// PostView removed
import Dashboard from './pages/admin/Dashboard'
import Posts from './pages/admin/Posts'
import Editor from './pages/admin/Editor'
import Domains from './pages/admin/Domains'
import Settings from './pages/admin/Settings'
import Stats from './pages/admin/Stats'
import AdminLayout from './components/admin/AdminLayout'
import './styles/globals.css'
import { ToastContainer } from './components/common/Toast'

interface ProtectedRouteProps {
    children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated } = useAuthStore()

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

// Redirects authenticated users away from public pages (Landing)
function PublicRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuthStore()
    if (isAuthenticated) {
        return <Navigate to="/admin" replace />
    }
    return <>{children}</>
}

function ThemeInit() {
    const theme = useThemeStore((state) => state.theme)
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
    }, [theme])
    return null
}

function App() {
    const initializeAuth = useAuthStore((state) => state.initialize)

    useEffect(() => {
        initializeAuth()
    }, [initializeAuth])

    return (
        <BrowserRouter>
            <ThemeInit />
            <ToastContainer />
            {/* Background removed for stability - relying on CSS in globals.css */}
            <Routes>
                {/* Public Only Route (Landing) */}
                <Route path="/" element={
                    <PublicRoute>
                        <Landing />
                    </PublicRoute>
                } />

                {/* Public Route (Global Feed) */}
                <Route path="/blog" element={<Blog />} />
                {/* User Profile / Blog Routes */}
                <Route path="/:subdomain" element={<Blog />} />
                <Route path="/:subdomain/:slug" element={<Blog />} />
                {/* PostView route removed */}

                {/* Auth Routes (PublicOnly?) - Keeping accessible for now, or could wrap in PublicRoute */}
                <Route path="/login" element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                } />
                <Route path="/register" element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                } />

                {/* Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="posts" element={<Posts />} />
                    <Route path="stats" element={<Stats />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="domains" element={<Domains />} />
                </Route>

                {/* Editor Routes (Distraction Free - No Sidebar) */}
                <Route
                    path="/admin/posts/new"
                    element={
                        <ProtectedRoute>
                            <Editor />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/posts/:id/edit"
                    element={
                        <ProtectedRoute>
                            <Editor />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    )
}

export default App
