import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { postService } from '../../services/postService'
import {
    ChevronLeft,
    Undo,
    Redo,
    Bold,
    Italic,
    Underline,

    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Image as ImageIcon,
    Quote,
} from 'lucide-react'
import EditorSkeleton from '../../components/admin/skeletons/EditorSkeleton'
import DecryptedText from '../../components/common/animations/DecryptedText'
import { useThemeStore } from '../../stores/themeStore'
import { useAuthStore } from '../../stores/authStore'
import { useAdminStore } from '../../stores/adminStore'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'

interface ModalConfig {
    isOpen: boolean;
    type: 'link' | null;
    inputValue: string;
}

interface EditorInputModalProps {
    config: ModalConfig;
    onClose: () => void;
    onConfirm: () => void;
    onChange: (value: string) => void;
}

function EditorInputModal({ config, onClose, onConfirm, onChange }: EditorInputModalProps) {
    if (!config.isOpen) return null;

    return (
        <div className="editor-modal-overlay">
            <div className="editor-modal">
                <h3>Insert Link</h3>
                <input
                    type="text"
                    placeholder="https://example.com"
                    value={config.inputValue}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') onConfirm();
                        if (e.key === 'Escape') onClose();
                    }}
                    autoFocus
                />
                <div className="editor-modal-actions">
                    <button onClick={onClose} className="btn-cancel">Cancel</button>
                    <button onClick={onConfirm} className="btn-confirm">Confirm</button>
                </div>
            </div>
        </div>
    )
}

interface ImageContextMenuProps {
    visible: boolean;
    x: number;
    y: number;
    onDelete: () => void;
}

function ImageContextMenu({ visible, x, y, onDelete }: ImageContextMenuProps) {
    if (!visible) return null;
    return (
        <div
            className="image-context-menu"
            style={{
                position: 'fixed',
                top: y,
                left: x,
                zIndex: 10000,
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                animation: 'fadeIn 0.1s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                onClick={onDelete}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    Delete Image
                </div>
            </button>
        </div>
    )
}

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


    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: 'link' | null;
        inputValue: string;
    }>({ isOpen: false, type: null, inputValue: '' });


    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        target: HTMLImageElement | null;
    }>({ visible: false, x: 0, y: 0, target: null });

    const savedSelection = useRef<Range | null>(null);

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
        fetchPost()
    }, [id])


    useEffect(() => {
        const handleClick = () => setContextMenu(prev => ({ ...prev, visible: false }));
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const handleContextMenu = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).tagName === 'IMG') {
            e.preventDefault();
            setContextMenu({
                visible: true,
                x: e.clientX,
                y: e.clientY,
                target: e.target as HTMLImageElement
            });
        }
    };

    const handleDeleteImage = () => {
        if (contextMenu.target) {
            contextMenu.target.remove();
            setContextMenu(prev => ({ ...prev, visible: false }));

            if (contentRef.current) {
                contentRef.current.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    };

    const handleContentClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'IMG') {
            const selection = window.getSelection();
            if (!selection) return;
            const range = document.createRange();
            range.setStartAfter(target);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };


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

    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            savedSelection.current = selection.getRangeAt(0);
        } else {
            savedSelection.current = null;
        }
    }

    const restoreSelection = () => {
        const selection = window.getSelection();
        if (selection && savedSelection.current) {
            selection.removeAllRanges();
            selection.addRange(savedSelection.current);
        }
    }

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {

            const url = await postService.uploadImage(file)
            if (url) {
                restoreSelection()

                setTimeout(() => {

                    executeCommand('insertHTML', `<p><br></p><img src="${url}" alt="Uploaded image" /><p><br></p>`)
                }, 50)
            } else {
                alert('Failed to upload image')
            }
        } catch (error) {
            console.error('Image upload failed:', error)
            alert('Image upload failed')
        } finally {

            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleLink = () => {
        saveSelection();
        setModalConfig({ isOpen: true, type: 'link', inputValue: '' });
    }

    const handleImage = () => {
        saveSelection();

        fileInputRef.current?.click()
    }

    const handleModalClose = () => {
        setModalConfig({ isOpen: false, type: null, inputValue: '' });

        setTimeout(() => {
            contentRef.current?.focus();
            if (savedSelection.current) restoreSelection();
        }, 0);
    }

    const handleModalConfirm = () => {
        const { type, inputValue } = modalConfig;



        setTimeout(() => {
            restoreSelection();
            if (type === 'link') {
                if (inputValue) executeCommand('createLink', inputValue);
            }
        }, 10);
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

            await useAdminStore.getState().fetchPosts(true)

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
            } else if (msg.includes('posts_slug_key') || msg.includes('duplicate key')) {
                alert('Duplicate title: A post with this title already exists. Please choose a different title.')
            } else {
                alert(`Failed to save post: ${msg}`)
            }
            setIsPublishing(false)
        } finally {
            setSaving(false)
        }
    }
    if (loading) {
        return <EditorSkeleton />
    }

    function PublishingScreen() {
        useLockBodyScroll()
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                backgroundColor: 'var(--bg-primary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)'
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
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
            />
            <EditorInputModal
                config={modalConfig}
                onClose={handleModalClose}
                onConfirm={handleModalConfirm}
                onChange={(val) => setModalConfig(prev => ({ ...prev, inputValue: val }))}
            />

            <ImageContextMenu
                visible={contextMenu.visible}
                x={contextMenu.x}
                y={contextMenu.y}
                onDelete={handleDeleteImage}
            />

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

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-secondary)',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    paddingRight: '1rem',
                    maskImage: 'linear-gradient(to right, black 90%, transparent 100%)'
                }}>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => executeCommand('undo')} className="toolbar-btn" title="Undo"><Undo size={18} /></button>
                        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => executeCommand('redo')} className="toolbar-btn" title="Redo"><Redo size={18} /></button>
                    </div>

                    <div className="toolbar-divider" />

                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => executeCommand('bold')} className="toolbar-btn" title="Bold"><Bold size={18} /></button>
                        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => executeCommand('italic')} className="toolbar-btn" title="Italic"><Italic size={18} /></button>
                        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => executeCommand('underline')} className="toolbar-btn" title="Underline"><Underline size={18} /></button>
                    </div>

                    <div className="toolbar-divider" />



                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => executeCommand('insertUnorderedList')} className="toolbar-btn" title="Bullet List"><List size={18} /></button>
                        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => executeCommand('insertOrderedList')} className="toolbar-btn" title="Numbered List"><ListOrdered size={18} /></button>
                        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => executeCommand('formatBlock', 'blockquote')} className="toolbar-btn" title="Quote"><Quote size={18} /></button>
                    </div>

                    <div className="toolbar-divider" />

                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => executeCommand('justifyLeft')} className="toolbar-btn" title="Align Left"><AlignLeft size={18} /></button>
                        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => executeCommand('justifyCenter')} className="toolbar-btn" title="Align Center"><AlignCenter size={18} /></button>
                        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => executeCommand('justifyRight')} className="toolbar-btn" title="Align Right"><AlignRight size={18} /></button>
                    </div>

                    <div className="toolbar-divider" />

                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={handleLink} className="toolbar-btn" title="Link"><LinkIcon size={18} /></button>
                        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={handleImage} className="toolbar-btn" title="Image"><ImageIcon size={18} /></button>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>

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

            <div style={{ maxWidth: '720px', margin: '0 auto', padding: '5rem 1.5rem 3rem 1.5rem' }}>
                <div
                    ref={titleRef}
                    contentEditable
                    className="editor-title-editable"
                    data-placeholder="Title"
                    onInput={(e) => setTitle(e.currentTarget.innerText)}
                    onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData.getData('text/plain');
                        document.execCommand('insertText', false, text);
                    }}
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
                    onContextMenu={handleContextMenu}
                    onClick={handleContentClick}
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
                .toolbar-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: inherit;
                    padding: 0.4rem;
                    border-radius: 6px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .toolbar-btn:hover {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }
                .toolbar-divider {
                    width: 1px;
                    height: 20px;
                    background-color: var(--border-color);
                    margin: 0 0.25rem;
                }

                .editor-content-editable h1 { font-size: 2.5em; margin: 0.67em 0; font-weight: 700; line-height: 1.2; }
                .editor-content-editable h2 { font-size: 2em; margin: 0.75em 0; font-weight: 600; line-height: 1.3; }
                .editor-content-editable h3 { font-size: 1.5em; margin: 0.83em 0; font-weight: 600; line-height: 1.4; }
                .editor-content-editable p { margin: 1em 0; }
                .editor-content-editable ul { list-style-type: disc; padding-left: 1.5em; margin: 1em 0; }
                .editor-content-editable ol { list-style-type: decimal; padding-left: 1.5em; margin: 1em 0; }
                .editor-content-editable blockquote {
                    border-left: 4px solid var(--border-color);
                    padding-left: 1rem;
                    margin: 1rem 0;
                    font-style: italic;
                    color: var(--text-secondary);
                }
                .editor-content-editable img {
                    max-width: 100% !important;
                    height: auto !important;
                    border-radius: 8px;
                    margin: 1rem 0;
                    display: block;
                }
                .editor-content-editable a {
                    color: var(--accent-primary);
                    text-decoration: underline;
                }

                @media (max-width: 499px) {
                    .editor-page nav {
                        padding: 0.75rem 1rem !important;
                        grid-template-columns: auto 1fr auto !important;
                        gap: 1rem;
                    }
                    .editor-page nav > div:first-child button {
                        width: 36px !important;
                        height: 36px !important;
                    }
                    .editor-page nav > div:nth-child(2) {
                        display: flex !important;
                        justify-content: flex-start !important;
                        align-items: center !important;
                        overflow-x: auto !important;
                        width: 100%;
                        -webkit-overflow-scrolling: touch;
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
                        padding-bottom: 200px !important;
                    }
                    .editor-page > div:last-of-type {
                        padding: 2rem 1rem 2rem 1rem !important;
                    }
                }


                .editor-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                }
                .editor-modal {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    padding: 1.5rem;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 400px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .editor-modal h3 {
                    margin: 0 0 1rem 0;
                    font-size: 1.2rem;
                    font-weight: 600;
                }
                .editor-modal input {
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 1rem;
                    margin-bottom: 1.5rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .editor-modal input:focus {
                    border-color: var(--accent-primary, #0070f3);
                }
                .editor-modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                }
                .editor-modal button {
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-cancel {
                    background: transparent;
                    border: 1px solid var(--border-color);
                    color: var(--text-secondary);
                }
                .btn-cancel:hover {
                    background: var(--bg-tertiary, #f3f4f6);
                    color: var(--text-primary);
                }
                .btn-confirm {
                    background: var(--text-primary);
                    color: var(--bg-primary);
                    border: 1px solid var(--text-primary);
                }
                .btn-confirm:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }
                @keyframes modalPop {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    )
}

