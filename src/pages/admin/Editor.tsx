import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { postService } from '../../services/postService'
import {
    ChevronLeft,
    Undo,
    Redo,
    Bold,
    Italic,
} from 'lucide-react'
import WaveLoader from '../../components/common/WaveLoader'
import LetterGlitch from '../../components/common/LetterGlitch'
import { useThemeStore } from '../../store/themeStore'

import { useAuthStore } from '../../store'

export default function Editor() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { logout } = useAuthStore()
    const { theme } = useThemeStore()

    // State
    const [title, setTitle] = useState('')
    const [excerpt, setExcerpt] = useState('')
    const [coverImage, setCoverImage] = useState('')
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false) // New state for loading screen
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [isContinueHovered, setIsContinueHovered] = useState(false)

    // Load Data if Edit Mode
    useEffect(() => {
        if (!id) return

        const fetchPost = async () => {
            setLoading(true)
            try {
                const post = await postService.getPostById(id)
                if (post) {
                    setTitle(post.title)
                    setExcerpt(post.excerpt || '')
                    setCoverImage(post.coverImage || '')
                    if (contentRef.current) {
                        contentRef.current.innerHTML = post.content
                    }
                }
            } catch (error) {
                console.error('Failed to load post:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchPost()
    }, [id])

    // ContentEditable Ref
    const contentRef = useRef<HTMLDivElement>(null)

    // Toolbar Actions
    const executeCommand = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value)
        contentRef.current?.focus()
    }

    const handleSave = async (shouldPublish: boolean = false) => {
        if (!title) {
            alert("Please enter a title")
            return
        }

        if (shouldPublish) {
            setIsPublishing(true)
        } else {
            setSaving(true)
        }

        try {
            // Get HTML content from the div
            const contentHtml = contentRef.current?.innerHTML || ''

            const [result] = await Promise.all([
                id
                    ? postService.updatePost(parseInt(id), {
                        title,
                        content: contentHtml,
                        excerpt,
                        coverImage: coverImage || '',
                        published: shouldPublish
                    })
                    : postService.createPost({
                        title,
                        content: contentHtml,
                        excerpt,
                        coverImage: coverImage || '',
                        published: shouldPublish
                    }),
                // Enforce minimum 3 second delay if publishing
                shouldPublish ? new Promise(resolve => setTimeout(resolve, 3000)) : Promise.resolve()
            ])

            setLastSaved(new Date())

            if (shouldPublish && result) {
                // Redirect to Blog Feed (or specific post if route existed)
                const subdomain = settings?.subdomain || 'blog'
                navigate(`/${subdomain}/${result.slug}`)
            }
        } catch (error) {
            console.error('Failed to save post:', error)
            const msg = (error as Error).message

            if (msg.includes('User not authenticated') || msg.includes('row-level security')) {
                alert('Session expired. Redirecting to login...')
                await logout()
                navigate('/login')
            } else {
                alert(`Failed to save post: ${msg}`)
            }
            setIsPublishing(false) // Reset on error
        } finally {
            setSaving(false)
            // Note: Don't reset isPublishing here if successful, to keep overlay until nav
        }
    }

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'var(--bg-primary)'
            }}>
                <WaveLoader />
            </div>
        )
    }

    // Full Screen Glitch Overlay
    if (isPublishing) {
        return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000' }}>
                <LetterGlitch
                    glitchSpeed={50}
                    centerVignette={true}
                    outerVignette={false}
                    smooth={true}
                />
            </div>
        )
    }

    return (
        <div className="editor-page" style={{
            color: 'var(--text-primary)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
            {/* Top Navigation & Toolbar */}
            <nav style={{
                position: 'sticky',
                top: 0,
                backgroundColor: 'var(--bg-primary)',
                borderBottom: '1px solid var(--border-color)',
                padding: '0.75rem 1.5rem',
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                zIndex: 50
            }}>
                {/* Left: Back & Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    {lastSaved && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                            Saved
                        </div>
                    )}
                </div>

                {/* Center: Formatting Toolbar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    color: 'var(--text-secondary)'
                }}>
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand('undo')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                        title="Undo"
                    >
                        <Undo size={18} />
                    </button>
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand('redo')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                        title="Redo"
                    >
                        <Redo size={18} />
                    </button>

                    <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }} />

                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand('bold')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                        title="Bold"
                    >
                        <Bold size={18} />
                    </button>
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand('italic')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                        title="Italic"
                    >
                        <Italic size={18} />
                    </button>
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                    {/* Continue Button: Premium Glow Effect */}
                    <button
                        onClick={() => handleSave(true)}
                        onMouseEnter={() => setIsContinueHovered(true)}
                        onMouseLeave={() => setIsContinueHovered(false)}
                        disabled={saving}
                        style={{
                            background: theme === 'dark' ? '#ffffff' : '#000000', // Invert based on theme for max contrast
                            color: theme === 'dark' ? '#000000' : '#ffffff',
                            border: 'none',
                            padding: '0.6rem 1.8rem',
                            borderRadius: '50px',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.7 : 1,
                            transition: 'all 0.3s ease',
                            // The Glow:
                            boxShadow: isContinueHovered && !saving
                                ? (theme === 'dark'
                                    ? '0 0 20px rgba(255, 255, 255, 0.4), 0 0 10px rgba(255, 255, 255, 0.2)'
                                    : '0 0 20px rgba(0, 0, 0, 0.3), 0 0 10px rgba(0, 0, 0, 0.1)')
                                : 'none'
                        }}
                    >
                        {saving ? 'Publishing...' : 'Continue'}
                    </button>
                </div>
            </nav>

            {/* Main Editor Area */}
            <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem' }}>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="editor-title-input"
                    style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        fontSize: '5rem', // Increased size as requested
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: '1rem',
                        background: 'transparent',
                        fontFamily: 'serif'
                    }}
                />

                {/* Subtitle removed as per request */}

                {/* ContentEditable Div for Rich Text */}
                <div
                    ref={contentRef}
                    contentEditable
                    className="editor-content-editable"
                    data-placeholder="Start writing..."
                    style={{
                        width: '100%',
                        minHeight: '60vh',
                        outline: 'none',
                        fontSize: '1.35rem', // Increased size
                        lineHeight: '1.6',
                        color: 'var(--text-primary)',
                        background: 'transparent',
                        fontFamily: 'serif',
                        whiteSpace: 'pre-wrap'
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Tab') {
                            e.preventDefault()
                            document.execCommand('insertText', false, '\t')
                        }
                    }}
                />
            </div>



            <style>{`
                .editor-content-editable:empty:before {
                    content: attr(data-placeholder);
                    color: var(--text-muted);
                    pointer-events: none;
                }
            `}</style>
        </div>
    )
}
