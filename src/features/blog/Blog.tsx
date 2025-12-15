import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams, useParams, useNavigate } from 'react-router-dom'
import { postService } from '../../services/postService'
import { settingsService } from '../../services/settingsService'
import DOMPurify from 'dompurify'
import { supabase } from '../../lib/supabase'
import type { Post } from '../../types'
import { format } from 'date-fns'
import ThemeToggle from '../../components/common/ui/ThemeToggle'
import { Share2, Twitter, Linkedin, Github, Globe, ArrowLeft } from 'lucide-react'
import { useToast } from '../../components/common/feedback/Toast'
import { useCodeCopy } from '../../hooks/useCodeCopy'
import SubscribeModal from '../../components/common/ui/SubscribeModal'
interface BlogProps {
    isCustomDomain?: boolean
}
export default function Blog({ isCustomDomain = false }: BlogProps) {
    const { slug, subdomain } = useParams()
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [searchParams, setSearchParams] = useSearchParams()
    const [searchTerm, setSearchTerm] = useState('')
    const [blogTitle, setBlogTitle] = useState('DyeInk')
    const [twitterLink, setTwitterLink] = useState<string | null>(null)
    const [linkedinLink, setLinkedinLink] = useState<string | null>(null)
    const [githubLink, setGithubLink] = useState<string | null>(null)
    const [websiteLink, setWebsiteLink] = useState<string | null>(null)
    const [newsletterEmail, setNewsletterEmail] = useState<string | null>(null)
    const [blogId, setBlogId] = useState<number | null>(null)
    const { addToast } = useToast()
    const [isSubscribeOpen, setIsSubscribeOpen] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)
    useCodeCopy(contentRef)
    const itemsPerPage = 5
    const currentPage = parseInt(searchParams.get('page') || '1')
    const navigate = useNavigate()
    useEffect(() => {
        const loadData = async () => {
            try {
                let userConfig = null
                if (isCustomDomain) {
                    const hostname = window.location.hostname
                    userConfig = await settingsService.getSettingsByCustomDomain(hostname)
                } else if (subdomain) {
                    userConfig = await settingsService.getSettingsBySubdomain(subdomain)
                }
                if (userConfig) {
                    const { settings, userId } = userConfig
                    if (settings.siteName) setBlogTitle(settings.siteName)
                    setTwitterLink(settings.twitterLink || null)
                    setLinkedinLink(settings.linkedinLink || null)
                    setGithubLink(settings.githubLink || null)
                    setWebsiteLink(settings.websiteLink || null)
                    setNewsletterEmail(settings.newsletterEmail || null)
                    setBlogId(settings.id || null)
                    const fetchedPosts = await postService.getPosts({ userId, publishedOnly: true })
                    setPosts(fetchedPosts)
                    if (slug && fetchedPosts.length > 0) {
                        const activePost = fetchedPosts.find(p => p.slug === slug)
                        if (activePost) {
                            const currentViews = activePost.views || 0
                            supabase
                                .from('posts')
                                .update({ views: currentViews + 1 })
                                .eq('id', activePost.id)
                                .then(({ error }) => {
                                    if (error) {
                                        console.error('VIEW ERROR:', error)
                                        console.error('Run v42_disable_rls.sql in Supabase!')
                                    } else {
                                    }
                                })
                            const today = format(new Date(), 'yyyy-MM-dd')
                            supabase.rpc('increment_daily_views', {
                                p_post_id: activePost.id,
                                p_date: today
                            }).then(({ error }) => {
                                if (error) console.error('Stats Update Error (RPC):', error)
                            })
                        }
                    }
                } else {
                    if (isCustomDomain || subdomain) {
                        setBlogTitle('User Not Found')
                    } else {
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
            { }
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 0,
                background: 'radial-gradient(circle at 10% 10%, var(--bg-secondary), var(--bg-primary))'
            }} />
            { }
            <div className="blog-theme-toggle-wrapper" style={{
                position: 'fixed',
                top: '2rem',
                right: '2rem',
                zIndex: 100,
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--bg-secondary)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <ThemeToggle />
            </div>
            { }
            <div style={{ position: 'relative', zIndex: 10, maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem', display: 'grid', gridTemplateColumns: 'minmax(200px, 250px) 1fr', gap: '4rem' }}>
                { }
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
                            { }
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {slug ? (
                            <Link to={subdomain ? `/${subdomain}` : "/blog"} className="sidebar-link" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ArrowLeft size={16} /> {subdomain ? '' : 'All Posts'}
                            </Link>
                        ) : !isCustomDomain && (
                            <Link to="/" className="sidebar-link" style={{ fontSize: '0.95rem' }}>
                                Home
                            </Link>
                        )}
                        {newsletterEmail && (
                            <button
                                onClick={() => setIsSubscribeOpen(true)}
                                className="sidebar-link"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontFamily: 'inherit',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                Subscribe by email
                            </button>
                        )}
                        {!slug && (
                            <div style={{ margin: '0.5rem 0' }}>
                                <input
                                    type="text"
                                    placeholder="Search here..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value)
                                        setSearchParams({ page: '1' })
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
                        { }
                        { }
                    </div>
                </aside>
                { }
                <main ref={contentRef} style={{ paddingTop: '0.4rem' }}> { }
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
                                        { }
                                        <h2 style={{
                                            fontFamily: "'Gabarito', sans-serif",
                                            fontSize: '1.6rem',
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
                                    { }
                                    { }
                                    <div
                                        className="post-content"
                                    >
                                        <div style={{
                                            color: 'var(--text-secondary)',
                                            lineHeight: 1.6,
                                            fontSize: '0.95rem',
                                            maxWidth: '700px'
                                        }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
                                    </div>
                                    { }
                                    <div style={{
                                        marginTop: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingTop: 0
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            { }
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
                                                    const currentShares = post.shares || 0
                                                    supabase.from('posts').update({ shares: currentShares + 1 }).eq('id', post.id).then(({ error }) => {
                                                        if (error) console.error('SHARE ERROR:', error)
                                                    })
                                                    const today = format(new Date(), 'yyyy-MM-dd')
                                                    supabase.from('daily_post_stats')
                                                        .select('id, shares')
                                                        .eq('post_id', post.id)
                                                        .eq('date', today)
                                                        .single()
                                                        .then(({ data: daily }) => {
                                                            if (daily) {
                                                                supabase.from('daily_post_stats')
                                                                    .update({ shares: (daily.shares || 0) + 1 })
                                                                    .eq('id', daily.id)
                                                                    .then(r => r.error && console.error('Graph Share Update Fail:', r.error))
                                                            } else {
                                                                supabase.from('daily_post_stats')
                                                                    .insert({
                                                                        post_id: post.id,
                                                                        date: today,
                                                                        views: 0,
                                                                        shares: 1
                                                                    })
                                                                    .then(r => r.error && console.error('Graph Share Insert Fail:', r.error))
                                                            }
                                                        })
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
                            { }
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
            </div >
            { }
            < SubscribeModal
                isOpen={isSubscribeOpen}
                onClose={() => setIsSubscribeOpen(false)
                }
                blogId={blogId}
            />
            <style>{`
                .sidebar-link {
                    color: var(--text-secondary);
                    text-decoration: none;
                    font-size: 1rem;
                    transition: color 0.2s;
                }
                .sidebar-link:hover {
                    color: var(--text-primary);
                    text-decoration: underline;
                }
                .post-content a {
                    color: var(--text-primary);
                    text-decoration: underline;
                }
                @media (max-width: 499px) {
                    div[style*="grid-template-columns"] {
                        grid-template-columns: 1fr !important;
                        gap: 1.5rem !important;
                        padding: 1.5rem 1rem !important;
                    }
                    aside {
                        position: relative !important;
                        top: 0 !important;
                        padding-bottom: 1rem !important;
                        margin-bottom: 0.5rem;
                    }
                    aside > div:first-child {
                        margin-bottom: 0.75rem !important;
                    }
                    aside > div:first-child a {
                        font-size: 1.5rem !important;
                    }
                    aside > div:last-child > div:last-child {
                        flex-direction: row !important;
                        gap: 1.25rem !important;
                        margin-top: 0.75rem !important;
                    }
                    main {
                        padding-top: 0 !important;
                    }
                    main > div {
                        gap: 3rem !important;
                    }
                    article {
                        gap: 1rem !important;
                        padding-bottom: 2rem !important;
                    }
                    article h2 {
                        font-size: 1.3rem !important;
                    }
                    .blog-theme-toggle-wrapper {
                        top: 1rem !important;
                        right: 1rem !important;
                        width: 36px !important;
                        height: 36px !important;
                    }
                    .blog-theme-toggle-wrapper button {
                        width: 36px !important;
                        height: 36px !important;
                    }
                }
            `}</style>
        </div>
    )
}

