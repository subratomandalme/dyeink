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
                    overflow: 'hidden'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Title</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                                <th style={{ padding: '1rem', width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPosts.map((post) => (
                                <tr key={post.id} className="hover-row">
                                    <td style={{ padding: '1.25rem 1rem', verticalAlign: 'middle', maxWidth: '300px' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            <Link to={`/admin/posts/${post.id}/edit`} style={{ color: 'inherit', textDecoration: 'none' }} title={post.title}>
                                                {post.title}
                                            </Link>
                                        </div>

                                    </td>
                                    <td style={{ padding: '1.25rem 1rem', verticalAlign: 'middle' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '0.25rem 0.6rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            backgroundColor: post.published ? 'var(--success-bg)' : 'var(--warning-bg)',
                                            color: post.published ? 'var(--success)' : 'var(--warning)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.025em'
                                        }}>
                                            {post.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem', verticalAlign: 'middle' }}>
                                        {format(new Date(post.createdAt), 'MMM d, yyyy')}
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem', textAlign: 'right', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <Link
                                                to={`/admin/posts/${post.id}/edit`}
                                                style={{
                                                    padding: '0.4rem',
                                                    color: 'var(--text-muted)',
                                                    borderRadius: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </Link>
                                            <button
                                                onClick={() => initiateDelete(post.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    padding: '0.4rem',
                                                    color: 'var(--error)',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center'
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
