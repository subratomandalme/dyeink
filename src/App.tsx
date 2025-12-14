import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store'
import { useThemeStore } from './store/themeStore'
import { supabase } from './lib/supabase'


import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
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
import { SimpleErrorBoundary } from './components/common/SimpleErrorBoundary'

interface ProtectedRouteProps {
    children: React.ReactNode
}

import WaveLoader from './components/common/WaveLoader'

function FullScreenLoader() {
    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
            <WaveLoader />
        </div>
    )
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuthStore()

    if (isLoading) {
        return <FullScreenLoader />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

// Redirects authenticated users away from public pages (Landing)
function PublicRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuthStore()

    if (isLoading) {
        return <FullScreenLoader />
    }

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

function AuthListener() {
    const navigate = useNavigate()
    const initialize = useAuthStore((state) => state.initialize)

    useEffect(() => {
        initialize()

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, _session) => {
            if (event === 'PASSWORD_RECOVERY') {
                navigate('/admin/settings?tab=Security')
            }
        })

        return () => {
            authListener.subscription.unsubscribe()
        }
    }, [initialize, navigate])

    return null
}

function App() {
    return (
        <BrowserRouter>
            <ThemeInit />
            <AuthListener />
            <ToastContainer />
            <Routes>
                {/* Public Only Route (Landing) */}
                {/* Root Route: Handles Custom Domains (Blog) OR Landing Page */}
                <Route path="/" element={
                    !window.location.hostname.includes('localhost') && !window.location.hostname.includes('vercel.app') ? (
                        <Blog isCustomDomain={true} />
                    ) : (
                        <PublicRoute>
                            <Landing />
                        </PublicRoute>
                    )
                } />

                {/* Public Route (Global Feed) */}
                <Route path="/blog" element={<Blog />} />
                {/* User Profile / Blog Routes */}
                <Route path="/:subdomain" element={<Blog />} />
                <Route path="/:subdomain/:slug" element={<Blog />} />
                {/* PostView route removed */}

                {/* Auth Routes */}
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
                <Route path="/forgot-password" element={
                    <PublicRoute>
                        <ForgotPassword />
                    </PublicRoute>
                } />
                <Route path="/reset-password" element={
                    <ResetPassword />
                } />

                {/* Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <SimpleErrorBoundary>
                                <AdminLayout />
                            </SimpleErrorBoundary>
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="posts" element={<Posts />} />
                    <Route path="stats" element={<Stats />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="domains" element={<Domains />} />
                </Route>

                {/* Editor Routes */}
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
