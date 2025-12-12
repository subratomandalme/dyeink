import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { postsApi } from '../../services/api'
import type { Post } from '../../types'
import { format } from 'date-fns'

export default function PostView() {
    const { slug } = useParams<{ slug: string }>()
    const [post, setPost] = useState<Post | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchPost = async () => {
            if (!slug) return
            try {
                const response = await postsApi.getBySlug(slug)
                setPost(response.post)
            } catch {
                setError('Post not found')
            } finally {
                setLoading(false)
            }
        }
        fetchPost()
    }, [slug])

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
            </div>
        )
    }

    if (error || !post) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>{error || 'Post not found'}</div>
                <Link to="/" className="btn btn-secondary">← Back to Home</Link>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh' }}>
            <header style={{
                padding: '1.5rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px dashed var(--border-color)',
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(12px)',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(135deg, #8a5cff, #ff5c7a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    DyeInk
                </Link>
            </header>

            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }} className="animate-fade-in">
                {post.coverImage && (
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}
                    />
                )}

                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.3 }}>{post.title}</h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
                    {post.user && <span>By {post.user.name}</span>}
                    {post.publishedAt && (
                        <>
                            <span>·</span>
                            <span>{format(new Date(post.publishedAt), 'MMMM d, yyyy')}</span>
                        </>
                    )}
                </div>

                <article
                    style={{ fontSize: '1.125rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px dashed var(--border-color)' }}>
                    <Link to="/" className="btn btn-ghost">← Back to all posts</Link>
                </div>
            </main>
        </div>
    )
}
