import axios from 'axios'
import { supabase } from '../lib/supabase'
import type {
    Post,
    PostListResponse,
    Domain,
    DNSInstructions,
    CreatePostInput,
    UpdatePostInput,
    CreateDomainInput
} from '../types'

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Interceptor to add Supabase auth token
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await supabase.auth.signOut()
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Analytics Service calling Edge Functions
import FingerprintJS from '@fingerprintjs/fingerprintjs'

const fpPromise = FingerprintJS.load()

export const analyticsService = {
    async viewPost(postId: string) {
        try {
            await api.post('/view', { postId })
        } catch (error) {
            console.error('Analytics View Error:', error)
        }
    },


}

export const postsApi = {
    list: async (page = 1, limit = 10): Promise<PostListResponse> => {
        const { data } = await api.get(`/posts?page=${page}&limit=${limit}`)
        return data
    },

    getBySlug: async (slug: string): Promise<{ post: Post }> => {
        const { data } = await api.get(`/posts/${slug}`)
        return data
    },

    adminList: async (page = 1, limit = 10, published?: boolean): Promise<PostListResponse> => {
        let url = `/admin/posts?page=${page}&limit=${limit}`
        if (published !== undefined) {
            url += `&published=${published}`
        }
        const { data } = await api.get(url)
        return data
    },

    getById: async (id: number): Promise<{ post: Post }> => {
        const { data } = await api.get(`/admin/posts/${id}`)
        return data
    },

    create: async (input: CreatePostInput): Promise<{ post: Post }> => {
        const { data } = await api.post('/admin/posts', input)
        return data
    },

    update: async (id: number, input: UpdatePostInput): Promise<{ post: Post }> => {
        const { data } = await api.put(`/admin/posts/${id}`, input)
        return data
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/posts/${id}`)
    },
}

export const domainsApi = {
    list: async (): Promise<{ domains: Domain[] }> => {
        const { data } = await api.get('/admin/domains')
        return data
    },

    create: async (input: CreateDomainInput): Promise<{ domain: Domain; instructions: DNSInstructions }> => {
        const { data } = await api.post('/admin/domains', input)
        return data
    },

    getInstructions: async (id: number): Promise<{ domain: Domain; instructions: DNSInstructions }> => {
        const { data } = await api.get(`/admin/domains/${id}`)
        return data
    },

    verify: async (id: number): Promise<{ domain: Domain }> => {
        const { data } = await api.post(`/admin/domains/${id}/verify`)
        return data
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/domains/${id}`)
    },
}

export const uploadApi = {
    upload: async (file: File): Promise<{ url: string; filename: string }> => {
        const formData = new FormData()
        formData.append('file', file)
        const { data } = await api.post('/admin/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data
    },
}

export default api
