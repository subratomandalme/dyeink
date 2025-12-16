import { useState, useEffect, FormEvent } from 'react'
import { domainsApi } from '../../services/api'
import type { Domain, DNSInstructions } from '../../types'
export default function Domains() {
    const [domains, setDomains] = useState<Domain[]>([])
    const [loading, setLoading] = useState(true)
    const [newDomain, setNewDomain] = useState('')
    const [adding, setAdding] = useState(false)
    const [instructions, setInstructions] = useState<{ [key: number]: DNSInstructions }>({})
    const [verifying, setVerifying] = useState<number | null>(null)
    useEffect(() => {
        fetchDomains()
    }, [])
    const fetchDomains = async () => {
        try {
            const response = await domainsApi.list()
            setDomains(response.domains)
        } catch (error) {
            console.error('Failed to fetch domains:', error)
        } finally {
            setLoading(false)
        }
    }
    const handleAdd = async (e: FormEvent) => {
        e.preventDefault()
        if (!newDomain.trim()) return
        setAdding(true)
        try {
            const response = await domainsApi.create({ domain: newDomain })
            setDomains([...domains, response.domain])
            setInstructions({ ...instructions, [response.domain.id]: response.instructions })
            setNewDomain('')
        } catch (error) {
            console.error('Failed to add domain:', error)
        } finally {
            setAdding(false)
        }
    }
    const handleVerify = async (id: number) => {
        setVerifying(id)
        try {
            const response = await domainsApi.verify(id)
            setDomains(domains.map(d => d.id === id ? response.domain : d))
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } }
            alert(error.response?.data?.error || 'Verification failed')
        } finally {
            setVerifying(null)
        }
    }
    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this domain?')) return
        try {
            await domainsApi.delete(id)
            setDomains(domains.filter(d => d.id !== id))
        } catch (error) {
            console.error('Failed to delete domain:', error)
        }
    }
    const showInstructions = async (id: number) => {
        if (instructions[id]) return
        try {
            const response = await domainsApi.getInstructions(id)
            setInstructions({ ...instructions, [id]: response.instructions })
        } catch (error) {
            console.error('Failed to get instructions:', error)
        }
    }
    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>

            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)', fontFamily: "'Jost', sans-serif" }}>Custom Domains</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.1rem' }}>Connect your own domain to your blog</p>
            </div>
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Add Domain</h3>
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        placeholder="blog.yourdomain.com"
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={adding || !newDomain.trim()}>
                        {adding ? 'Adding...' : 'Add Domain'}
                    </button>
                </form>
            </div>
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading...</div>
            ) : domains.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">🌐</div>
                        <div className="empty-state-title">No domains configured</div>
                        <p>Add a custom domain to access your blog from your own URL.</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {domains.map((domain) => (
                        <div key={domain.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: domain.verified ? 0 : '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '1.125rem', fontWeight: 500 }}>{domain.domain}</span>
                                    <span className={`badge ${domain.verified ? 'badge-success' : 'badge-warning'}`}>
                                        {domain.verified ? 'Verified' : 'Pending'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {!domain.verified && (
                                        <>
                                            <button onClick={() => showInstructions(domain.id)} className="btn btn-ghost">
                                                View DNS
                                            </button>
                                            <button onClick={() => handleVerify(domain.id)} className="btn btn-secondary" disabled={verifying === domain.id}>
                                                {verifying === domain.id ? 'Checking...' : 'Verify'}
                                            </button>
                                        </>
                                    )}
                                    <button onClick={() => handleDelete(domain.id)} className="btn btn-ghost" style={{ color: 'var(--error)' }}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                            {!domain.verified && instructions[domain.id] && (
                                <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginTop: '1rem' }}>
                                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>DNS Configuration</h4>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                        Add the following TXT record to your DNS settings:
                                    </p>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                        <div><strong>Type:</strong> {instructions[domain.id].type}</div>
                                        <div><strong>Name:</strong> {instructions[domain.id].name}</div>
                                        <div><strong>Value:</strong> {instructions[domain.id].value}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

