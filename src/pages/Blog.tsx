import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams, useParams, useNavigate } from 'react-router-dom'
import { postService } from '../services/postService'
import { settingsService } from '../services/settingsService'

import { supabase } from '../lib/supabase'
import type { Post } from '../types'
import { format } from 'date-fns'
// import ColorBends from '../components/common/ColorBends'
import ThemeToggle from '../components/common/ThemeToggle'
import { Share2, Twitter, Linkedin, Github, Globe, ArrowLeft, Mail } from 'lucide-react'
import { useToast } from '../components/common/Toast'
import { useCodeCopy } from '../hooks/useCodeCopy'
import SubscribeModal from '../components/common/SubscribeModal'
//

interface BlogProps {
    isCustomDomain?: boolean
}

export default function Blog({ isCustomDomain = false }: BlogProps) {
    const { slug, subdomain } = useParams()
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [searchParams, setSearchParams] = useSearchParams()
    const [searchTerm, setSearchTerm] = useState('')
    const [blogTitle, setBlogTitle] = useState('DyeInk') // Default fallback
    const [twitterLink, setTwitterLink] = useState<string | null>(null)
    const [linkedinLink, setLinkedinLink] = useState<string | null>(null)
    const [githubLink, setGithubLink] = useState<string | null>(null)
    const [websiteLink, setWebsiteLink] = useState<string | null>(null)
    const [newsletterEmail, setNewsletterEmail] = useState<string | null>(null)
    const [blogId, setBlogId] = useState<number | null>(null) // Added this state variable
    const { addToast } = useToast()

    // Modals
    const [isSubscribeOpen, setIsSubscribeOpen] = useState(false)

    // Code Copy Hook Ref
    const contentRef = useRef<HTMLDivElement>(null)
    useCodeCopy(contentRef)

    // Pagination State
    const itemsPerPage = 5
    const currentPage = parseInt(searchParams.get('page') || '1')

    const navigate = useNavigate()

    useEffect(() => {
        const loadData = async () => {
            try {
                let userConfig = null

                if (isCustomDomain) {
                    // Custom Domain Strategy
                    const hostname = window.location.hostname
                    userConfig = await settingsService.getSettingsByCustomDomain(hostname)
                } else if (subdomain) {
                    // Subdomain Strategy
                    userConfig = await settingsService.getSettingsBySubdomain(subdomain)
                }

                if (userConfig) {
                    const { settings, userId } = userConfig

                    // Apply User Branding
                    if (settings.siteName) setBlogTitle(settings.siteName)
                    setTwitterLink(settings.twitterLink || null)
                    setLinkedinLink(settings.linkedinLink || null)
                    setGithubLink(settings.githubLink || null)
                    setWebsiteLink(settings.websiteLink || null)
                    setNewsletterEmail(settings.newsletterEmail || null)
                    setBlogId(settings.id || null)

                    // Fetch Posts for THIS user only
                    const fetchedPosts = await postService.getPosts({ userId, publishedOnly: true })
                    setPosts(fetchedPosts)

                    // High-Scale View Tracking (Single Post Only)
                    if (slug && fetchedPosts.length > 0) {
                        const activePost = fetchedPosts.find(p => p.slug === slug)
                        if (activePost) {
                            // Use RPC for atomic update + security definer bypass of RLS
                            // This ensures anonymous users can count views
                            supabase.rpc('increment_post_view', { post_id: activePost.id })
                                .then(({ error }) => {
                                    if (error) {
                                        console.error('View Increment ERROR:', error)
                                        console.error('This usually means the DB function is missing. Run fix_stats_fully.sql')
                                    } else {
                                        console.log('View incremented successfully.')
                                    }
                                })
                        }
                    }
                } else {
                    // ...
                    // Not found logic
                    if (isCustomDomain || subdomain) {
                        setBlogTitle('User Not Found')
                        // Optional: Navigate to 404
                    } else {
                        // No context provided (e.g. /blog route without subdomain param and not custom domain mode?)
                        // Actually /blog maps to 'All Posts' or global feed in some concepts, 
                        // but here it seems strict tenant.
                        // For now, if no config found, we just show empty or redirect.
                        navigate('/')
                        return
                    }
                }

            } catch (error) {
                console.error('Failed to load data:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [subdomain, navigate, isCustomDomain, slug])

    // Search & Pagination Logic - Filter by Search AND Published status
    const filteredPosts = posts.filter(post => {
        if (!post.published) return false
        if (slug) return post.slug === slug
        return post.title.toLowerCase().includes(searchTerm.toLowerCase())
    })

    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage)
    const indexOfLastPost = currentPage * itemsPerPage
    const indexOfFirstPost = indexOfLastPost - itemsPerPage
    const currentPosts = slug ? filteredPosts : filteredPosts.slice(indexOfFirstPost, indexOfLastPost)

    const handlePageChange = (page: number) => {
        setSearchParams({ page: page.toString() })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
            {/* Background - Safe CSS Gradient */}
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 0,
                background: 'radial-gradient(circle at 10% 10%, var(--bg-secondary), var(--bg-primary))'
            }} />

            {/* Fixed Theme Toggle (Top Right) */}
            <div style={{
                position: 'fixed',
                top: '2rem',
                right: '2rem',
                zIndex: 100,
                border: '1px solid var(--border-color)',
                borderRadius: '50%', // Circle
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--bg-secondary)', // Ensure visibility
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <ThemeToggle />
            </div>

            {/* Content Wrapper */}
            <div style={{ position: 'relative', zIndex: 10, maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem', display: 'grid', gridTemplateColumns: 'minmax(200px, 250px) 1fr', gap: '4rem' }}>

                {/* Sidebar (Left) */}
                <aside style={{ position: 'sticky', top: '4rem', height: 'fit-content' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <Link to="/" style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.75rem',
                                fontWeight: 800,
                                color: 'var(--text-primary)',
                                display: '-webkit-box',
                                letterSpacing: '-0.03em',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                wordBreak: 'break-word',
                                lineHeight: 1.2
                            }}>
                                {blogTitle}
                            </Link>
                            {/* ThemeToggle removed from here, moved to fixed position */}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {slug ? (
                            <Link to={subdomain ? `/${subdomain}` : "/blog"} className="sidebar-link" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ArrowLeft size={16} /> {subdomain ? 'Back to Blog' : 'All Posts'}
                            </Link>
                        ) : (
                            <Link to="/" className="sidebar-link" style={{ fontSize: '0.95rem' }}>
                                Home
                            </Link>
                        )}

                        {!slug && (
                            <div style={{ margin: '0.5rem 0' }}>
                                <input
                                    type="text"
                                    placeholder="Search here..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value)
                                        setSearchParams({ page: '1' }) // Reset to page 1 on search
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        fontSize: '0.9rem',
                                        border: '1px solid var(--border-color)',
                                        background: 'transparent',
                                        borderRadius: '4px',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>
                        )}

                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                            {newsletterEmail && (
                                <button
                                    onClick={() => setIsSubscribeOpen(true)}
                                    title="Subscribe to Newsletter"
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: 0,
                                        cursor: 'pointer',
                                        color: 'var(--text-secondary)',
                                        transition: 'color 0.2s',
                                        display: 'inline-flex'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                >
                                    <Mail size={20} />
                                </button>
                            )}
                            {twitterLink && (
                                <a
                                    href={twitterLink.startsWith('http') ? twitterLink : `https://${twitterLink}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: 'var(--text-secondary)',
                                        transition: 'color 0.2s',
                                        display: 'inline-flex'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                    title="Follow on X / Twitter"
                                >
                                    <Twitter size={20} />
                                </a>
                            )}
                            {linkedinLink && (
                                <a
                                    href={linkedinLink.startsWith('http') ? linkedinLink : `https://${linkedinLink}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: 'var(--text-secondary)',
                                        transition: 'color 0.2s',
                                        display: 'inline-flex'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                    title="Connect on LinkedIn"
                                >
                                    <Linkedin size={20} />
                                </a>
                            )}
                            {githubLink && (
                                <a
                                    href={githubLink.startsWith('http') ? githubLink : `https://${githubLink}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: 'var(--text-secondary)',
                                        transition: 'color 0.2s',
                                        display: 'inline-flex'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                    title="View on GitHub"
                                >
                                    <Github size={20} />
                                </a>
                            )}
                            {websiteLink && (
                                <a
                                    href={websiteLink.startsWith('http') ? websiteLink : `https://${websiteLink}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: 'var(--text-secondary)',
                                        transition: 'color 0.2s',
                                        display: 'inline-flex'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                    title="Visit Website"
                                >
                                    <Globe size={20} />
                                </a>
                            )}
                        </div>

                        {/* Archive link removed/commented out */}
                        {/* <Link to="/archive" className="sidebar-link" style={{ fontSize: '0.95rem' }}>Browse the Archive »</Link> */}
                    </div>
                </aside>

                {/* Main Feed (Right) */}
                <main ref={contentRef} style={{ paddingTop: '0.4rem' }}> {/* Adjusted alignment */}
                    {loading ? (
                        <div style={{ padding: '2rem 0', color: 'var(--text-muted)' }}>Loading...</div>
                    ) : posts.length === 0 ? (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 500 }}>
                            No posts published yet.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6rem' }}>
                            {currentPosts.map((post, index) => (
                                <article key={post.id} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem', borderBottom: index < currentPosts.length - 1 ? '1px dashed var(--border-color)' : 'none' }}>
                                    <header>
                                        {/* Title */}
                                        <h2 style={{
                                            fontFamily: "'Gabarito', sans-serif",
                                            fontSize: '1.6rem', // Less than Sidebar Name (1.75rem)
                                            fontWeight: 800,
                                            lineHeight: 1.1,
                                            marginBottom: '0.75rem',
                                            letterSpacing: '-0.02em',
                                            color: 'var(--text-primary)',
                                            textWrap: 'balance',
                                            overflowWrap: 'anywhere',
                                            wordBreak: 'break-word'
                                        }}>
                                            {slug ? post.title : <Link to={subdomain ? `/${subdomain}/${post.slug}` : `/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>{post.title}</Link>}
                                        </h2>
                                    </header>

                                    {/* Full Content */}
                                    {/* Full Content */}
                                    <div
                                        className="post-content"
                                    >
                                        <div style={{ // HTML Content
                                            color: 'var(--text-secondary)',
                                            lineHeight: 1.6, // Adjusted for smaller text
                                            fontSize: '0.95rem', // Matches Subscribe Text
                                            maxWidth: '700px'
                                        }} dangerouslySetInnerHTML={{ __html: post.content }} />
                                    </div>

                                    {/* Combined Footer: Upvote + Share + Date */}
                                    <div style={{
                                        marginTop: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingTop: 0 // Removed padding and border
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {/* Upvote removed */}

                                            <button
                                                onClick={() => {
                                                    const path = subdomain ? `/${subdomain}/${post.slug}` : `/blog/${post.slug}`
                                                    const permalink = window.location.origin + path
                                                    navigator.clipboard.writeText(permalink)
                                                    addToast({
                                                        type: 'success',
                                                        message: 'Link copied to clipboard',
                                                        duration: 2000
                                                    })
                                                    // RPC call for shares
                                                    supabase.rpc('increment_shares', { post_id: post.id })
                                                }}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: 'var(--text-secondary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem',
                                                    fontSize: '0.85rem',
                                                    padding: 0,
                                                    transition: 'color 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                            >
                                                <Share2 size={16} /> Share
                                            </button>
                                        </div>

                                        <div style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.8rem',
                                            color: 'var(--text-muted)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : null}
                                        </div>
                                    </div>
                                </article>
                            ))}

                            {/* Pagination Controls */}
                            {!slug && totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', marginTop: '2rem' }}>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                        <button
                                            key={number}
                                            onClick={() => handlePageChange(number)}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '4px',
                                                border: '1px solid var(--border-color)',
                                                background: currentPage === number ? 'var(--text-primary)' : 'transparent',
                                                color: currentPage === number ? 'var(--bg-primary)' : 'var(--text-primary)',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: 600
                                            }}
                                        >
                                            {number}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Subscribe Modal - Multi-Tenant Enabled */}
            <SubscribeModal
                isOpen={isSubscribeOpen}
                onClose={() => setIsSubscribeOpen(false)}
                blogId={blogId}
            />

            <style>{`
    .sidebar-link {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 1rem;
    transition: color 0.2s;
}
                .sidebar - link:hover {
    color: var(--text - primary);
    text - decoration: underline;
}
                .post - content a {
    color: var(--text - primary);
    text - decoration: underline;
}
@media(max - width: 768px) {
    div[style *= "grid-template-columns"] {
        grid - template - columns: 1fr!important; /* Stack on mobile */
        gap: 2rem!important;
    }
                    aside {
        position: relative!important;
        top: 0!important;
        border - bottom: 1px solid var(--border - color);
        padding - bottom: 2rem;
    }
}
`}</style>
        </div>
    )
}
