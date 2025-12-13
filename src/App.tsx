import { Loader2 } from 'lucide-react'

// ... imports remain the same

interface ProtectedRouteProps {
    children: React.ReactNode
}

function FullScreenLoader() {
    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
            <Loader2 className="animate-spin" size={32} style={{ color: 'var(--text-primary)' }} />
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
