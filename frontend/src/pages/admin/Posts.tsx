import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { postService } from '../../services/postService'
import { format } from 'date-fns'
import { Trash2, Edit2 } from 'lucide-react'
import { useToast } from '../../components/common/Toast'
import WaveLoader from '../../components/common/WaveLoader'
import { useAdminStore } from '../../store/adminStore'

export default function Posts() {
    const { posts, fetchPosts, postsLoading, deletePostFromCache } = useAdminStore()

    useEffect(() => {
        fetchPosts()
    }, [])

    // Only show full page loader if we have no data at all
    const showLoader = postsLoading && !posts
    const safePosts = posts || []

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [postToDelete, setPostToDelete] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const { addToast } = useToast() // Assumed available via context or import

    const initiateDelete = (id: number) => {
        setPostToDelete(id)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!postToDelete) return
        setIsDeleting(true)
        try {
            await postService.deletePost(postToDelete)
            deletePostFromCache(postToDelete)
            // Only show toast if useToast is available, managing safe failure
            try { addToast({ type: 'success', message: 'Post deleted successfully' }) } catch (e) { }
            setShowDeleteModal(false)
        } catch (error) {
            console.error('Failed to delete post:', error)
            alert('Failed to delete post.')
        } finally {
            setIsDeleting(false)
            setPostToDelete(null)
        }
    }

    // Filter logic: Only Published
    const filteredPosts = safePosts.filter(post => post.published)

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem', paddingTop: '1rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Published Posts</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.1rem' }}>Manage your live content.</p>
            </div>

            {/* Table */}
            {showLoader ? (
                <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <WaveLoader />
                </div>
            ) : filteredPosts.length === 0 ? (
                <div style={{
                    padding: '4rem',
                    textAlign: 'center',
                    border: '1px dashed var(--border-color)',
                    borderRadius: '4px',
                    color: 'var(--text-muted)'
                }}>
                    No published posts yet.
                </div>
            ) : (
                <div style={{
                    borderRadius: '8px',
                    overflowX: 'auto', /* Enable horizontal scroll */
                    border: '1px solid var(--border-color)' /* Ensure bounds are visible */
                }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', textAlign: 'left', minWidth: '600px' /* Force minute width to trigger scroll */ }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid var(--border-color)' }}>Title</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid var(--border-color)' }}>Status</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid var(--border-color)' }}>Date</th>
                                <th style={{ padding: '1.25rem 1.5rem', width: '50px', borderBottom: '1px solid var(--border-color)' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPosts.map((post) => (
                                <tr key={post.id} className="hover-row" style={{ transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1.75rem 1.5rem', verticalAlign: 'middle', maxWidth: '400px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                                            <Link to={`/admin/posts/${post.id}/edit`} style={{ color: 'inherit', textDecoration: 'none' }} title={post.title}>
                                                {post.title}
                                            </Link>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.75rem 1.5rem', verticalAlign: 'middle', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '0.35rem 0.85rem',
                                            borderRadius: '50px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            backgroundColor: post.published ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                            color: post.published ? '#4ade80' : '#facc15',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            border: post.published ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(234, 179, 8, 0.2)'
                                        }}>
                                            {post.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.75rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', verticalAlign: 'middle', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        {format(new Date(post.createdAt), 'MMM d, yyyy')}
                                    </td>
                                    <td style={{ padding: '1.75rem 1.5rem', textAlign: 'right', verticalAlign: 'middle', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', opacity: 0.7 }}>
                                            <Link
                                                to={`/admin/posts/${post.id}/edit`}
                                                style={{
                                                    padding: '0.5rem',
                                                    color: 'var(--text-primary)',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    transition: 'all 0.2s',
                                                    background: 'var(--bg-tertiary)'
                                                }}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </Link>
                                            <button
                                                onClick={() => initiateDelete(post.id)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: 'none',
                                                    padding: '0.5rem',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    borderRadius: '50%',
                                                    transition: 'all 0.2s'
                                                }}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Premium Delete Modal */}
            {showDeleteModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '1rem',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '400px',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        transform: 'translateY(0)',
                        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                            Delete this post?
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5, fontSize: '0.95rem' }}>
                            This action cannot be undone. The post will be permanently removed from your blog.
                        </p>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    borderRadius: '50px',
                                    border: '1px solid var(--border-color)',
                                    background: 'transparent',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    fontSize: '0.9rem'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    borderRadius: '50px',
                                    border: 'none',
                                    background: '#ef4444',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    opacity: isDeleting ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
        </div>
    )
}
