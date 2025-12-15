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
import WaveLoader from '../../components/common/feedback/WaveLoader'
import DecryptedText from '../../components/common/animations/DecryptedText'
import { useThemeStore } from '../../stores/themeStore'
import { useAuthStore } from '../../stores/authStore'
import { useAdminStore } from '../../stores/adminStore'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
export default function Editor() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { logout } = useAuthStore()
    const { theme } = useThemeStore()
    const { settings } = useAdminStore()
    const [title, setTitle] = useState('')
    const [excerpt, setExcerpt] = useState('')
    const [coverImage, setCoverImage] = useState('')
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [isContinueHovered, setIsContinueHovered] = useState(false)
    const [isBackHovered, setIsBackHovered] = useState(false)
    const [initialContent, setInitialContent] = useState('')

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
                    setInitialContent(post.content || '')
                }
            } catch (error) {
                console.error('Failed to load post:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchPost()
    }, [id])


    useEffect(() => {
        if (!loading && titleRef.current && contentRef.current) {

            if (titleRef.current.innerText.trim() === '') {
                titleRef.current.innerText = title
            }

            if (contentRef.current.innerHTML.trim() === '') {
                contentRef.current.innerHTML = initialContent
            }
        }

    }, [loading, initialContent])
    const contentRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLDivElement>(null)
    const executeCommand = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value)
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
                shouldPublish ? new Promise(resolve => setTimeout(resolve, 3000)) : Promise.resolve()
            ])
            setLastSaved(new Date())
            if (shouldPublish && result) {
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
            setIsPublishing(false)
        } finally {
            setSaving(false)
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

    function PublishingScreen() {
        useLockBodyScroll()
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                backgroundColor: '#000000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
            }}>
                <div style={{ fontSize: '2rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    <DecryptedText
                        text="Publishing..."
                        speed={80}
                        maxIterations={30}
                        animateOn="view"
                        revealDirection="center"
                    />
                </div>
                <div style={{ marginTop: '1rem', opacity: 0.5, fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>
                    <DecryptedText
                        text="PLEASE WAIT"
                        speed={50}
                        maxIterations={15}
                        animateOn="view"
                        revealDirection="end"
                    />
                </div>
            </div>
        )
    }

    if (isPublishing) {
        return <PublishingScreen />
    }
    return (
        <div className="editor-page" style={{
            color: 'var(--text-primary)',
            fontFamily: "'Roboto', sans-serif"
        }}>
            { }
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
                { }
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        onMouseEnter={() => setIsBackHovered(true)}
                        onMouseLeave={() => setIsBackHovered(false)}
                        style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            paddingRight: '3px',
                            boxShadow: isBackHovered
                                ? (theme === 'dark' ? '0 0 15px rgba(255, 255, 255, 0.3)' : '0 0 15px rgba(0, 0, 0, 0.15)')
                                : 'none',
                            transform: isBackHovered ? 'scale(1.05)' : 'scale(1)'
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
                { }
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    color: 'var(--text-secondary)'
                }}>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand('undo')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                        title="Undo"
                    >
                        <Undo size={18} />
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand('redo')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                        title="Redo"
                    >
                        <Redo size={18} />
                    </button>
                    <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }} />
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand('bold')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                        title="Bold"
                    >
                        <Bold size={18} />
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand('italic')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                        title="Italic"
                    >
                        <Italic size={18} />
                    </button>
                </div>
                { }
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                    { }
                    <button
                        onClick={() => handleSave(true)}
                        onMouseEnter={() => setIsContinueHovered(true)}
                        onMouseLeave={() => setIsContinueHovered(false)}
                        disabled={saving}
                        style={{
                            background: theme === 'dark' ? '#ffffff' : '#000000',
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
            { }
            <div style={{ maxWidth: '720px', margin: '0 auto', padding: '5rem 1.5rem 3rem 1.5rem' }}>
                <div
                    ref={titleRef}
                    contentEditable
                    className="editor-title-editable"
                    data-placeholder="Title"
                    onInput={(e) => setTitle(e.currentTarget.innerText)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                        }
                    }}
                    style={{
                        width: '100%',
                        outline: 'none',
                        fontSize: '3.5rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: '1rem',
                        background: 'transparent',
                        fontFamily: 'inherit',
                        lineHeight: '1.2'
                    }}
                />
                { }
                <div
                    ref={contentRef}
                    contentEditable
                    className="editor-content-editable"
                    data-placeholder="Start writing..."
                    style={{
                        width: '100%',
                        minHeight: '60vh',
                        outline: 'none',
                        fontSize: '1.2rem',
                        lineHeight: '1.6',
                        color: 'var(--text-primary)',
                        background: 'transparent',
                        fontFamily: 'inherit',
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
                .editor-content-editable:empty:before,
                .editor-title-editable:empty:before {
                    content: attr(data-placeholder);
                    color: var(--text-muted);
                    pointer-events: none;
                }
                .editor-title-editable {
                    transition: opacity 0.3s ease;
                }
                .editor-title-editable:empty:before {
                    font-size: 3.5rem; 
                    font-weight: 700;
                    opacity: 0.3;
                }
                @media (max-width: 499px) {
                    .editor-page nav {
                        padding: 0.75rem 1rem !important;
                    }
                    .editor-page nav > div:first-child button {
                        width: 36px !important;
                        height: 36px !important;
                    }
                    .editor-page nav > div:nth-child(2) {
                        display: flex !important;
                        justify-content: center !important;
                        align-items: center !important;
                    }
                    .editor-page nav > div:last-child button {
                        padding: 0.6rem 1rem !important;
                        font-size: 0.9rem !important;
                    }
                    .editor-title-editable {
                        font-size: 2rem !important;
                    }
                    .editor-title-editable:empty:before {
                        font-size: 2rem !important;
                    }
                    .editor-content-editable {
                        font-size: 1rem !important;
                        min-height: 50vh !important;
                    }
                    .editor-page > div:last-of-type {
                        padding: 2rem 1rem 2rem 1rem !important;
                    }
                }
            `}</style>
        </div>
    )
}

